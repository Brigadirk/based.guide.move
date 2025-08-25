from __future__ import annotations

"""Utilities for fetching, caching and consuming foreign-exchange rates.

This module is responsible for:
1. Downloading the latest FX rates from openexchangerates.org (daily).
2. Persisting each snapshot as a timestamped JSON file on disk so that we can
   inspect historical rates if needed.
3. Loading the most-recent snapshot into memory on demand.
4. Converting amounts between currencies (rates are **USD-based**).

It is designed to be used by the background scheduler configured in `app.py`,
but can also be imported directly from other modules.
"""

import json
import os
import re
import time
from datetime import datetime
from pathlib import Path

import requests

from config import Config

# ---------------------------------------------------------------------------
# Constants & paths
# ---------------------------------------------------------------------------


# Store snapshots - Railway volume support
def _get_exchange_rates_folder() -> Path:
    """Get exchange rates folder with Railway volume support."""
    # Prefer a dedicated exchange rates volume if configured
    if getattr(Config, "EXCHANGE_RATES_VOLUME_PATH", ""):
        folder = Path(Config.EXCHANGE_RATES_VOLUME_PATH)
    else:
        # Check if a generic Railway volume mount is available
        volume_path = Config.RAILWAY_VOLUME_MOUNT_PATH
        if volume_path and volume_path != "/app/data":
            folder = Path(volume_path) / "exchange_rates"
        elif Config.is_railway():
            # Default Railway volume path
            folder = Path("/app/data") / "exchange_rates"
        else:
            # Fallback to local folder for development
            folder = Path(__file__).resolve().parent / "exchange_rates"

    try:
        folder.mkdir(exist_ok=True, parents=True)
    except (OSError, PermissionError) as e:
        print(f"Warning: Could not create exchange rates folder {folder}: {e}")
        # Fallback to temp directory for Railway deployments with read-only filesystem
        import tempfile

        temp_folder = Path(tempfile.gettempdir()) / "exchange_rates"
        temp_folder.mkdir(exist_ok=True, parents=True)
        print(f"Using temporary folder: {temp_folder}")
        return temp_folder

    return folder


EXCHANGE_RATES_FOLDER = _get_exchange_rates_folder()

# Legacy root-level location (from previous iteration)
LEGACY_FOLDER = EXCHANGE_RATES_FOLDER.parent  # parent dir holds old flat files

OPEN_EXCHANGE_API_URL = (
    f"https://openexchangerates.org/api/latest.json?app_id={Config.OPEN_EXCHANGE_API_KEY}"
)

# Global variable storing path of rates loaded last
LAST_SNAPSHOT_PATH: Path | None = None

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _latest_snapshot_file() -> Path | None:
    """Return the most-recently created snapshot file (including legacy dir)."""
    ts_pattern = re.compile(r"\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}(_fallback)?\.json$")

    # Ensure the exchange rates folder exists
    EXCHANGE_RATES_FOLDER.mkdir(parents=True, exist_ok=True)

    try:
        candidates = [p for p in EXCHANGE_RATES_FOLDER.glob("*.json") if ts_pattern.match(p.name)]
        # include legacy flat files for migration
        if LEGACY_FOLDER.exists():
            candidates.extend([p for p in LEGACY_FOLDER.glob("*.json") if ts_pattern.match(p.name)])
    except Exception as e:
        print(f"Warning: Could not access exchange rates folder: {e}")
        return None

    if not candidates:
        return None

    def _ts(file: Path):
        try:
            stem = file.stem  # 'YYYY-MM-DD_HH-MM-SS' or 'YYYY-MM-DD_HH-MM-SS_fallback'
            # Remove _fallback suffix if present
            if stem.endswith("_fallback"):
                stem = stem[:-9]  # Remove '_fallback'
            return datetime.strptime(stem, "%Y-%m-%d_%H-%M-%S")
        except ValueError:
            # fallback to ctime if name not parsable
            return datetime.fromtimestamp(os.path.getctime(file))

    latest = max(candidates, key=_ts)

    # If latest is in legacy root, move it into new folder
    if latest.parent == LEGACY_FOLDER:
        new_path = EXCHANGE_RATES_FOLDER / latest.name
        if not new_path.exists():
            new_path.write_text(latest.read_text())
        latest = new_path
    return latest


def _hours_since(file: Path) -> float:
    """Compute the number of hours elapsed since the given file was created."""
    seconds = time.time() - os.path.getctime(file)
    return seconds / 3600


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def fetch_and_save_latest_rates(force: bool = False) -> None:
    """Fetch fresh FX rates and save them to disk.

    The function respects Config.EXCHANGE_UPDATE_INTERVAL_HOURS. If a snapshot
    newer than that already exists, the call is a no-op **unless** `force=True`.

    If no API key is configured, this function will skip fetching and use
    existing snapshots if available, or create a minimal fallback.
    """
    # Check if API key is available
    if not Config.OPEN_EXCHANGE_API_KEY:
        print("Warning: OPEN_EXCHANGE_API_KEY not configured, creating fallback exchange rates")
        latest = _latest_snapshot_file()
        if latest is None:
            # Create a minimal fallback exchange rates file for basic functionality
            _create_fallback_exchange_rates()
            print(f"Created fallback exchange rates file in {EXCHANGE_RATES_FOLDER}")
        else:
            print(f"Using existing exchange rates snapshot: {latest}")
        return

    latest_file = _latest_snapshot_file()
    if not force and latest_file is not None:
        if _hours_since(latest_file) < Config.EXCHANGE_UPDATE_INTERVAL_HOURS:
            # Recent snapshot present — nothing to do.
            return

    try:
        response = requests.get(OPEN_EXCHANGE_API_URL, timeout=10)
        response.raise_for_status()
        data = response.json()
    except Exception as fetch_exc:
        # Fetch failed; log and copy previous snapshot if available
        latest = _latest_snapshot_file()
        if latest is None:
            print(
                f"Warning: Failed to fetch exchange rates and no previous snapshot exists: {fetch_exc}"
            )
            # Create a minimal fallback instead of crashing
            _create_fallback_exchange_rates()
            return
        # Reuse data from latest snapshot
        with open(latest, encoding="utf-8") as f:
            data = json.load(f)
        # We will still create a new file with today's timestamp to bump freshness
        print(
            f"[WARN] Exchange-rate fetch failed ({fetch_exc}); reusing latest snapshot {latest.name}"
        )

    timestamp = datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")
    out_file = EXCHANGE_RATES_FOLDER / f"{timestamp}.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Trim backlog – keep only 3 most recent snapshots
    files = sorted(
        EXCHANGE_RATES_FOLDER.glob("*.json"), key=lambda p: os.path.getctime(p), reverse=True
    )
    for old in files[3:]:
        try:
            old.unlink()
        except Exception:
            pass


def get_latest_rates() -> dict[str, float]:
    """Load rates from the newest snapshot on disk.

    If no snapshot exists, it will attempt to fetch one synchronously.
    For Railway deployments with ephemeral storage, this ensures rates are always available.
    """
    latest_file = _latest_snapshot_file()

    # Check if file exists and is recent enough
    file_is_fresh = False
    if latest_file and latest_file.exists():
        try:
            hours_old = _hours_since(latest_file)
            file_is_fresh = hours_old < Config.EXCHANGE_UPDATE_INTERVAL_HOURS
            if not file_is_fresh:
                print(f"Exchange rates file is {hours_old:.1f} hours old, needs refresh")
        except Exception as e:
            print(f"Could not check file age: {e}")

    # If no file or file is stale, try to fetch fresh rates
    if latest_file is None or not file_is_fresh:
        print("Attempting to fetch fresh exchange rates...")
        try:
            fetch_and_save_latest_rates(force=True)
            latest_file = _latest_snapshot_file()
        except Exception as e:
            print(f"Failed to fetch fresh rates: {e}")
            # If we have an old file, use it rather than failing completely
            if latest_file and latest_file.exists():
                print("Using stale exchange rates file as fallback")
            else:
                latest_file = None

    if latest_file is None:
        raise RuntimeError("Unable to fetch exchange rates — no snapshot available.")

    global LAST_SNAPSHOT_PATH
    LAST_SNAPSHOT_PATH = latest_file
    with open(latest_file, encoding="utf-8") as f:
        return json.load(f).get("rates", {})


def convert(amount: float, source: str, target: str) -> float:
    """Convert *amount* from *source* currency to *target* currency.

    Rates are assumed to use **USD as the base** (as provided by OpenExchange).
    """
    source = source.upper()
    target = target.upper()

    if source == target:
        return amount

    rates = get_latest_rates()

    if source != "USD" and source not in rates:
        print(f"[WARN] Exchange rate for '{source}' not found in snapshot – conversion ignored.")
        raise ValueError(f"Unknown source currency '{source}'.")
    if target != "USD" and target not in rates:
        print(
            f"[WARN] Exchange rate for '{target}' not found in {LAST_SNAPSHOT_PATH}. Available keys: {list(rates.keys())[:10]} … total {len(rates)}"
        )
        raise ValueError(f"Unknown target currency '{target}'.")

    # Convert to USD first
    if source == "USD":
        usd_amount = amount
    else:
        usd_amount = amount / rates[source]

    # From USD to target
    if target == "USD":
        return usd_amount
    return usd_amount * rates[target]


def _create_fallback_exchange_rates() -> None:
    """Create a minimal fallback exchange rates file for basic functionality.

    This is used when no API key is configured and no previous snapshots exist.
    Contains basic exchange rates for common currencies to prevent total failure.
    """
    # Basic exchange rates (USD base) - these are approximate and for fallback only
    fallback_rates = {
        "USD": 1.0,
        "EUR": 0.85,
        "GBP": 0.73,
        "CAD": 1.35,
        "AUD": 1.45,
        "CHF": 0.88,
        "JPY": 150.0,
        "CNY": 7.2,
        "SEK": 10.5,
        "DKK": 6.8,
        "NOK": 10.8,
        "PLN": 4.0,
        "CZK": 22.5,
        "HUF": 360.0,
        "RON": 4.6,
        "BGN": 1.8,
        "TRY": 28.0,
        "RUB": 90.0,
        "INR": 83.0,
        "BRL": 5.0,
        "MXN": 17.0,
        "ZAR": 18.5,
    }

    # Create the data structure expected by the exchange rate system
    fallback_data = {
        "disclaimer": "Fallback exchange rates - not for production use",
        "license": "https://openexchangerates.org/license",
        "timestamp": int(time.time()),
        "base": "USD",
        "rates": fallback_rates,
    }

    # Ensure the exchange rates directory exists
    EXCHANGE_RATES_FOLDER.mkdir(parents=True, exist_ok=True)

    # Create fallback file with current timestamp
    timestamp = datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")
    fallback_file = EXCHANGE_RATES_FOLDER / f"{timestamp}_fallback.json"

    with open(fallback_file, "w", encoding="utf-8") as f:
        json.dump(fallback_data, f, indent=2, ensure_ascii=False)

    print(f"Created fallback exchange rates file: {fallback_file}")
    print("Note: These are approximate rates for basic functionality only")
