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

from typing import Any

from modules.currency_utils import country_to_currency
from services.exchange_rate_service import convert


def _is_scalar(value: Any) -> bool:
    return isinstance(value, str | int | float | bool) or value is None


def _format_value(key: str, value: Any, context: dict[str, Any], dest_currency: str) -> str:
    """Format leaf value, handling currency conversion when applicable."""

    if isinstance(value, int | float):
        # Check for currency in same dict
        currency = context.get("currency") or context.get("Currency")
        if currency:
            currency = currency.upper()
            if key != "currency":
                try:
                    dest_val = convert(value, currency, dest_currency.upper())
                    usd_val = convert(value, currency, "USD")
                    parts = []
                    dest_cur_up = dest_currency.upper()
                    # Include destination-currency conversion only if it's different from original and not USD
                    if dest_cur_up != currency and dest_cur_up != "USD":
                        parts.append(f"≈{dest_val:,.0f} {dest_cur_up}")
                    # Include USD conversion only when original currency is NOT USD and USD part not identical to original
                    if currency != "USD":
                        parts.append(f"{usd_val:,.0f} USD")
                    suffix = ", ".join(parts)
                    return f"{value} {currency} ({suffix})" if suffix else f"{value} {currency}"
                except Exception:
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
