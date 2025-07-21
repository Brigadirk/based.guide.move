from __future__ import annotations

"""Generate human-readable prose from a validated profile JSON.

The goal is to transform nested raw data into a coherent story so the LLM can
reason more effectively.  We create short paragraphs per section; if a section
is empty we explicitly mention that so the model is aware of missing info.
"""

from typing import Any, Dict, List
from datetime import date, datetime

from modules.currency_utils import country_to_currency
from exchange_rate_fetcher.exchange_rate_service import convert


LINE_BREAK = "\n\n"

def _fmt_date(d: str) -> str:
    try:
        return datetime.strptime(d, "%Y-%m-%d").strftime("%d %B %Y")
    except Exception:
        return d


def _format_money(amount: float, currency: str, dest_currency: str) -> str:
    def fmt(val: float) -> str:
        return f"{val:,.2f}" if abs(val) < 10000 else f"{val:,.0f}"

    try:
        dest_up = dest_currency.upper()
        cur_up = currency.upper()
        conv_dest = convert(amount, currency, dest_currency)
        conv_usd = convert(amount, currency, "USD")

        parts = []
        # destination currency suffix
        if dest_up not in (cur_up, "USD"):
            parts.append(f"≈{fmt(conv_dest)} {dest_up}")
        # USD suffix
        if cur_up != "USD":
            parts.append(f"{fmt(conv_usd)} USD")

        suffix = ", ".join(parts)
        return f"{fmt(amount)} {cur_up} ({suffix})" if suffix else f"{fmt(amount)} {cur_up}"
    except Exception:
        return f"{amount:,.2f} {currency}"


def personal_section(pi: Dict[str, Any]) -> str:
    lines: List[str] = []
    dob = pi.get("dateOfBirth")
    if dob:
        age = int((date.today() - datetime.strptime(dob, "%Y-%m-%d").date()).days / 365.25)
        lines.append(f"The individual was born on {_fmt_date(dob)} (age {age}).")
    ms = pi.get("maritalStatus")
    if ms:
        lines.append(f"Marital status: {ms}.")
    nats_data = pi.get("nationalities", [])
    if nats_data:
        nat_parts = []
        for n in nats_data:
            country = n.get("country")
            if not country:
                continue
            renounce = n.get("willingToRenounce")
            nat_parts.append(f"{country}{' (willing to renounce)' if renounce else ''}")
        lines.append("Nationality/ies held: " + ", ".join(nat_parts) + ".")

    # Current residence details
    res = pi.get("currentResidency", {})
    if res:
        res_country = res.get("country")
        status = res.get("status")
        if res_country and status:
            sent = f"Currently, the individual is a {status.lower()} in {res_country}"
            duration = res.get("duration")
            if duration:
                sent += f" and has lived there for about {duration} year{'s' if duration != 1 else ''}"
            sent += "."
            lines.append(sent)

    # Partner same-sex detail
    if pi.get("relocationPartner"):
        partner_info = pi.get("relocationPartnerInfo", {})
        same_sex = partner_info.get("sameSex")
        rel_type = partner_info.get("relationshipType", "partner")
        if same_sex is not None:
            sex_desc = "same-sex" if same_sex else "opposite-sex"
            lines.append(f"Their relocating {rel_type.lower()} is {sex_desc}.")

        # Relationship duration
        full_years = partner_info.get("fullRelationshipDuration")
        official_years = partner_info.get("officialRelationshipDuration")
        if full_years or official_years:
            dur_sentence = "They have been together"
            if full_years:
                dur_sentence += f" for about {full_years} year{'s' if full_years != 1 else ''} in total"
            if official_years is not None:
                dur_sentence += (
                    (", " if full_years else " ") +
                    f"with {official_years} year{'s' if official_years != 1 else ''} of official status"
                )
            dur_sentence += "."
            lines.append(dur_sentence)

        # Partner nationalities
        p_nats = partner_info.get("partnerNationalities", [])
        if p_nats:
            pn_list = ", ".join(n.get("country") for n in p_nats if n.get("country"))
            if pn_list:
                lines.append(f"Partner holds citizenship of: {pn_list}.")

    # Dependents
    deps = pi.get("relocationDependents", [])
    if deps:
        dep_summaries = []
        for d in deps[:3]:
            rel = d.get("relationship", "dependent")
            dob = d.get("dateOfBirth")
            age_str = ""
            if dob:
                try:
                    age = int((date.today() - datetime.strptime(dob, "%Y-%m-%d").date()).days / 365.25)
                    age_str = f", age {age}"
                except Exception:
                    pass
            student = " (student)" if d.get("isStudent") else ""
            dep_summaries.append(f"{rel}{age_str}{student}")
        more = f" and {len(deps)-3} other(s)" if len(deps) > 3 else ""
        lines.append("Accompanying dependents: " + ", ".join(dep_summaries) + more + ".")

    return " ".join(lines) or "No personal information provided."


def _bool_sentence(flag: bool, when_true: str, when_false: str | None = None) -> str:
    if flag:
        return when_true
    if when_false:
        return when_false
    return ""


def _summarise_language(prof: Dict[str, int]) -> str:
    if not prof:
        return ""
    top = sorted(prof.items(), key=lambda x: x[1], reverse=True)[:3]
    parts = [f"{lang} ({lvl}/5)" for lang, lvl in top]
    return ", ".join(parts)


def residency_section(ri: Dict[str, Any]) -> str:
    if not ri:
        return "No residency intentions provided."

    sentences: List[str] = []

    # Core destination
    dest = ri.get("destinationCountry", {})
    country = dest.get("country") or "an unspecified country"
    move_type = dest.get("moveType", "permanent").lower()
    sent = f"The individual plans a {move_type} move to {country}."
    if move_type == "temporary":
        duration = dest.get("intendedTemporaryDurationOfStay")
        if duration:
            sent = sent.rstrip(".") + f" for approximately {duration} months."
    sentences.append(sent)

    # Residency plans
    rp = ri.get("residencyPlans", {})
    if rp.get("applyForResidency"):
        sentences.append("They intend to apply for legal residency.")
    elif rp:
        sentences.append("They have no immediate plans to obtain residency status.")

    if rp:
        months = rp.get("maxMonthsWillingToReside")
        if months:
            sentences.append(f"They are willing to reside for up to {months} month{'s' if months!=1 else ''} initially.")
        if rp.get("openToVisiting"):
            sentences.append("They are open to short-term visits before a full move.")
        else:
            sentences.append("They are not planning any exploratory visits prior to relocation.")

    # Citizenship ambitions
    cp = ri.get("citizenshipPlans", {})
    if cp:
        interested = cp.get("interestedInCitizenship")
        sentences.append(_bool_sentence(interested, "Ultimately, they wish to obtain citizenship.", "They are not currently pursuing citizenship."))

        # Investment / donation paths
        investment = cp.get("investment", {})
        if investment.get("willing") and investment.get("amount"):
            amt = investment["amount"]
            curr = investment.get("currency", "USD")
            sentences.append(f"They are willing to invest {amt:,} {curr} towards a citizenship-by-investment route.")
        donation = cp.get("donation", {})
        if donation.get("willing") and donation.get("amount"):
            sentences.append(f"They are open to making a donation of {donation['amount']:,} {donation.get('currency', 'USD')} as part of the naturalisation process.")
        elif donation and donation.get("willing") is False:
            sentences.append("They are not willing to pursue a donation-based citizenship route.")

        # Family ties
        ties = cp.get("familyTies", {})
        if ties.get("hasConnections"):
            sentences.append(f"They also have family connections in {country} (closest relation: {ties.get('closestRelation','unspecified')}).")

    # Language proficiency
    lp = ri.get("languageProficiency", {})
    ind_lang = _summarise_language(lp.get("individual", {}))
    if ind_lang:
        sentences.append(f"The individual speaks: {ind_lang}.")
    partner_lang = _summarise_language(lp.get("partner", {}))
    if partner_lang:
        sentences.append(f"Their partner speaks: {partner_lang}.")

    # dependents languages
    dep_langs = lp.get("dependents", [])
    if dep_langs:
        dep_summaries = []
        for d in dep_langs[:3]:
            dep_summary = _summarise_language(d)
            if dep_summary:
                dep_summaries.append(dep_summary)
        if dep_summaries:
            sentences.append("Dependents language abilities: " + "; ".join(dep_summaries) + ".")
        if len(dep_langs) > 3:
            sentences.append(f"…and {len(dep_langs)-3} more dependents' language data.")

    # willing_to_learn
    wtl = lp.get("willing_to_learn", [])
    if wtl:
        sentences.append("They are willing to learn: " + ", ".join(wtl) + ".")
    else:
        sentences.append("They are not currently planning to learn new languages.")

    # can_teach
    ct = lp.get("can_teach", {})
    if ct:
        teach_langs = ", ".join(ct.keys())
        sentences.append("They can teach: " + teach_langs + ".")

    # other_languages informal
    other = lp.get("other_languages", {})
    if other:
        other_desc = "; ".join(f"{lang} ({level})" for lang, level in other.items())
        sentences.append("Other language exposure: " + other_desc + ".")

    # Centre of life ties
    col = ri.get("centerOfLife", {})
    ties_text = col.get("tiesDescription")
    if col.get("maintainsSignificantTies"):
        sentences.append("They maintain significant ties to their current country (" + (ties_text or "details not specified") + ").")
    elif ties_text:
        sentences.append("Regarding centre-of-life ties, they note: " + ties_text + ".")

    # Tax compliance
    if ri.get("taxCompliantEverywhere") is False:
        sentences.append("They are **not** tax compliant in all jurisdictions, which may pose compliance risks.")

    # Military service willingness
    msrv = cp.get("militaryService", {}) if cp else {}
    if msrv:
        willing = msrv.get("willing")
        yrs = msrv.get("maxServiceYears")
        if willing:
            sentences.append(
                f"They are willing to perform up to {yrs} year{'s' if yrs!=1 else ''} of military service if required."
            )
        else:
            sentences.append("They are not willing to perform mandatory military service.")

    return " ".join(sentences)


def _summarise_income_sources(sources: List[Dict[str, Any]], dest_currency: str) -> str:
    if not sources:
        return ""
    # Compute total in USD to handle mixed currencies, then convert to dest
    total_usd = 0.0
    for src in sources:
        amt = src.get("amount", 0)
        cur = src.get("currency", "USD")
        try:
            total_usd += convert(amt, cur, "USD")
        except Exception:
            total_usd += amt  # fallback assume original is USD

    total_dest = convert(total_usd, "USD", dest_currency)
    lines = [
        f"They have {len(sources)} active income source{'s' if len(sources)!=1 else ''} totalling "
        f"{total_dest:,.0f} {dest_currency.upper()} ({total_usd:,.0f} USD) per year."
    ]
    for src in sources:
        cat = src.get("category", "Unknown")
        amt = _format_money(src.get("amount", 0), src.get("currency", "USD"), dest_currency)
        country = src.get("country", "")
        cont = "will continue after moving" if src.get("continue_in_destination") else "will cease upon relocation"
        lines.append(f"• {cat} income of {amt} from {country or 'various'}, which {cont}.")
    return " " .join(lines)


def _mixed_total(items: List[Dict[str, Any]], amount_key: str, currency_key: str = "currency") -> float:
    total = 0.0
    for itm in items:
        amt = itm.get(amount_key, 0)
        cur = itm.get(currency_key, "USD")
        try:
            total += convert(amt, cur, "USD")
        except Exception:
            total += amt  # assume USD if conversion fails
    return total


def _summarise_liabilities(liabs: List[Dict[str, Any]], dest_currency: str) -> str:
    if not liabs:
        return ""
    total_usd = _mixed_total(liabs, "amount")
    total_dest = convert(total_usd, "USD", dest_currency)
    return (
        f"Liabilities amount to {total_dest:,.0f} {dest_currency.upper()} ({total_usd:,.0f} USD) across {len(liabs)} obligation(s)."
    )


def _summarise_capital_gains(cg: Dict[str, Any], dest_currency: str) -> str:
    future = cg.get("futureSales", [])
    if not future:
        return ""
    tot_usd = _mixed_total(future, "surplus_value")
    tot_dest = convert(tot_usd, "USD", dest_currency)
    lines = [
        f"They plan to sell {len(future)} asset(s) in their first year after moving, expecting total gains of "
        f"{tot_dest:,.0f} {dest_currency.upper()} ({tot_usd:,.0f} USD)."
    ]
    for sale in future[:3]:
        asset = sale.get("asset", "asset")
        gain = _format_money(sale.get("surplus_value", 0), sale.get("currency", "USD"), dest_currency)
        lines.append(f"• {asset} with expected profit {gain} (holding {sale.get('holding_time','N/A')}).")
    if len(future) > 3:
        lines.append(f"…and {len(future)-3} more planned sales.")

    # Include previous gains if available
    past = cg.get("details", [])
    if past:
        past_tot = sum(p.get("gain", 0) for p in past)
        pcurr = past[0].get("currency", "USD")
        lines.append(
            f"They have already realised gains of {_format_money(past_tot, pcurr, dest_currency)} this year from {len(past)} disposal(s)."
        )
        for p in past[:3]:
            asset = p.get("asset", "asset")
            gain = _format_money(p.get("gain", 0), p.get("currency", "USD"), dest_currency)
            lines.append(f"• {asset}: realised gain {gain}.")

    return " ".join(lines)


def finance_section(fin: Dict[str, Any], dest_currency: str) -> str:
    parts: List[str] = []

    tw = fin.get("totalWealth")
    if tw and tw.get("total"):
        parts.append(
            f"Reported net worth is {_format_money(tw['total'], tw.get('currency', 'USD'), dest_currency)}; "
            f"primary residence accounts for {tw.get('primary_residence', 0):,.0f} {tw.get('currency','USD')}."
        )

    income_sources = fin.get("incomeSources", [])
    if not income_sources:
        parts.append("They do not currently earn any income.")
    parts.append(_summarise_income_sources(income_sources, dest_currency))

    exp_jobs = fin.get("expectedEmployment", [])
    if not exp_jobs:
        parts.append("They have not outlined any expected employment opportunities yet.")
    parts.append(_summarise_income_sources(exp_jobs, dest_currency))
    if exp_jobs:
        for j in exp_jobs[:3]:
            role = j.get("fields", {}).get("role", "a role")
            employer = j.get("fields", {}).get("employer", "an employer")
            salary = _format_money(j.get("amount", 0), j.get("currency", "USD"), dest_currency)
            parts.append(f"• Anticipated employment as {role} at {employer} earning {salary}.")

    parts.append(_summarise_capital_gains(fin.get("capitalGains", {}), dest_currency))

    liabs = fin.get("liabilities", [])
    parts.append(_summarise_liabilities(liabs, dest_currency))
    if not liabs:
        parts.append("They report no outstanding liabilities.")
    if liabs:
        for l in liabs[:3]:
            cat = l.get("category", "Liability")
            amt = _format_money(l.get("amount", 0), l.get("currency", "USD"), dest_currency)
            lender = l.get("fields", {}).get("lender", "an institution")
            parts.append(f"• {cat} with {lender}: {amt} outstanding.")

    # Assets summary
    assets = fin.get("assets", {})
    if assets:
        asset_sentences = []
        for key, label in [
            ("realEstate", "real-estate property"),
            ("financial", "financial asset"),
            ("taxAdvantagedAccounts", "tax-advantaged account"),
            ("cryptocurrency", "cryptocurrency holding"),
        ]:
            items = assets.get(key, [])
            if items:
                asset_sentences.append(f"{len(items)} {label}{'s' if len(items)!=1 else ''}")
        if asset_sentences:
            parts.append("They hold " + ", ".join(asset_sentences) + ".")
        else:
            parts.append("They have not listed any significant assets.")

        # list details for first few assets in each category
        for key, label in [
            ("realEstate", "property"),
            ("financial", "financial asset"),
            ("cryptocurrency", "crypto holding"),
        ]:
            items = assets.get(key, [])
            for itm in items[:2]:
                desc = itm.get("description") or itm.get("asset") or label
                val = itm.get("value") or itm.get("amount")
                curr = itm.get("currency", "USD")
                if val:
                    val_str = _format_money(val, curr, dest_currency)
                    parts.append(f"• {desc}: {val_str}.")
                else:
                    parts.append(f"• {desc} (value not specified).")

    # Filter empties
    parts = [p for p in parts if p]

    return " " .join(parts) if parts else "No financial data provided."


def education_section(edu: Dict[str, Any]) -> str:
    if not edu:
        return "No education data provided."

    segments: List[str] = []

    if edu.get("isStudent"):
        school = edu.get("currentSchool") or "an unspecified institution"
        field = edu.get("currentFieldOfStudy") or "various subjects"
        segments.append(f"The individual is currently studying {field} at {school}.")
    else:
        segments.append("The individual is not currently enrolled as a student.")

    # Previous degrees
    prev = edu.get("previousDegrees", [])
    if prev:
        highest = prev[0]
        segments.append(
            f"Highest completed degree: {highest.get('degree','a degree')} from {highest.get('institution','an institution')} ({highest.get('end_year','N/A')})."
        )
        if len(prev) > 1:
            others = [d.get("degree") for d in prev[1:4] if d.get("degree")]
            if others:
                segments.append("Other degrees: " + ", ".join(others) + (" …" if len(prev) > 4 else "") + ".")

    # Visa skills with credential details
    vskills = edu.get("visaSkills", [])
    if vskills:
        lines = []
        for vs in vskills[:3]:
            skill = vs.get("skill")
            cred = vs.get("credential_name")
            inst = vs.get("credential_institute")
            if skill:
                detail = skill
                if cred:
                    detail += f" ({cred}" + (f", {inst}" if inst else "") + ")"
                lines.append(detail)
        segments.append("Visa-relevant skills: " + "; ".join(lines) + ".")
        if len(vskills) > 3:
            segments.append(f"…and {len(vskills)-3} more skills.")

    # Future study interests
    if edu.get("interestedInStudying"):
        segments.append("They are interested in pursuing further studies in the destination country.")
    else:
        segments.append("They are not looking to study in the destination country.")

    # Learning interests
    li = [l for l in edu.get("learningInterests", []) if l]
    if li:
        segments.append("Learning interests include: " + ", ".join(li) + ".")

    # School offers
    offers = [o for o in edu.get("schoolOffers", []) if o]
    if offers:
        segments.append(f"They have received {len(offers)} offer(s) from educational institutions.")
        for off in offers[:3]:
            sch = off.get("school", "an institution")
            prog = off.get("program", "a programme")
            year = off.get("year", "N/A")
            status = off.get("financial_status", "")
            segments.append(f"• Offer from {sch} for {prog} ({year}) – {status}.")
        if len(offers) > 3:
            segments.append(f"…and {len(offers)-3} more offers.")

    return " ".join(segments)


def ssp_section(ssp: Dict[str, Any], dest_currency: str) -> str:
    if not ssp:
        return "No social-security or pension information provided."

    segments: List[str] = []

    curr = ssp.get("currentCountryContributions", {})
    if curr.get("isContributing") and curr.get("country"):
        yrs = curr.get("yearsOfContribution", 0)
        segments.append(
            f"They are currently contributing to the social-security system in {curr['country']} (about {yrs} years credited)."
        )
    else:
        segments.append("They are not presently contributing to any social-security system.")

    future = ssp.get("futurePensionContributions", {})
    if future.get("isPlanning"):
        segments.append("They plan to continue pension contributions after relocation.")
        details = future.get("details", [])
        if details:
            for d in details[:3]:
                plan = d.get("planType", "a pension scheme")
                amt = d.get("amount") or d.get("expectedAnnual") or 0
                curr = d.get("currency", "USD")
                if amt:
                    amt_str = _format_money(amt, curr, dest_currency)
                    segments.append(f"• Expected contribution of {amt_str} into {plan}.")
                else:
                    segments.append(f"• Plans to contribute to {plan} (amount not specified).")
            if len(details) > 3:
                segments.append(f"…and {len(details)-3} more contribution plan(s).")
    else:
        segments.append("They are not presently contributing to any social-security system.")

    existing = ssp.get("existingPlans", {})
    if existing.get("hasPlans"):
        details = existing.get("details", [])
        total = sum(d.get("currentValue", 0) for d in details)
        currency = details[0].get("currency", "USD") if details else "USD"
        segments.append(
            f"They hold {len(details)} existing pension plan(s) valued at approximately {_format_money(total, currency, dest_currency)}."
        )
        for plan in details[:3]:
            ptype = plan.get("planType", "Pension plan")
            val = _format_money(plan.get("currentValue", 0), plan.get("currency", "USD"), dest_currency)
            country = plan.get("country", "various countries")
            segments.append(f"• {ptype} in {country}: current value {val}.")
        if len(details) > 3:
            segments.append(f"…and {len(details)-3} more pension plans.")

    return " ".join(segments)


def future_plans_section(fut: Dict[str, Any], dest_currency: str) -> str:
    if not fut:
        return "No future financial plans specified."

    segs: List[str] = []

    def _detail(items: List[Dict[str, Any]], label: str):
        if not items:
            return ""
        sentences = []
        sentences.append(f"They are considering {len(items)} {label}{'s' if len(items)!=1 else ''}.")
        for itm in items[:3]:
            desc = itm.get("description") or itm.get("asset") or itm.get("type") or label
            amt = itm.get("amount") or itm.get("value")
            curr = itm.get("currency", "USD")
            if amt:
                amt_str = _format_money(amt, curr, dest_currency)
                sentences.append(f"• {desc}: {amt_str}.")
            else:
                sentences.append(f"• {desc}.")
        if len(items) > 3:
            sentences.append(f"…and {len(items)-3} more.")
        return " " .join(sentences)

    segs.extend(
        filter(
            None,
            [
                _detail(fut.get("plannedInvestments", []), "investment"),
                _detail(fut.get("plannedPropertyTransactions", []), "property transaction"),
                _detail(fut.get("plannedRetirementContributions", []), "retirement contribution"),
                _detail(fut.get("plannedBusinessChanges", []), "business change"),
            ],
        )
    )

    return " " .join(segs) if segs else "No significant future financial moves are planned."


def deductions_section(ded: Dict[str, Any], dest_currency: str) -> str:
    lst = ded.get("potentialDeductions", []) if ded else []
    if not lst:
        return "No potential deductions or credits reported."

    total_usd = _mixed_total(lst, "amount")
    total_dest = convert(total_usd, "USD", dest_currency)
    segs = [
        f"They have identified {len(lst)} potential deduction/credit item(s) totalling {total_dest:,.0f} {dest_currency.upper()} ({total_usd:,.0f} USD)."
    ]
    for item in lst[:3]:
        desc = item.get("description", "deduction")
        amt = _format_money(item.get("amount", 0), item.get("currency", "USD"), dest_currency)
        segs.append(f"• {desc}: {amt}.")
    additional = lst[3:10]
    for item in additional:
        desc = item.get("description", "deduction")
        amt = _format_money(item.get("amount", 0), item.get("currency", "USD"), dest_currency)
        segs.append(f"• {desc}: {amt}.")
    if len(lst) > 10:
        segs.append(f"…and {len(lst)-10} more deduction entries.")
    return " " .join(segs)


def additional_section(add: Dict[str, Any]) -> str:
    if not add:
        return "No additional information provided."

    notes = add.get("generalNotes")
    special = add.get("specialSections", [])
    segs = []
    if notes:
        segs.append(f"General notes: {notes}.")
    if special:
        for sec in special[:2]:
            segs.append(f"User note: {sec[:200]}{'…' if len(sec)>200 else ''}")
        if len(special) > 2:
            segs.append(f"…and {len(special)-2} more note sections.")
    return " " .join(segs) if segs else "No additional comments."


def make_story(profile: Dict[str, Any]) -> str:
    dest_country = profile.get("residencyIntentions", {}).get("destinationCountry", {}).get("country", "")
    dest_currency = country_to_currency(dest_country) if dest_country else "USD"

    sections = [
        ("Residency Plans", residency_section(profile.get("residencyIntentions", {}))),
        ("Finance", finance_section(profile.get("finance", {}), dest_currency)),
        ("Personal Information", personal_section(profile.get("personalInformation", {}))),
        ("Education", education_section(profile.get("education", {}))),
        ("Social Security & Pensions", ssp_section(profile.get("socialSecurityAndPensions", {}), dest_currency)),
        ("Future Financial Plans", future_plans_section(profile.get("futureFinancialPlans", {}), dest_currency)),
        ("Tax Deductions & Credits", deductions_section(profile.get("taxDeductionsAndCredits", {}), dest_currency)),
        ("Additional Information", additional_section(profile.get("additionalInformation", {}))),
    ]

    # Fallback: any other sections not explicitly handled
    handled = {
        "residencyIntentions",
        "finance",
        "personalInformation",
        "education",
        "socialSecurityAndPensions",
        "futureFinancialPlans",
        "taxDeductionsAndCredits",
        "additionalInformation",
    }
    for key, value in sorted(profile.items()):
        if key in handled:
            continue
        if isinstance(value, dict) and value:
            from modules.translator import json_to_markdown  # local import to avoid circular
            sections.append((key, json_to_markdown(value)))
        elif isinstance(value, list) and value:
            from modules.translator import json_to_markdown
            sections.append((key, json_to_markdown({key: value})))
        else:
            sections.append((key, "No information provided."))

    paragraphs = [f"{name.replace('_', ' ').title()}:\n{text}" for name, text in sections]
    return LINE_BREAK.join(paragraphs) 