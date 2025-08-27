from __future__ import annotations

"""Generic JSON → Markdown translator used to ensure *all* data is included in
the LLM prompt.

The algorithm walks the entire JSON object depth-first and emits a hierarchical
bullet list.  Arrays are numbered, dictionaries are traversed alphabetically to
produce deterministic output.

Currency conversion: if a dictionary contains numeric `amount`/**value** field
that is accompanied by a `currency` field, the translator will append the USD
conversion in parentheses using the exchange-rate service.
"""

from datetime import datetime
from typing import Any

from modules.currency_utils import country_to_currency
from services.exchange_rate_service import convert, _latest_snapshot_file


def _get_exchange_rate_date() -> str:
    """Get the date of the exchange rate calculation."""
    try:
        latest_file = _latest_snapshot_file()
        if latest_file and latest_file.exists():
            # Extract date from filename (format: YYYY-MM-DD_HH-MM-SS.json)
            filename = latest_file.stem  # Remove .json extension
            if filename.endswith("_fallback"):
                filename = filename[:-9]  # Remove _fallback suffix
            date_part = filename.split("_")[0]  # Get YYYY-MM-DD part
            return datetime.strptime(date_part, "%Y-%m-%d").strftime("%d %B %Y")
    except Exception:
        pass
    return datetime.now().strftime("%d %B %Y")


def _is_scalar(value: Any) -> bool:
    return isinstance(value, str | int | float | bool) or value is None


def _format_value(key: str, value: Any, context: dict[str, Any], dest_currency: str) -> str:
    """Format leaf value following structure: X <target currency> (calculated <date>) (X <input currency> (reported currency))"""

    if isinstance(value, int | float):
        # Check for currency in same dict
        currency = context.get("currency") or context.get("Currency")
        if currency:
            currency = currency.upper()
            dest_cur_up = dest_currency.upper()
            if key != "currency":
                try:
                    # Always convert to destination currency and show both with calculation date
                    if dest_cur_up != currency:
                        dest_val = convert(value, currency, dest_cur_up)
                        calc_date = _get_exchange_rate_date()
                        return f"{dest_val:,.0f} {dest_cur_up} (calculated {calc_date}) ({value:,.0f} {currency} (reported currency))"
                    else:
                        # Same currency, no conversion needed
                        return f"{value:,.0f} {dest_cur_up}"
                except Exception:
                    # Fallback: show original amount if conversion fails
                    return f"{value} {currency}"
    return str(value)


def _walk(node: Any, lines: list[str], indent: int, parent_ctx: dict[str, Any], dest_currency: str):
    prefix = "  " * indent + "- "

    if _is_scalar(node):
        lines.append(prefix + _format_value("", node, parent_ctx, dest_currency))
        return

    if isinstance(node, list):
        for idx, item in enumerate(node, 1):
            lines.append(prefix + f"[{idx}]")
            _walk(
                item,
                lines,
                indent + 1,
                item if isinstance(item, dict) else parent_ctx,
                dest_currency,
            )
        return

    if isinstance(node, dict):
        for k in sorted(node.keys()):
            lines.append(prefix + f"{k}:")
            _walk(node[k], lines, indent + 1, node, dest_currency)
        return

    # fallback
    lines.append(prefix + str(node))


def json_to_markdown(data: dict[str, Any]) -> str:
    """Return a deterministic markdown representation of *data*."""
    dest_country = (
        data.get("residencyIntentions", {}).get("destinationCountry", {}).get("country", "")
    )
    dest_currency = country_to_currency(dest_country) if dest_country else "USD"
    lines: list[str] = []
    _walk(data, lines, 0, data, dest_currency)
    return "\n".join(lines)
