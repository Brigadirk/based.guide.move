import json
from functools import lru_cache
from pathlib import Path

# Single source of truth: Next.js data directory
COUNTRY_INFO_PATH = Path(__file__).resolve().parents[2] / "frontend" / "data" / "country_info.json"


@lru_cache(maxsize=1)
def _load_mapping() -> dict[str, str]:
    """Load country to currency mapping from the single source of truth."""
    if COUNTRY_INFO_PATH.exists():
        try:
            data = json.loads(COUNTRY_INFO_PATH.read_text())
            return {
                country: info.get("currency_shorthand", "USD") for country, info in data.items()
            }
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Error loading country info: {e}")
    else:
        print(f"Country info file not found: {COUNTRY_INFO_PATH}")
    return {}


def country_to_currency(country_name: str) -> str:
    """Return ISO currency code for *country_name* or 'USD' as fallback."""
    mapping = _load_mapping()
    return mapping.get(country_name, "USD")
