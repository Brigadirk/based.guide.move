import json
from pathlib import Path
from functools import lru_cache

# Path lookup: try next_js then fallback
COUNTRY_INFO_PATHS = [
    Path(__file__).resolve().parents[2] / "base_recommender_next_js" / "data" / "country_info.json",
    Path(__file__).resolve().parents[2] / "base_recommender" / "app_components" / "country_info" / "country_info.json",
    Path(__file__).resolve().parents[1] / "exchange_rate_fetcher" / "country_info.json",
]


@lru_cache(maxsize=1)
def _load_mapping() -> dict[str, str]:
    for p in COUNTRY_INFO_PATHS:
        if p.exists():
            data = json.loads(p.read_text())
            return {country: info.get("currency_shorthand", "USD") for country, info in data.items()}
    return {}


def country_to_currency(country_name: str) -> str:
    """Return ISO currency code for *country_name* or 'USD' as fallback."""
    mapping = _load_mapping()
    return mapping.get(country_name, "USD") 