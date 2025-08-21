from services.exchange_rate_service import convert, _latest_snapshot_file
from modules.story_generator import make_story
from modules.translator import json_to_markdown
from typing import Dict, Any
from datetime import datetime

def generate_tax_prompt(data, *, include_appendix: bool = True):
    """
    Generate a prompt for tax advice based on the provided JSON data
    """
    # Extract relevant information from the JSON (robust defaults so the
    # function still works if fields are missing).
    personal_info = data.get('personalInformation', {})
    residency_intentions = data.get('residencyIntentions', {})
    finance_data = data.get('finance', {})
    
    # Get destination country
    destination_country = residency_intentions.get('destinationCountry', {}).get('country', 'Unknown')
    
    # Get current residency
    current_residency = personal_info.get('currentResidency', {}).get('country', 'Unknown')
    
    # -------------------------------------------------------------------
    # Income handling – aggregate all incomeSources amounts
    # -------------------------------------------------------------------
    income_sources = finance_data.get('incomeSources', [])
    if income_sources:
        # For simplicity, take the first source's currency (assume consistent)
        currency = income_sources[0].get('currency', 'USD').upper()
        annual_amount = sum(src.get('amount', 0) for src in income_sources)
    else:
        # Fallback to legacy fields if present
        income = finance_data.get('income', {})
        annual_amount = income.get('annualAmount', 0)
        currency = income.get('currency', 'USD').upper()
    
    # Convert income to USD to provide additional clarity for the LLM
    try:
        annual_amount_usd = convert(float(annual_amount), currency, 'USD')
    except Exception:
        # If conversion fails, fall back to original amount
        annual_amount_usd = None
    
    # Meta header
    snapshot_ts = "unknown"
    latest_snapshot = _latest_snapshot_file()
    if latest_snapshot is not None:
        snapshot_ts = latest_snapshot.stem.replace("_", " ")

    meta = (
        f"Meta Information:\n"
        f"- FX snapshot timestamp: {snapshot_ts} UTC\n"
        f"- Assume tax & immigration regulations current as of {datetime.utcnow().date()}\n\n"
    )

    # Human-readable story
    summary_section = "Key Risks & Opportunities:\n" + build_summary(data) + "\n\n"
    story = meta + summary_section + make_story(data)

    # Instruction for LLM
    instruction = (
        "\n\nPlease provide exhaustive, actionable guidance covering both visa/immigration pathways and tax implications for the individual above. "
        "Ensure the response is structured with clear sections and includes any relevant compliance requirements, deadlines, and form names."
    )

    story += instruction

    # Focused question checklist
    questions = [
        "1. Which residency or visa programmes in the destination country best match this profile (include cost, processing time, and success probability)?",
        "2. Outline the full tax obligations for the first five years after relocation (income, capital gains, wealth, exit taxes).",
        "3. Recommend tax-efficient structures or treaties to minimise double taxation between current and destination countries.",
        "4. List any compliance deadlines or forms (with official form numbers) the individual must file pre- and post-move.",
        "5. Highlight additional steps required for the partner and dependents (e.g., medicals, language tests)."
    ]
    story += (
        "\n\nIf any critical data required for accurate advice is missing or unclear, "
        "list follow-up questions before proceeding.\n\n" +
        "Please answer the following questions in order:\n" + "\n".join(questions)
    )

    if include_appendix:
        appendix = "\n\n---\nRAW PROFILE DUMP (for reference):\n" + json_to_markdown(data)
        prompt = story + appendix
    else:
        prompt = story
    
    return prompt

def build_summary(data: Dict[str, Any]) -> str:
    """Return bullet list of headline risks/opportunities."""
    bullets = []

    # Tax compliance risk
    if data.get("residencyIntentions", {}).get("taxCompliantEverywhere") is False:
        bullets.append("⚠️  Past tax non-compliance may trigger audits/penalties.")

    # Military service
    ms = data.get("residencyIntentions", {}).get("citizenshipPlans", {}).get("militaryService", {})
    if ms and ms.get("willing") is True:
        bullets.append("🪖 Willingness to perform military service could unlock fast-track citizenship routes.")

    # Crypto gains
    crypto_sales = data.get("finance", {}).get("capitalGains", {}).get("futureSales", [])
    if any(s.get("type") == "Crypto" for s in crypto_sales):
        bullets.append("💰 Planned crypto sales may attract special capital-gains treatment.")

    # Language proficiency
    langs = data.get("residencyIntentions", {}).get("languageProficiency", {}).get("individual", {})
    if "Spanish" in langs and langs["Spanish"] >= 3:
        bullets.append("🗣️  Intermediate Spanish will ease visa interviews and integration.")

    if not bullets:
        return "No immediate red-flags detected; proceed with full assessment."

    return "\n".join("- " + b for b in bullets)
