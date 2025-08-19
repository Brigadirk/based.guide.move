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
from modules.eu_utils import can_move_within_eu, has_eu_citizenship, is_eu_country


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
        # destination currency suffix (if different from original)
        if dest_up != cur_up:
            parts.append(f"≈{fmt(conv_dest)} {dest_up}")
        # No USD conversion needed since we only show destination currency

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
        if nat_parts:
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

    # Partner information
    partner_info = pi.get("relocationPartnerInfo", {})
    has_partner = pi.get("relocationPartner", False)  # Check the top-level field
    
    if has_partner and partner_info:
        rel_type = partner_info.get("relationshipType", "partner")
        
        # Basic partner info
        same_sex = partner_info.get("sameSex")
        if same_sex is not None:
            sex_desc = "same-sex" if same_sex else "opposite-sex"
            lines.append(f"They are relocating with their {sex_desc} {rel_type.lower()}.")
        else:
            lines.append(f"They are relocating with their {rel_type.lower()}.")

        # Partner nationalities
        p_nats = partner_info.get("partnerNationalities", [])
        if p_nats:
            pn_list = ", ".join(n.get("country") for n in p_nats if n.get("country"))
            if pn_list:
                lines.append(f"Their {rel_type.lower()} holds citizenship of: {pn_list}.")

        # Relationship duration with context based on relationship type
        full_years = partner_info.get("fullRelationshipDuration")
        official_years = partner_info.get("officialRelationshipDuration")
        
        if full_years is not None and full_years > 0:
            dur_sentence = f"They have been together for {full_years} year{'s' if full_years != 1 else ''}"
            
            if official_years is not None:
                if official_years > 0:
                    # Interpret official duration based on relationship type
                    if rel_type == "Spouse":
                        if official_years == full_years:
                            dur_sentence += f", all of which has been as a married couple"
                        else:
                            dur_sentence += f", including {official_years} year{'s' if official_years != 1 else ''} as a married couple"
                    elif rel_type in ["Civil Partner", "Domestic Partner"]:
                        if official_years == full_years:
                            dur_sentence += f", all of which has been in a registered partnership"
                        else:
                            dur_sentence += f", including {official_years} year{'s' if official_years != 1 else ''} in a registered partnership"
                    elif rel_type == "Fiancé(e)":
                        if official_years == full_years:
                            dur_sentence += f", all of which has been as an engaged couple"
                        else:
                            dur_sentence += f", including {official_years} year{'s' if official_years != 1 else ''} as an engaged couple"
                    elif rel_type == "Unmarried Partner":
                        if official_years == full_years:
                            dur_sentence += f", all of which has been while living together"
                        else:
                            dur_sentence += f", including {official_years} year{'s' if official_years != 1 else ''} living together"
                    else:
                        # Fallback for unknown relationship types
                        if official_years == full_years:
                            dur_sentence += f", all of which has been in an official capacity"
                        else:
                            dur_sentence += f", including {official_years} year{'s' if official_years != 1 else ''} in an official capacity"
                elif official_years == 0:
                    # No official duration - different meanings based on relationship type
                    if rel_type == "Spouse":
                        dur_sentence += " but they are not yet married"
                    elif rel_type in ["Civil Partner", "Domestic Partner"]:
                        dur_sentence += " but they do not have a registered partnership"
                    elif rel_type == "Fiancé(e)":
                        dur_sentence += " but they are not yet engaged"
                    elif rel_type == "Unmarried Partner":
                        dur_sentence += " but they do not live together"
                    else:
                        dur_sentence += " in a romantic relationship but without official recognition"
            
            lines.append(dur_sentence + ".")

        # Relationship proof
        can_prove = partner_info.get("canProveRelationship")
        if can_prove is True:
            lines.append("They can provide documentation to prove their relationship (photos, correspondence, joint accounts, etc.).")
        elif can_prove is False:
            lines.append("They have indicated they may have limited documentation to prove their relationship.")
    elif has_partner is False:
        lines.append("The individual is not bringing a partner or spouse with them.")
    # Note: If has_partner is not explicitly set (None/undefined), we don't mention partner status

    # Dependents
    deps = pi.get("dependents", [])
    if deps and len(deps) > 0:
        # Group dependents by who they're related to for clearer description
        user_deps = []
        partner_deps = []
        
        for d in deps:
            rel = d.get("relationship", "dependent")
            
            # Handle new detailed relationship structure
            rel_details = d.get("relationshipDetails", {})
            bio_rel = rel_details.get("biologicalRelationTo", "user")
            legal_rel = rel_details.get("legalRelationTo", "user") 
            custodial_rel = rel_details.get("custodialRelationTo", "user")
            
            # Determine primary relationship for grouping
            primary_relation = "user"  # default
            if bio_rel == "partner" or legal_rel == "partner" or custodial_rel == "partner":
                if bio_rel == "both" or legal_rel == "both" or custodial_rel == "both":
                    primary_relation = "both"
                else:
                    primary_relation = "partner"
            elif bio_rel == "both" or legal_rel == "both" or custodial_rel == "both":
                primary_relation = "both"
            
            # Build relationship context for description
            rel_context_parts = []
            if rel_details.get("isStepRelation"):
                rel_context_parts.append("step-")
            if rel_details.get("isAdopted"):
                rel_context_parts.append("adopted ")
            
            # Add guardianship info if relevant
            guardianship = rel_details.get("guardianshipType", "none")
            if guardianship != "none":
                rel_context_parts.append(f"({guardianship} guardian)")
            
            # Create comprehensive relationship description
            rel_desc = "".join(rel_context_parts) + rel.lower()
            
            # Add biological/legal context if complex
            if bio_rel != legal_rel or bio_rel != custodial_rel or legal_rel != custodial_rel:
                context_details = []
                if bio_rel == "partner":
                    context_details.append("biologically partner's")
                elif bio_rel == "user":
                    context_details.append("biologically user's")
                
                if legal_rel != bio_rel:
                    if legal_rel == "user":
                        context_details.append("legally user's")
                    elif legal_rel == "partner":
                        context_details.append("legally partner's")
                
                if context_details:
                    rel_desc += f" ({', '.join(context_details)})"
            
            # Get dependent's nationalities
            dep_nats = d.get("nationalities", [])
            nat_list = []
            if dep_nats:
                for n in dep_nats:
                    country = n.get("country")
                    if country:
                        nat_list.append(country)
            
            # Calculate age if date of birth is provided
            dob = d.get("dateOfBirth")
            age_str = ""
            if dob:
                try:
                    age = int((date.today() - datetime.strptime(dob, "%Y-%m-%d").date()).days / 365.25)
                    age_str = f" (age {age})"
                except Exception:
                    pass
            
            # Student status
            student_status = " - currently a student" if d.get("isStudent") else ""
            
            # Build dependent description
            nationality_text = f" with citizenship of {', '.join(nat_list)}" if nat_list else ""
            dep_desc = f"{rel_desc}{age_str}{nationality_text}{student_status}"
            
            # Include additional notes if provided
            notes = rel_details.get("additionalNotes", "").strip()
            if notes:
                dep_desc += f" (Note: \"{notes}\")"
            
            # Group by primary relationship
            if primary_relation == "partner":
                partner_deps.append(dep_desc)
            elif primary_relation == "both":
                # For relationships to both, add to a separate category or user category with note
                user_deps.append(f"{dep_desc} [related to both]")
            else:
                user_deps.append(dep_desc)
        
        # Create description based on relationships
        dep_parts = []
        if user_deps:
            if len(user_deps) == 1:
                dep_parts.append(f"their {user_deps[0]}")
            else:
                dep_parts.append(f"their {len(user_deps)} dependents: {'; '.join(user_deps[:3])}")
                if len(user_deps) > 3:
                    dep_parts[-1] += f" and {len(user_deps)-3} others"
        
        if partner_deps:
            if len(partner_deps) == 1:
                dep_parts.append(f"their partner's {partner_deps[0]}")
            else:
                dep_parts.append(f"their partner's {len(partner_deps)} dependents: {'; '.join(partner_deps[:3])}")
                if len(partner_deps) > 3:
                    dep_parts[-1] += f" and {len(partner_deps)-3} others"
        
        if dep_parts:
            lines.append("They are also relocating with " + " and ".join(dep_parts) + ".")
    else:
        # Check if dependents field was explicitly set to empty vs not filled out
        if "dependents" in pi or "numDependents" in pi:
            lines.append("The individual is not bringing any dependents (children or other dependents) with them.")

    return " ".join(lines) or "User has not submitted any information on this section."


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


def residency_section(ri: Dict[str, Any], personal_info: Dict[str, Any] = None, alternative_interests: Dict[str, Any] = None) -> str:
    if not ri:
        return "Residency intentions have not been completed yet."

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
    
    # Add region information if specified
    region = dest.get("region", "").strip()
    if region:
        sentences.append(f"They are specifically interested in the {region} region.")
    
    # Move motivation
    motivation = ri.get("moveMotivation", "").strip()
    if motivation:
        sentences.append(f"Their motivation for moving: \"{motivation}\"")
    
    # Analyze family visa situation if personal info is available
    if personal_info and country != "an unspecified country":
        user_nationalities = personal_info.get("nationalities", [])
        partner_info = personal_info.get("relocationPartnerInfo", {})
        dependents_info = personal_info.get("relocationDependents", [])
        
        # Check if user has visa-free access
        user_is_citizen = any(nat.get("country") == country for nat in user_nationalities)
        user_has_eu_freedom = can_move_within_eu(user_nationalities, country)
        user_has_visa_free = user_is_citizen or user_has_eu_freedom
        
        # Analyze family visa requirements
        family_visa_needed = []
        
        # Check partner
        if partner_info.get("partnerNationalities"):
            partner_nats = partner_info["partnerNationalities"]
            partner_is_citizen = any(nat.get("country") == country for nat in partner_nats)
            partner_has_eu = can_move_within_eu(partner_nats, country)
            if not (partner_is_citizen or partner_has_eu):
                family_visa_needed.append("spouse/partner")
        
        # Check dependents
        dependent_visa_count = 0
        for dep in dependents_info:
            if dep.get("nationalities"):
                dep_nats = dep["nationalities"]
                dep_is_citizen = any(nat.get("country") == country for nat in dep_nats)
                dep_has_eu = can_move_within_eu(dep_nats, country)
                if not (dep_is_citizen or dep_has_eu):
                    dependent_visa_count += 1
        
        if dependent_visa_count > 0:
            family_visa_needed.append(f"{dependent_visa_count} dependent{'s' if dependent_visa_count > 1 else ''}")
        
        # Add family visa context to story
        if family_visa_needed:
            if user_has_visa_free:
                if user_has_eu_freedom and not user_is_citizen:
                    sentences.append(f"As an EU citizen, they have freedom of movement to {country}.")
                elif user_is_citizen:
                    sentences.append(f"They are already a citizen of {country}.")
                
                family_desc = " and ".join(family_visa_needed)
                sentences.append(f"However, their {family_desc} will require family reunion/dependent visas.")
                
                if is_eu_country(country) and has_eu_citizenship(user_nationalities):
                    sentences.append("EU family reunion directives may provide beneficial pathways for family members.")
            else:
                total_family = len(family_visa_needed) + 1  # +1 for primary applicant
                sentences.append(f"This will involve {total_family} separate visa applications for the complete family unit.")
        elif partner_info or dependents_info:
            # Family exists but no visas needed
            if user_has_eu_freedom or any(
                can_move_within_eu(partner_info.get("partnerNationalities", []), country) if partner_info else False
            ):
                sentences.append("The entire family benefits from EU freedom of movement rights.")
            else:
                sentences.append("All family members have visa-free access to the destination.")
        
        # Add family visa planning preferences if specified
        family_planning = ri.get("familyVisaPlanning", {})
        if family_planning:
            timeline = family_planning.get("applicationTimeline")
            if timeline == "together":
                sentences.append("They prefer to coordinate all family visa applications together.")
            elif timeline == "sequential":
                sentences.append("They plan to apply for their own visa first, then family members.")
            
            priority = family_planning.get("relocationPriority")
            if priority == "moveTogetherEssential":
                sentences.append("Moving together as a family unit is essential to their plans.")
            elif priority == "primaryFirstAcceptable":
                sentences.append("They are willing to relocate first and have family join later.")
            
            concerns = family_planning.get("concerns", [])
            if concerns:
                concern_map = {
                    "documentPreparation": "document preparation and legalization",
                    "applicationCosts": "visa application costs for multiple family members",
                    "processingTiming": "processing times and coordination",
                    "childSchooling": "school enrollment timing for children",
                    "spouseWork": "spouse work authorization"
                }
                concern_text = [concern_map.get(c, c) for c in concerns]
                if len(concern_text) == 1:
                    sentences.append(f"Their main family visa concern is {concern_text[0]}.")
                else:
                    sentences.append(f"Their main family visa concerns include {', '.join(concern_text[:-1])}, and {concern_text[-1]}.")
            
            special_circumstances = family_planning.get("specialCircumstances", "").strip()
            if special_circumstances:
                sentences.append(f"Special family circumstances: \"{special_circumstances}\"")
    
    # Alternative interests section for those with no visa issues and finance skipped
    if alternative_interests:
        purpose = alternative_interests.get("purpose", "").strip()
        completed_via_summary = alternative_interests.get("completedViaSummary", False)
        
        if purpose:
            sentences.append("Since they have no visa requirements and are not interested in detailed taxation advice, they are seeking alternative information.")
            sentences.append(f"Their specific purpose for using this system: \"{purpose}\"")
            
            if completed_via_summary:
                sentences.append("They chose to complete their profile via the alternative pathway and proceed directly to a targeted summary.")

    # Residency plans - only mention if explicitly provided
    rp = ri.get("residencyPlans", {})
    if rp.get("applyForResidency") is True:
        sentences.append("They intend to apply for legal residency.")
    elif rp.get("applyForResidency") is False:
        sentences.append("They have no immediate plans to obtain residency status.")

    if rp:
        # Handle minimum requirement preference vs specific months
        want_minimum_only = rp.get("wantMinimumOnly")
        months = rp.get("maxMonthsWillingToReside")
        
        if want_minimum_only:
            sentences.append("They prefer to know the minimum physical presence requirements (days/months per year to maintain residency status) rather than set a specific preference.")
        elif months is not None:
            if months == 0:
                sentences.append("They initially indicated zero months of residence willingness.")
            else:
                sentences.append(f"They are willing to reside for up to {months} month{'s' if months!=1 else ''} initially.")
        
        # Exploratory visits with user's details
        if rp.get("openToVisiting") is True:
            visit_details = rp.get("exploratoryVisits", {})
            user_details = visit_details.get("details", "").strip()
            
            if user_details:
                sentences.append(f"Individual has expressed planning or being open to exploratory visits before relocation: \"{user_details}\"")
            else:
                sentences.append("Individual has expressed planning or being open to exploratory visits before relocation but has not provided specific details yet.")
        elif rp.get("openToVisiting") is False:
            sentences.append("They are not planning any exploratory visits prior to relocation.")

    # Citizenship ambitions - only mention if explicitly provided
    cp = ri.get("citizenshipPlans", {})
    if cp:
        interested = cp.get("interestedInCitizenship")
        if interested is True:
            sentences.append("Ultimately, they wish to obtain citizenship.")
        elif interested is False:
            sentences.append("They are not currently pursuing citizenship.")

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

    # Centre of life ties
    col = ri.get("centerOfLife", {})
    ties_text = col.get("tiesDescription")
    if col.get("maintainsSignificantTies"):
        sentences.append("They maintain significant ties to their current country (" + (f"\"{ties_text}\"" if ties_text else "details not specified") + ").")
    elif ties_text:
        sentences.append("Regarding centre-of-life ties, they note: \"" + ties_text + "\".")

    # Tax compliance - explicit mention for both compliant and non-compliant
    tax_compliant = ri.get("taxCompliantEverywhere")
    if tax_compliant is True:
        sentences.append("They are fully tax compliant in all jurisdictions where they have lived.")
    elif tax_compliant is False:
        sentences.append("They are **not** tax compliant in all jurisdictions, which may pose compliance risks.")
        # Include explanation if provided
        explanation = ri.get("taxComplianceExplanation", "").strip()
        if explanation:
            sentences.append(f"Tax compliance explanation: \"{explanation}\"")

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
    
    # Separate current and expected sources
    current_sources = [src for src in sources if src.get("continue_in_destination", True)]
    expected_sources = [src for src in sources if not src.get("continue_in_destination", True)]
    
    lines = []
    
    # Process current sources
    if current_sources:
        total_usd = 0.0
        for src in current_sources:
            amt = src.get("amount", 0)
            cur = src.get("currency", "USD")
            try:
                total_usd += convert(amt, cur, "USD")
            except Exception:
                total_usd += amt

        # Only show summary if there are multiple sources or non-Financial Support sources
        has_non_financial_support = any(src.get("category") != "Financial Support" for src in current_sources)
        if len(current_sources) > 1 or has_non_financial_support:
            total_dest = convert(total_usd, "USD", dest_currency)
            lines.append(
                f"They have {len(current_sources)} current income source{'s' if len(current_sources)!=1 else ''} totalling "
                f"{total_dest:,.0f} {dest_currency.upper()} ({total_usd:,.0f} USD) per year, which will continue after moving."
            )
        
        for src in current_sources:
            cat = src.get("category", "Unknown")
            amt = _format_money(src.get("amount", 0), src.get("currency", "USD"), dest_currency)
            country = src.get("country", "")
            
            # Enhanced description based on category
            if cat == "Employment" and src.get("fields"):
                fields = src.get("fields", {})
                role = fields.get("role", "")
                employer = fields.get("employer", "")
                if role and employer:
                    lines.append(f"• {role} at {employer}: {amt} from {country or 'various'}.")
                elif role:
                    lines.append(f"• {role} position: {amt} from {country or 'various'}.")
                elif employer:
                    lines.append(f"• Employment at {employer}: {amt} from {country or 'various'}.")
                else:
                    lines.append(f"• {cat} income: {amt} from {country or 'various'}.")
            elif cat == "Financial Support" and src.get("fields"):
                fields = src.get("fields", {})
                # Handle both camelCase and snake_case field names
                source_type = fields.get("sourceType", fields.get("source_type", ""))
                source = fields.get("source", "")
                frequency = fields.get("frequency", "")
                duration = fields.get("duration", "")
                notes = fields.get("notes", "")
                
                if source_type and source:
                    support_desc = f"• {source_type} support from {source}"
                    if frequency == "Monthly":
                        monthly_amt = src.get("amount", 0) / 12
                        monthly_formatted = _format_money(monthly_amt, src.get('currency', 'USD'), dest_currency)
                        annual_formatted = _format_money(src.get("amount", 0), src.get('currency', 'USD'), dest_currency)
                        support_desc += f": {monthly_formatted}/month ({annual_formatted} annually)"
                    else:
                        support_desc += f": {amt}"
                    if duration:
                        support_desc += f" for {duration.lower()}"
                    support_desc += "."
                    lines.append(support_desc)
                    
                    # Add notes if provided
                    if notes and notes.strip():
                        lines.append(f"  Note: {notes.strip()}")
                else:
                    lines.append(f"• {cat}: {amt}.")
            elif cat in ["Self-Employment", "Investments", "Rental Income", "Other"] and src.get("fields"):
                fields = src.get("fields", {})
                # Add specific field handling for other categories
                if cat == "Self-Employment":
                    business_name = fields.get("business_name", "")
                    business_type = fields.get("business_type", "")
                    if business_name and business_type:
                        lines.append(f"• {business_type} business ({business_name}): {amt} from {country or 'various'}.")
                    elif business_name:
                        lines.append(f"• Self-employment ({business_name}): {amt} from {country or 'various'}.")
                    else:
                        lines.append(f"• {cat} income: {amt} from {country or 'various'}.")
                elif cat == "Investments":
                    investment_type = fields.get("investment_type", "")
                    issuer = fields.get("issuer", "")
                    if investment_type and issuer:
                        lines.append(f"• {investment_type} from {issuer}: {amt}.")
                    elif investment_type:
                        lines.append(f"• {investment_type} income: {amt}.")
                    else:
                        lines.append(f"• {cat} income: {amt}.")
                elif cat == "Rental Income":
                    property_type = fields.get("property_type", "")
                    property_desc = fields.get("property_description", "")
                    if property_type and property_desc:
                        lines.append(f"• {property_type} rental ({property_desc}): {amt} from {country or 'various'}.")
                    elif property_type:
                        lines.append(f"• {property_type} rental income: {amt} from {country or 'various'}.")
                    else:
                        lines.append(f"• {cat}: {amt} from {country or 'various'}.")
                else:
                    lines.append(f"• {cat} income: {amt} from {country or 'various'}.")
            else:
                lines.append(f"• {cat} income: {amt} from {country or 'various'}.")
    
    # Process expected sources with enhanced information
    if expected_sources:
        total_usd = 0.0
        for src in expected_sources:
            amt = src.get("amount", 0)
            cur = src.get("currency", "USD")
            try:
                total_usd += convert(amt, cur, "USD")
            except Exception:
                total_usd += amt
        
        total_dest = convert(total_usd, "USD", dest_currency)
        lines.append(
            f"They expect {len(expected_sources)} new income source{'s' if len(expected_sources)!=1 else ''} totalling "
            f"{total_dest:,.0f} {dest_currency.upper()} ({total_usd:,.0f} USD) per year after moving."
        )
        
        for src in expected_sources:
            cat = src.get("category", "Unknown")
            amt = _format_money(src.get("amount", 0), src.get("currency", "USD"), dest_currency)
            country = src.get("country", "")
            timeline = src.get("timeline", "")
            confidence = src.get("confidence", "")
            notes = src.get("notes", "")
            
            # Build detailed description for expected sources
            details = []
            if timeline:
                details.append(f"expected {timeline.lower()}")
            if confidence:
                details.append(f"{confidence.lower()} confidence")
            
            detail_str = f" ({', '.join(details)})" if details else ""
            base_desc = f"• Expected {cat} income of {amt} from {country or 'various'}{detail_str}."
            
            # Add category-specific details for expected income
            if cat == "Employment" and src.get("fields"):
                fields = src.get("fields", {})
                role = fields.get("role", "")
                employer = fields.get("employer", "")
                if role and employer:
                    base_desc = f"• Expected {role} position at {employer} earning {amt}{detail_str}."
                elif role:
                    base_desc = f"• Expected {role} position earning {amt}{detail_str}."
                elif employer:
                    base_desc = f"• Expected employment at {employer} earning {amt}{detail_str}."
            elif cat == "Financial Support" and src.get("fields"):
                fields = src.get("fields", {})
                # Handle both camelCase and snake_case field names
                source_type = fields.get("sourceType", fields.get("source_type", ""))
                source = fields.get("source", "")
                duration = fields.get("duration", "")
                frequency = fields.get("frequency", "")
                
                if source_type and source:
                    support_desc = f"• {source_type} support"
                    if source:
                        support_desc += f" from {source}"
                    if frequency == "Monthly":
                        monthly_amt = src.get("amount", 0) / 12
                        monthly_formatted = _format_money(monthly_amt, src.get('currency', 'USD'), dest_currency)
                        annual_formatted = _format_money(src.get("amount", 0), src.get('currency', 'USD'), dest_currency)
                        support_desc += f" of {monthly_formatted}/month ({annual_formatted} annually)"
                    else:
                        support_desc += f" of {amt}"
                    if duration:
                        support_desc += f" for {duration.lower()}"
                    support_desc += f"{detail_str}."
                    base_desc = support_desc
            elif cat == "Self-Employment" and src.get("fields"):
                fields = src.get("fields", {})
                business_name = fields.get("business_name", "")
                business_type = fields.get("business_type", "")
                if business_name and business_type:
                    base_desc = f"• Expected {business_type} business ({business_name}) earning {amt}{detail_str}."
                elif business_name:
                    base_desc = f"• Expected self-employment ({business_name}) earning {amt}{detail_str}."
                else:
                    base_desc = f"• Expected {cat} income of {amt}{detail_str}."
            elif cat == "Investments" and src.get("fields"):
                fields = src.get("fields", {})
                investment_type = fields.get("investment_type", "")
                issuer = fields.get("issuer", "")
                if investment_type and issuer:
                    base_desc = f"• Expected {investment_type} income from {issuer}: {amt}{detail_str}."
                elif investment_type:
                    base_desc = f"• Expected {investment_type} income: {amt}{detail_str}."
                else:
                    base_desc = f"• Expected {cat} income of {amt}{detail_str}."
            elif cat == "Rental Income" and src.get("fields"):
                fields = src.get("fields", {})
                property_type = fields.get("property_type", "")
                property_desc = fields.get("property_description", "")
                if property_type and property_desc:
                    base_desc = f"• Expected {property_type} rental income ({property_desc}): {amt}{detail_str}."
                elif property_type:
                    base_desc = f"• Expected {property_type} rental income: {amt}{detail_str}."
                else:
                    base_desc = f"• Expected {cat}: {amt}{detail_str}."
            
            lines.append(base_desc)
            
            # Add notes if provided
            if notes and notes.strip():
                lines.append(f"  Note: {notes.strip()}")
    
    return " ".join(lines)


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


def _get_capital_gain_value(sale: Dict[str, Any]) -> float:
    """Get surplus value, handling both snake_case and camelCase field names"""
    return sale.get("surplus_value", sale.get("surplusValue", 0))


def _get_holding_time(sale: Dict[str, Any]) -> str:
    """Get holding time, handling both snake_case and camelCase field names"""
    return sale.get("holding_time", sale.get("holdingTime", "N/A"))


def _summarise_liabilities(liabs: List[Dict[str, Any]], dest_currency: str) -> str:
    if not liabs:
        return ""
    total_usd = _mixed_total(liabs, "amount")
    total_dest = convert(total_usd, "USD", dest_currency)
    
    lines = [f"Liabilities amount to {total_dest:,.0f} {dest_currency.upper()} ({total_usd:,.0f} USD) across {len(liabs)} obligation(s)."]
    
    # Add details for each liability
    for liab in liabs[:3]:  # Limit to first 3 for readability
        cat = liab.get("category", "Liability")
        amt = _format_money(liab.get("amount", 0), liab.get("currency", "USD"), dest_currency)
        country = liab.get("country", "")
        fields = liab.get("fields", {})
        
        # Build description based on category
        if cat == "Mortgage" and fields:
            property_desc = fields.get("property_description", "")
            property_type = fields.get("property_type", "")
            if property_desc and property_type:
                desc = f"• {cat}: {property_type} mortgage ({property_desc}) - {amt}"
            elif property_type:
                desc = f"• {cat}: {property_type} mortgage - {amt}"
            else:
                desc = f"• {cat}: {amt}"
        elif cat == "Loan" and fields:
            lender = fields.get("lender", "")
            purpose = fields.get("purpose", "")
            if lender and purpose:
                desc = f"• {cat}: {purpose} loan from {lender} - {amt}"
            elif lender:
                desc = f"• {cat}: loan from {lender} - {amt}"
            elif purpose:
                desc = f"• {cat}: {purpose} loan - {amt}"
            else:
                desc = f"• {cat}: {amt}"
        elif cat == "Credit Card" and fields:
            issuer = fields.get("card_issuer", "")
            if issuer:
                desc = f"• {cat}: debt with {issuer} - {amt}"
            else:
                desc = f"• {cat}: debt - {amt}"
        else:
            desc = f"• {cat}: {amt}"
        
        if country:
            desc += f" ({country})"
        
        # Add terms information
        payback_years = liab.get("paybackYears", 0)
        interest_rate = liab.get("interestRate", 0)
        if payback_years > 0 or interest_rate > 0:
            terms = []
            if payback_years > 0:
                terms.append(f"{payback_years} years")
            if interest_rate > 0:
                terms.append(f"{interest_rate}% interest")
            if terms:
                desc += f" - {', '.join(terms)}"
        
        lines.append(desc + ".")
    
    if len(liabs) > 3:
        lines.append(f"…and {len(liabs)-3} more liabilities.")
    
    return " ".join(lines)


def _summarise_capital_gains(cg: Dict[str, Any], dest_currency: str) -> str:
    future = cg.get("futureSales", [])
    if not future:
        return ""
    
    # Calculate total using both field name variants
    tot_usd = 0.0
    for sale in future:
        gain_value = _get_capital_gain_value(sale)
        cur = sale.get("currency", "USD")
        try:
            tot_usd += convert(gain_value, cur, "USD")
        except Exception:
            tot_usd += gain_value  # fallback assume USD
    
    tot_dest = convert(tot_usd, "USD", dest_currency)
    lines = [
        f"They plan to sell {len(future)} asset(s) in their first year after moving, expecting total gains of "
        f"{tot_dest:,.0f} {dest_currency.upper()} ({tot_usd:,.0f} USD)."
    ]
    for sale in future[:3]:
        asset = sale.get("asset", "asset")
        asset_type = sale.get("type", "")
        gain_value = _get_capital_gain_value(sale)
        gain = _format_money(gain_value, sale.get("currency", "USD"), dest_currency)
        holding_time = _get_holding_time(sale)
        reason = sale.get("reason", "")
        
        # Build enhanced description
        if asset_type:
            asset_desc = f"{asset_type}: {asset}"
        else:
            asset_desc = asset
        
        detail_parts = [f"holding {holding_time}"]
        if reason:
            detail_parts.append(f"reason: {reason}")
        
        details = ", ".join(detail_parts)
        lines.append(f"• {asset_desc} with expected profit {gain} ({details}).")
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
    # Check if user chose to skip finance details
    if fin.get("skipDetails") is True:
        return "The user is not interested in providing detailed financial information and just wants to know about minimum requirements to get a visa in the destination country."
    
    if not fin:
        return "User has not submitted any information on this section."

    parts: List[str] = []

    # Income situation summary with human-readable descriptions
    # Handle both camelCase (legacy) and snake_case (transformed) field names
    income_situation = fin.get("income_situation", fin.get("incomeSituation"))
    if income_situation:
        situation_descriptions = {
            "continuing_income": "plans to continue all current income sources after moving (remote work, investments, rental income, etc.)",
            "current_and_new_income": "will maintain some existing income sources while adding new ones in the destination country",
            "seeking_income": "plans to find new employment, start a business, or develop other new income sources after moving",
            "gainfully_unemployed": "will be self-funded, living off savings, gifts, or investment returns without active employment",
            "dependent/supported": "will be financially supported by family, partner, scholarship, or institutional funding"
        }
        
        description = situation_descriptions.get(income_situation, income_situation)
        parts.append(f"Their income situation after moving: {description}.")

    tw = fin.get("totalWealth")
    if tw and tw.get("total"):
        # Handle both camelCase (legacy) and snake_case (transformed) field names
        primary_residence = tw.get('primary_residence', tw.get('primaryResidence', 0))
        parts.append(
            f"Reported net worth is {_format_money(tw['total'], tw.get('currency', 'USD'), dest_currency)}; "
            f"primary residence accounts for {primary_residence:,.0f} {tw.get('currency','USD')}."
        )

    # Handle both camelCase and snake_case field names
    income_sources = fin.get("incomeSources", fin.get("income_sources", []))
    if income_sources:
        parts.append(_summarise_income_sources(income_sources, dest_currency))

    capital_gains_summary = _summarise_capital_gains(fin.get("capitalGains", {}), dest_currency)
    if capital_gains_summary:
        parts.append(capital_gains_summary)

    liabs = fin.get("liabilities", [])
    if liabs:
        liabs_summary = _summarise_liabilities(liabs, dest_currency)
        if liabs_summary:
            parts.append(liabs_summary)
        for l in liabs[:3]:
            cat = l.get("category", "Liability")
            amt = _format_money(l.get("amount", 0), l.get("currency", "USD"), dest_currency)
            lender = l.get("fields", {}).get("lender", "an institution")
            parts.append(f"• {cat} with {lender}: {amt} outstanding.")

    # Assets summary
    assets = fin.get("assets", [])
    if assets:
        asset_sentences = []
        for asset in assets[:5]:  # Show first 5 assets
            desc = asset.get("description") or asset.get("type", "asset")
            val = asset.get("value")
            curr = asset.get("currency", "USD")
            if val:
                val_str = _format_money(val, curr, dest_currency)
                parts.append(f"• {desc}: {val_str}.")
            else:
                parts.append(f"• {desc} (value not specified).")
        if len(assets) > 5:
            parts.append(f"…and {len(assets)-5} more assets.")

    # Filter empties
    parts = [p for p in parts if p]

    return " ".join(parts) if parts else "User has not submitted any information on this section."


def education_section(edu: Dict[str, Any]) -> str:
    if not edu:
        return "User has not submitted any information on this section."

    segments: List[str] = []

    # Only mention student status if explicitly provided
    if edu.get("isStudent") is True:
        school = edu.get("currentSchool") or "an unspecified institution"
        field = edu.get("currentFieldOfStudy") or "various subjects"
        segments.append(f"The individual is currently studying {field} at {school}.")
    elif edu.get("isStudent") is False:
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

    # Future study interests - only mention if explicitly provided
    if edu.get("interestedInStudying") is True:
        segments.append("They are interested in pursuing further studies in the destination country.")
    elif edu.get("interestedInStudying") is False:
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
            start_date = off.get("startDate", "N/A")
            start_formatted = start_date[:4] if start_date != "N/A" and len(start_date) >= 4 else start_date
            status = off.get("financial_status", "")
            segments.append(f"• Offer from {sch} for {prog} ({start_formatted}) – {status}.")
        if len(offers) > 3:
            segments.append(f"…and {len(offers)-3} more offers.")

    # Military service background - only mention if explicitly provided
    military = edu.get("militaryService", {})
    if military.get("hasService") is True:
        country = military.get("country", "their home country")
        branch = military.get("branch", "the military")
        segments.append(f"They have military service experience in {country} with {branch}.")
    elif military.get("hasService") is False:
        segments.append("They have no military service background.")

    return " ".join(segments) if segments else "User has not submitted any information on this section."


def ssp_section(ssp: Dict[str, Any], dest_currency: str) -> str:
    if not ssp:
        return "User has not submitted any information on this section."

    segments: List[str] = []

    curr = ssp.get("currentCountryContributions", {})
    if curr.get("isContributing") is True and curr.get("country"):
        yrs = curr.get("yearsOfContribution", 0)
        segments.append(
            f"They are currently contributing to the social-security system in {curr['country']} (about {yrs} years credited)."
        )
    elif curr.get("isContributing") is False:
        segments.append("They are not presently contributing to any social-security system.")

    future = ssp.get("futurePensionContributions", {})
    if future.get("isPlanning") is True:
        segments.append("They plan to continue pension contributions after relocation.")
        details = future.get("details", [])
        if details:
            for d in details[:3]:
                plan = d.get("pensionType") or d.get("planType", "a pension scheme")
                # Handle "Other" type with custom description
                if plan == "Other" and d.get("otherPensionType"):
                    plan = d.get("otherPensionType")
                amt = d.get("contributionAmount") or d.get("amount") or d.get("expectedAnnual") or 0
                curr = d.get("currency", "USD")
                country = d.get("country", "")
                if amt:
                    amt_str = _format_money(amt, curr, dest_currency)
                    location = f" in {country}" if country else ""
                    segments.append(f"• Expected contribution of {amt_str} into {plan}{location}.")
                else:
                    location = f" in {country}" if country else ""
                    segments.append(f"• Plans to contribute to {plan}{location} (amount not specified).")
            if len(details) > 3:
                segments.append(f"…and {len(details)-3} more contribution plan(s).")
    elif future.get("isPlanning") is False:
        segments.append("They are not planning any pension contributions after relocation.")

    existing = ssp.get("existingPlans", {})
    if existing.get("hasPlans") is True:
        details = existing.get("details", [])
        if details:
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
    elif existing.get("hasPlans") is False:
        segments.append("They have no existing pension plans.")

    return " ".join(segments) if segments else "User has not submitted any information on this section."


def future_plans_section(fut: Dict[str, Any], dest_currency: str) -> str:
    if not fut:
        return "User has not submitted any information on this section."

    segs: List[str] = []

    def _detail(items: List[Dict[str, Any]], label: str):
        if not items:
            return ""
        sentences = []
        sentences.append(f"They are considering {len(items)} {label}{'s' if len(items)!=1 else ''}.")
        for itm in items[:3]:
            # Handle different field names for different plan types
            desc = (itm.get("type") or itm.get("otherType") or 
                    itm.get("transactionType") or itm.get("accountType") or 
                    itm.get("otherAccountType") or itm.get("changeType") or 
                    itm.get("description") or itm.get("asset") or label)
            amt = (itm.get("estimatedValue") or itm.get("estimatedValueImpact") or 
                   itm.get("contributionAmount") or itm.get("amount") or itm.get("value"))
            curr = itm.get("currency", "USD")
            country = itm.get("country", "")
            if amt:
                amt_str = _format_money(amt, curr, dest_currency)
                location = f" in {country}" if country else ""
                sentences.append(f"• {desc}: {amt_str}{location}.")
            else:
                location = f" in {country}" if country else ""
                sentences.append(f"• {desc}{location}.")
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

    return " ".join(segs) if segs else "User has not submitted any information on this section."


def deductions_section(ded: Dict[str, Any], dest_currency: str) -> str:
    if not ded:
        return "User has not submitted any information on this section."
        
    lst = ded.get("potentialDeductions", [])
    if not lst:
        return "User has not submitted any information on this section."

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
        return "User has not submitted any information on this section."

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
    return " ".join(segs) if segs else "User has not submitted any information on this section."


def education_section(edu: Dict[str, Any], residency_intentions: Dict[str, Any] = None) -> str:
    """Generate education section including language proficiency."""
    if not edu and not residency_intentions:
        return "Education information has not been completed yet."
    
    sentences: List[str] = []
    
    # Previous degrees
    degrees = edu.get("previousDegrees", [])
    if degrees:
        degree_count = len(degrees)
        if degree_count == 1:
            degree = degrees[0]
            degree_name = degree.get("degree", "Unspecified degree")
            institution = degree.get("institution", "Unspecified institution")
            field = degree.get("field", "Unspecified field")
            start_date = degree.get("start_date", "")
            end_date = degree.get("end_date", "")
            in_progress = degree.get("in_progress", False)
            
            date_info = ""
            if start_date and end_date:
                start_formatted = start_date[:4] if len(start_date) >= 4 else start_date  # Extract year from date
                end_formatted = end_date[:4] if len(end_date) >= 4 else end_date
                if in_progress:
                    date_info = f" ({start_formatted} - present, in progress)"
                else:
                    date_info = f" ({start_formatted} - {end_formatted})"
            elif start_date:
                start_formatted = start_date[:4] if len(start_date) >= 4 else start_date
                date_info = f" (started {start_formatted})"
            
            sentences.append(f"They hold a {degree_name} in {field} from {institution}{date_info}.")
        else:
            sentences.append(f"They hold {degree_count} degrees from various institutions.")
            for degree in degrees[:3]:  # Show first 3 degrees in detail
                degree_name = degree.get("degree", "Unspecified degree")
                institution = degree.get("institution", "Unspecified institution")
                field = degree.get("field", "Unspecified field")
                sentences.append(f"• {degree_name} in {field} from {institution}")
            if degree_count > 3:
                sentences.append(f"...and {degree_count - 3} additional degrees.")
    else:
        sentences.append("User did not provide more information on education.")
    
    # Professional skills/credentials
    skills = edu.get("visaSkills", [])
    if skills:
        skill_count = len(skills)
        if skill_count == 1:
            skill = skills[0]
            skill_name = skill.get("skill", "Unspecified skill")
            credential = skill.get("credentialName", "")
            institute = skill.get("credentialInstitute", "")
            
            skill_desc = skill_name
            if credential:
                skill_desc += f" ({credential}"
                if institute:
                    skill_desc += f" from {institute}"
                skill_desc += ")"
            
            sentences.append(f"They have professional expertise in {skill_desc}.")
        else:
            sentences.append(f"They have {skill_count} professional skills and credentials:")
            for skill in skills[:3]:  # Show first 3 skills
                skill_name = skill.get("skill", "Unspecified skill")
                credential = skill.get("credentialName", "")
                if credential:
                    sentences.append(f"• {skill_name} ({credential})")
                else:
                    sentences.append(f"• {skill_name}")
            if skill_count > 3:
                sentences.append(f"...and {skill_count - 3} additional skills.")
    
    # Military service
    military = edu.get("militaryService", {})
    if military.get("hasService"):
        country = military.get("country", "Unspecified country")
        branch = military.get("branch", "Unspecified branch")
        sentences.append(f"They have military service experience with the {branch} in {country}.")
    
    # Language proficiency (stored in residencyIntentions but reported in education)
    if residency_intentions:
        lp = residency_intentions.get("languageProficiency", {})
        dest_country = residency_intentions.get("destinationCountry", {}).get("country", "")
        
        if lp:
            # Individual language proficiency
            ind_lang = lp.get("individual", {})
            if ind_lang:
                lang_summaries = []
                for lang, level in ind_lang.items():
                    if level > 0:
                        level_names = ["None", "A1 Basic", "A2 Elementary", "B1 Intermediate", "B2 Upper Intermediate", "C1 Advanced", "C2 Proficient", "Native Speaker"]
                        level_name = level_names[min(level, 7)]
                        
                        lang_desc = f"{lang} ({level_name})"
                        
                        # Add credential info if available
                        individual_creds = lp.get("individual_credentials", {})
                        if individual_creds.get(lang):
                            lang_desc += " with formal credentials"
                        
                        # Add teaching capability if B1+
                        can_teach = lp.get("can_teach", {})
                        teaching_capability = can_teach.get(lang)
                        if level >= 3 and teaching_capability and teaching_capability != "No/not interested":
                            if teaching_capability == "Formally with credentials":
                                lang_desc += ", qualified to teach formally"
                            elif teaching_capability == "Informally":
                                lang_desc += ", able to teach informally"
                        
                        lang_summaries.append(lang_desc)
                
                if lang_summaries:
                    if dest_country:
                        sentences.append(f"Language skills for {dest_country}: " + "; ".join(lang_summaries) + ".")
                    else:
                        sentences.append("Destination country language skills: " + "; ".join(lang_summaries) + ".")
            
            # Willing to learn languages
            willing_to_learn = lp.get("willing_to_learn", [])
            if willing_to_learn:
                sentences.append("Languages they are willing to learn: " + ", ".join(willing_to_learn) + ".")
            
            # Partner language proficiency (if present)
            partner_lang = lp.get("partner", {})
            if partner_lang:
                partner_summaries = []
                for lang, level in partner_lang.items():
                    if level > 0:
                        level_names = ["None", "A1 Basic", "A2 Elementary", "B1 Intermediate", "B2 Upper Intermediate", "C1 Advanced", "C2 Proficient", "Native Speaker"]
                        level_name = level_names[min(level, 7)]
                        
                        partner_desc = f"{lang} ({level_name})"
                        
                        # Add partner credential info if available
                        partner_creds = lp.get("partner_credentials", {})
                        if partner_creds.get(lang):
                            partner_desc += " with formal credentials"
                        
                        # Add partner teaching capability if B1+
                        partner_can_teach = lp.get("partner_can_teach", {})
                        partner_teaching = partner_can_teach.get(lang)
                        if level >= 3 and partner_teaching and partner_teaching != "No/not interested":
                            if partner_teaching == "Formally with credentials":
                                partner_desc += ", qualified to teach formally"
                            elif partner_teaching == "Informally":
                                partner_desc += ", able to teach informally"
                        
                        partner_summaries.append(partner_desc)
                
                if partner_summaries:
                    sentences.append("Partner's language skills: " + "; ".join(partner_summaries) + ".")
            
            # Partner willing to learn
            partner_willing = lp.get("partner_willing_to_learn", [])
            if partner_willing:
                sentences.append("Languages the partner is willing to learn: " + ", ".join(partner_willing) + ".")
            
            # Additional languages
            other_langs = lp.get("other_languages", {})
            if other_langs:
                other_summaries = []
                for lang, lang_data in other_langs.items():
                    if isinstance(lang_data, dict):
                        # New format
                        proficiency = lang_data.get("proficiency", 1)
                        can_teach = lang_data.get("canTeach", "No/not interested")
                        has_credentials = lang_data.get("hasCredentials", False)
                        
                        level_names = ["None", "A1 Basic", "A2 Elementary", "B1 Intermediate", "B2 Upper Intermediate", "C1 Advanced", "C2 Proficient", "Native Speaker"]
                        level_name = level_names[min(proficiency, 7)]
                        
                        other_desc = f"{lang} ({level_name})"
                        if has_credentials:
                            other_desc += " with formal credentials"
                        if proficiency >= 3 and can_teach != "No/not interested":
                            if can_teach == "Formally with credentials":
                                other_desc += ", qualified to teach formally"
                            elif can_teach == "Informally":
                                other_desc += ", able to teach informally"
                        
                        other_summaries.append(other_desc)
                    else:
                        # Old format (just teaching capability)
                        other_summaries.append(f"{lang} (teaching capability: {lang_data})")
                
                if other_summaries:
                    sentences.append("Additional languages: " + "; ".join(other_summaries) + ".")
    
    return " ".join(sentences) if sentences else "User has not submitted any information on this section."


def make_story(profile: Dict[str, Any]) -> str:
    dest_country = profile.get("residencyIntentions", {}).get("destinationCountry", {}).get("country", "")
    dest_currency = country_to_currency(dest_country) if dest_country else "USD"

    sections = [
        ("Residency Plans", residency_section(profile.get("residencyIntentions", {}), profile.get("personalInformation", {}), profile.get("alternativeInterests", {}))),
        ("Finance", finance_section(profile.get("finance", {}), dest_currency)),
        ("Personal Information", personal_section(profile.get("personalInformation", {}))),
        ("Education", education_section(profile.get("education", {}), profile.get("residencyIntentions", {}))),
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


# Individual section story generators for API endpoints
def make_personal_story(personal_info: Dict[str, Any]) -> str:
    """Generate a story for just the personal information section."""
    return f"Personal Information:\n{personal_section(personal_info)}"


def make_education_story(education_info: Dict[str, Any], residency_intentions: Dict[str, Any] = None) -> str:
    """Generate a story for just the education section."""
    return f"Education:\n{education_section(education_info, residency_intentions)}"


def make_residency_intentions_story(residency_info: Dict[str, Any]) -> str:
    """Generate a story for just the residency intentions section."""
    return f"Residency Plans:\n{residency_section(residency_info)}"


def make_finance_story(finance_info: Dict[str, Any], dest_currency: str = "USD") -> str:
    """Generate a story for just the finance section."""
    return f"Finance:\n{finance_section(finance_info, dest_currency)}"


def make_social_security_story(ssp_info: Dict[str, Any], dest_currency: str = "USD", skip_finance_details: bool = False) -> str:
    """Generate a story for just the social security and pensions section."""
    if skip_finance_details:
        return f"Social Security & Pensions:\nThe user is not interested in providing detailed financial information and just wants to know about minimum requirements to get a visa in the destination country."
    return f"Social Security & Pensions:\n{ssp_section(ssp_info, dest_currency)}"


def make_tax_deductions_story(tax_info: Dict[str, Any], dest_currency: str = "USD", skip_finance_details: bool = False) -> str:
    """Generate a story for just the tax deductions and credits section."""
    if skip_finance_details:
        return f"Tax Deductions & Credits:\nThe user is not interested in providing detailed financial information and just wants to know about minimum requirements to get a visa in the destination country."
    return f"Tax Deductions & Credits:\n{deductions_section(tax_info, dest_currency)}"


def make_future_financial_plans_story(future_info: Dict[str, Any], dest_currency: str = "USD", skip_finance_details: bool = False) -> str:
    """Generate a story for just the future financial plans section."""
    if skip_finance_details:
        return f"Future Financial Plans:\nThe user is not interested in providing detailed financial information and just wants to know about minimum requirements to get a visa in the destination country."
    return f"Future Financial Plans:\n{future_plans_section(future_info, dest_currency)}"


def make_additional_information_story(additional_info: Dict[str, Any]) -> str:
    """Generate a story for just the additional information section."""
    return f"Additional Information:\n{additional_section(additional_info)}"


def make_section_story(section_name: str, section_data: Dict[str, Any], dest_currency: str = "USD") -> str:
    """
    Generate a story for any individual section.
    
    Args:
        section_name: Name of the section (e.g., 'personalInformation', 'education', etc.)
        section_data: The data for that specific section
        dest_currency: Destination currency for financial calculations
        
    Returns:
        A formatted story string for the section
    """
    section_generators = {
        "personalInformation": lambda data, _: make_personal_story(data),
        "education": lambda data, _: make_education_story(data),
        "residencyIntentions": lambda data, _: make_residency_intentions_story(data),
        "finance": lambda data, currency: make_finance_story(data, currency),
        "socialSecurityAndPensions": lambda data, currency: make_social_security_story(data, currency),
        "taxDeductionsAndCredits": lambda data, currency: make_tax_deductions_story(data, currency),
        "futureFinancialPlans": lambda data, currency: make_future_financial_plans_story(data, currency),
        "additionalInformation": lambda data, _: make_additional_information_story(data),
    }
    
    if section_name in section_generators:
        return section_generators[section_name](section_data, dest_currency)
    else:
        return f"Unknown section: {section_name}" 