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
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional
import re

import requests

from config import Config

# ---------------------------------------------------------------------------
# Constants & paths
# ---------------------------------------------------------------------------

# Store snapshots inside dedicated subfolder 'exchange_rates'
EXCHANGE_RATES_FOLDER = Path(__file__).resolve().parent / "exchange_rates"
EXCHANGE_RATES_FOLDER.mkdir(exist_ok=True)

# Legacy root-level location (from previous iteration)
LEGACY_FOLDER = EXCHANGE_RATES_FOLDER.parent  # parent dir holds old flat files

OPEN_EXCHANGE_API_URL = (
    f"https://openexchangerates.org/api/latest.json?app_id={Config.OPEN_EXCHANGE_API_KEY}"
)

# Global variable storing path of rates loaded last
LAST_SNAPSHOT_PATH: Optional[Path] = None

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _latest_snapshot_file() -> Optional[Path]:
    """Return the most-recently created snapshot file (including legacy dir)."""
    ts_pattern = re.compile(r"\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$")

    candidates = [p for p in EXCHANGE_RATES_FOLDER.glob("*.json") if ts_pattern.match(p.name)]
    # include legacy flat files for migration
    candidates.extend([p for p in LEGACY_FOLDER.glob("*.json") if ts_pattern.match(p.name)])
    if not candidates:
        return None

    def _ts(file: Path):
        try:
            stem = file.stem  # 'YYYY-MM-DD_HH-MM-SS'
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
    """
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
            raise RuntimeError("Unable to fetch exchange rates and no previous snapshot exists") from fetch_exc
        # Reuse data from latest snapshot
        with open(latest, "r", encoding="utf-8") as f:
            data = json.load(f)
        # We will still create a new file with today's timestamp to bump freshness
        print(f"[WARN] Exchange-rate fetch failed ({fetch_exc}); reusing latest snapshot {latest.name}")

    timestamp = datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")
    out_file = EXCHANGE_RATES_FOLDER / f"{timestamp}.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Trim backlog – keep only 3 most recent snapshots
    files = sorted(EXCHANGE_RATES_FOLDER.glob("*.json"), key=lambda p: os.path.getctime(p), reverse=True)
    for old in files[3:]:
        try:
            old.unlink()
        except Exception:
            pass


def get_latest_rates() -> Dict[str, float]:
    """Load rates from the newest snapshot on disk.

    If no snapshot exists, it will attempt to fetch one synchronously.
    """
    latest_file = _latest_snapshot_file()
    if latest_file is None:
        # Try to fetch; if fails we will error later
        try:
            fetch_and_save_latest_rates(force=True)
        except Exception:
            pass
        latest_file = _latest_snapshot_file()

    if latest_file is None:
        raise RuntimeError("Unable to fetch exchange rates — no snapshot available.")

    global LAST_SNAPSHOT_PATH
    LAST_SNAPSHOT_PATH = latest_file
    with open(latest_file, "r", encoding="utf-8") as f:
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
        print(f"[WARN] Exchange rate for '{target}' not found in {LAST_SNAPSHOT_PATH}. Available keys: {list(rates.keys())[:10]} … total {len(rates)}")
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