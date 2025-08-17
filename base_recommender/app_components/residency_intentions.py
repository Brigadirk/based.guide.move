import streamlit as st
from app_components.helpers import (
    update_data, get_data, get_country_list, 
    get_country_regions, get_languages,
    get_language_proficiency_levels, display_section, format_country_name)

def residency_intentions(anchor):
    """
    Residency Intentions Section with distinctive styling
    """
    # ======================= SECTION HEADER =======================
    st.header(f"🌐 {anchor}", anchor=anchor, divider="rainbow")
    
    # -------------------- SECTION IMPORTANCE --------------------
    with st.expander("💡 Why is this section important?"):
        st.warning("""
        **Understanding your residency intentions helps:**
        - Determine appropriate visa and immigration pathways
        - Identify tax residency implications in multiple jurisdictions
        - Assess citizenship eligibility and timeline
        - Plan for language requirements and integration
        - Evaluate investment or donation options if applicable
        - Prepare for minimum stay requirements and travel restrictions
        """)

    # -------------------- VISIBILITY TOGGLE --------------------
    if not st.toggle(f"📋 Show {anchor}", value=True, key=f"show_{anchor}"):
        st.info(f"🔍 {anchor} section is hidden. Toggle to show. Your previously entered data is preserved.")
        return

    # ======================= MOVE TYPE SECTION =======================
    st.subheader("🧳 Relocation Details")
    st.caption("Provide details about your intended relocation")
    
    with st.container():
        destination = get_data("individual.residencyIntentions.destinationCountry.country")
        dest_label = format_country_name(destination) if destination else ""
        if destination:         
            # CONSISTENT OPTION SELECTION
            move_type = select_move_type()
            if move_type == "Temporary":
                duration_of_stay()

    # ======================= CITIZENSHIP & RESIDENCY SECTION =======================
    with st.container(): 
        st.markdown("\n")
        if destination:    
            # Check if user is already a citizen based on personal information nationalities
            user_nationalities = get_data("individual.personalInformation.nationalities") or []
            is_already_citizen = destination in user_nationalities
            
            # Update citizenship status automatically based on personal information
            update_data("individual.residencyIntentions.destinationCountry.citizenshipStatus", is_already_citizen)
            
            if is_already_citizen:
                dest_label = format_country_name(destination)
                st.success(f"✅ You are already a citizen of {dest_label}.")
            else:
                apply_for_residency = residency(destination)
                interested_in_citizenship = citizenship(destination)
            
                # PROMINENT INFORMATION ABOUT RESIDENCY PATH TO CITIZENSHIP
                nota_bene = "**Important:** For most countries, being a resident (and taxpayer) for some number of years is a way to obtain citizenship. I will inform you whether this is so for "
                if dest_label:
                    st.info(f"{nota_bene}{dest_label}. **You may not need to select any of the options below.**")

                if apply_for_residency:
                    maximum_minimum_stay()

                if interested_in_citizenship:
                    st.subheader("🪪 Citizenship Options")
                    
                    # CONSISTENT TWO-COLUMN LAYOUT FOR RELATED INPUTS
                    col_family, col_military = st.columns(2)
                    
                    with col_family:
                        citizenship_by_family()

                    with col_military:
                        citizenship_by_military_service()

                    col_investment, col_donation = st.columns(2)

                    with col_investment:
                        citizenship_by_investment()

                    with col_donation:
                        citizenship_by_donation()
    

    
    # ======================= MOTIVATION FOR MOVE =======================
    move_motivation_section()

    # ======================= TAX COMPLIANCE CHECKBOX =======================
    tax_compliant = st.checkbox(
        "I have been fully tax compliant in every country I have lived in",
        value=get_data("individual.residencyIntentions.taxCompliantEverywhere") if get_data("individual.residencyIntentions.taxCompliantEverywhere") is not None else True,
        help="Uncheck this if you have NOT always filed and paid taxes as required in every country where you have lived."
    )
    update_data("individual.residencyIntentions.taxCompliantEverywhere", tax_compliant)
    
    # Show explanation field when not tax compliant
    if not tax_compliant:
        tax_compliance_explanation = st.text_area(
            "Please explain your tax compliance situation",
            value=get_data("individual.residencyIntentions.taxComplianceExplanation") or "",
            placeholder="Please provide details about your tax compliance history. For example: missed filings in certain years, outstanding tax obligations, or other relevant circumstances...",
            height=120,
            help="This information helps us provide more accurate recommendations and identify potential issues before they become problems."
        )
        update_data("individual.residencyIntentions.taxComplianceExplanation", tax_compliance_explanation)

    # ======================= SECTION SUMMARY =======================
    st.divider()
    display_section("individual.residencyIntentions", "Residency Intentions") 
    
    # VISUAL SECTION SEPARATOR
    return filled_in_correctly(get_data("individual.residencyIntentions"))

def select_move_type():
    """Handle move type selection with data binding"""
    # CONSISTENT OPTION SELECTION
    move_type_options = ["Permanent", "Temporary", "Digital Nomad"]
    current_move_type = get_data("individual.residencyIntentions.destinationCountry.moveType")
    move_type_index = move_type_options.index(current_move_type) \
        if current_move_type in move_type_options \
            else 0
    move_type = st.selectbox(
        "Type of move",
        move_type_options,
        help="Select the type of move you are planning.",
        index=move_type_index)
    update_data("individual.residencyIntentions.destinationCountry.moveType", move_type)
    return move_type

def duration_of_stay():
    """Handle temporary stay duration with data binding"""
    # NUMERICAL INPUT WITH CONSISTENT FORMATTING
    cols = st.columns(2)
    with cols[0]:
        duration_of_stay = st.number_input(
            "Intended duration (years)",
            min_value=0.0, 
            max_value=10.0, 
            value=float(get_data("individual.residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay") or 0.0),
            step=0.5,
            help="Enter how long you plan to stay in the destination country")
    update_data("individual.residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay", duration_of_stay)



def residency(destination):
    """Handle residency application checkbox with data binding"""
    # CONSISTENT CHECKBOX PATTERN
    dest_label = format_country_name(destination)
    apply_for_residency = st.checkbox(
        f"I want to apply for residency in {dest_label}", 
        value=get_data("individual.residencyIntentions.residencyPlans.applyForResidency"),
        help="Check this if you plan to apply for formal residency status")
    update_data(
        "individual.residencyIntentions.residencyPlans.applyForResidency",
        apply_for_residency)
    return apply_for_residency

def citizenship(destination):
    """Handle citizenship interest checkbox with data binding"""
    # CONSISTENT CHECKBOX PATTERN
    dest_label = format_country_name(destination)
    interested_in_citizenship = st.checkbox(
        f"I am interested in becoming a citizen of {dest_label}", 
        value=get_data("individual.residencyIntentions.citizenshipPlans.interestedInCitizenship"),
        help="Check this if you're interested in eventually obtaining citizenship")
    update_data(
        "individual.residencyIntentions.citizenshipPlans.interestedInCitizenship",
        interested_in_citizenship)
    return interested_in_citizenship

def maximum_minimum_stay():
    """Handle minimum stay requirements with information expander"""
    # CONSISTENT SUBHEADER PATTERN
    st.subheader("⏱️ Minimum Stay Requirements")
    
    # INFORMATION EXPANDER PATTERN
    with st.expander("📚 Learn about minimum stay requirements"):
        st.markdown("""
        **Important information about physical presence requirements:**
        
        Many countries require applicants to be physically present for a minimum period each year:
        
        - This is especially important during initial residency years
        - Requirements typically range from 3-9 months per year
        - Some programs have reduced presence requirements for investors
        - Absence periods may need pre-approval from immigration authorities
        - Requirements often relax after permanent residency is granted
        
        Your answer helps identify suitable residency pathways based on your travel needs.
        """)
    
    # Checkbox for minimum requirement option
    want_minimum_only = st.checkbox(
        "Just let me know about minimum stay requirements",
        value=bool(get_data("individual.residencyIntentions.residencyPlans.wantMinimumOnly")),
        help="Check this if you want us to tell you the minimum residency requirements instead of setting a specific preference."
    )
    update_data("individual.residencyIntentions.residencyPlans.wantMinimumOnly", want_minimum_only)
    
    if want_minimum_only:
        st.info("✅ We'll provide recommendations based on the minimum residency requirements for your destination country. This typically ranges from a few days to a few months per year, depending on the visa type.")
        # Set a placeholder value when minimum-only is selected
        max_months = 0  # This indicates we should use minimum requirements
        update_data("individual.residencyIntentions.residencyPlans.maxMonthsWillingToReside", max_months)
    else:
        # SLIDER WITH CONSISTENT FORMATTING
        max_months = st.slider(
            "Maximum months per year I am willing to reside in the target country in my first year",
            min_value=0,
            max_value=12,
            value=int(get_data("individual.residencyIntentions.residencyPlans.maxMonthsWillingToReside") or 6),
            help="Select the maximum number of months you're willing to stay in the country each year."
        )
        update_data("individual.residencyIntentions.residencyPlans.maxMonthsWillingToReside", max_months)

    # CONDITIONAL DISPLAY PATTERN
    if max_months == 0 and not want_minimum_only:
        st.warning("⚠️ You've indicated you don't want to be physically present at all.")
        open_to_visiting = st.checkbox(
            "I'm open to occasional visits if required",
            help="Some countries allow minimal presence with occasional visits",
            value=get_data("individual.residencyIntentions.residencyPlans.openToVisiting")
        )
        update_data("individual.residencyIntentions.residencyPlans.openToVisiting", open_to_visiting)
    
    if max_months <= 6 and not want_minimum_only:
        st.info("ℹ️ Limited physical presence may trigger 'Center of Life' tax issues in other countries. See section below.")

    # -------------------- CENTER OF LIFE (moved here) --------------------
    # Always show it immediately after the warning so users can act on it
    center_of_life()

def citizenship_by_family():
    """Handle family-based citizenship options with data binding"""
    # CONSISTENT EXPANDER PATTERN
    with st.expander("👪 Family Connections"):
        st.markdown("**Citizenship by family ties**")
        
        # CONSISTENT CHECKBOX PATTERN
        open_to_family = st.checkbox(
            "I have family ties to this country",
            help="Check if you have family connections that might help with citizenship",
            value=get_data("individual.residencyIntentions.citizenshipPlans.familyTies.hasConnections")
        )
        update_data("individual.residencyIntentions.citizenshipPlans.familyTies.hasConnections", open_to_family)
        
        # CONDITIONAL DISPLAY PATTERN
        if open_to_family:
            family_relation = st.text_input(
                "Describe your closest family relation in the country",
                help="E.g., parent, grandparent, spouse, child",
                value=get_data("individual.residencyIntentions.citizenshipPlans.familyTies.closestRelation") or ""
            )
            update_data("individual.residencyIntentions.citizenshipPlans.familyTies.closestRelation", family_relation)

def citizenship_by_military_service():
    """Handle military service citizenship options with data binding"""
    # CONSISTENT EXPANDER PATTERN
    with st.expander("🪖 Military Service"):
        st.markdown("**Citizenship through military service**")
        
        # CONSISTENT CHECKBOX PATTERN
        open_to_military = st.checkbox(
            "I am open to military service",
            help="Check if you are willing to serve in the military for citizenship",
            value=get_data("individual.residencyIntentions.citizenshipPlans.militaryService.willing")
        )
        update_data("individual.residencyIntentions.citizenshipPlans.militaryService.willing", open_to_military)
        
        # CONDITIONAL DISPLAY PATTERN
        if open_to_military:
            service_duration = st.number_input(
                "Maximum years of service",
                min_value=1,
                max_value=10,
                value=int(get_data("individual.residencyIntentions.citizenshipPlans.militaryService.maxServiceYears") or 2),
                help="Enter the maximum number of years you're willing to serve"
            )
            update_data("individual.residencyIntentions.citizenshipPlans.militaryService.maxServiceYears", service_duration)

def citizenship_by_investment():
    """Handle investment-based citizenship options with data binding"""
    # CONSISTENT EXPANDER PATTERN
    with st.expander("💼 Investment"):
        st.markdown("**Citizenship by investment**")
        
        # CONSISTENT CHECKBOX PATTERN
        open_to_investment = st.checkbox(
            "I am open to investment",
            help="Check if you are open to making investments for citizenship",
            value=get_data("individual.residencyIntentions.citizenshipPlans.investment.willing")
        )
        update_data("individual.residencyIntentions.citizenshipPlans.investment.willing", open_to_investment)
        
        # CONDITIONAL DISPLAY PATTERN
        if open_to_investment:
            # CONSISTENT TWO-COLUMN LAYOUT FOR RELATED INPUTS
            col41, col42, = st.columns(2)
            with col41:
                investment_amount = st.number_input(
                    "Investment Amount",
                    min_value=0,
                    value=int(get_data("individual.residencyIntentions.citizenshipPlans.investment.amount") or 0),
                    help="Enter the amount you are willing to invest"
                )
                update_data("individual.residencyIntentions.citizenshipPlans.investment.amount", investment_amount)
            with col42:
                usd_index = st.session_state.currencies.index("USD") if "USD" in st.session_state.currencies else 0
                investment_currency = st.selectbox(
                    "Currency",
                    options=sorted(st.session_state.currencies),
                    index=sorted(st.session_state.currencies).index(get_data("individual.residencyIntentions.citizenshipPlans.investment.currency")) if get_data("individual.residencyIntentions.citizenshipPlans.investment.currency") in st.session_state.currencies else usd_index,
                    help="Select the currency for your investment"
                )
                update_data("individual.residencyIntentions.citizenshipPlans.investment.currency", investment_currency)

def citizenship_by_donation():
    """Handle donation-based citizenship options with data binding"""
    # CONSISTENT EXPANDER PATTERN
    with st.expander("🎁 Donation"):
        st.markdown("**Citizenship by donation**")
        
        # CONSISTENT CHECKBOX PATTERN
        open_to_donation = st.checkbox(
            "I am open to donate",
            help="Check if you are open to making donations for citizenship",
            value=get_data("individual.residencyIntentions.citizenshipPlans.donation.willing")
        )
        update_data("individual.residencyIntentions.citizenshipPlans.donation.willing", open_to_donation)
        
        # CONDITIONAL DISPLAY PATTERN
        if open_to_donation:
            # CONSISTENT TWO-COLUMN LAYOUT FOR RELATED INPUTS
            col51, col52, = st.columns(2)
            with col51:
                donation_amount = st.number_input(
                    "Donation amount",
                    min_value=0,
                    value=int(get_data("individual.residencyIntentions.citizenshipPlans.donation.amount") or 0),
                    help="Enter the amount you are willing to donate"
                )
                update_data("individual.residencyIntentions.citizenshipPlans.donation.amount", donation_amount)
            with col52:
                usd_index = st.session_state.currencies.index("USD") if "USD" in st.session_state.currencies else 0
                donation_currency = st.selectbox(
                    "Currency",
                    options=sorted(st.session_state.currencies),
                    index=sorted(st.session_state.currencies).index(get_data("individual.residencyIntentions.citizenshipPlans.donation.currency")) if get_data("individual.residencyIntentions.citizenshipPlans.donation.currency") in st.session_state.currencies else usd_index,
                    help="Select the currency for your donation"
                )
                update_data("individual.residencyIntentions.citizenshipPlans.donation.currency", donation_currency)



def center_of_life():
    """Handle center of life tax implications section with information expander"""
    # CONSISTENT SUBHEADER PATTERN
    st.subheader("🏠 Center of Life Tax Implications")
    
    # INFORMATION EXPANDER PATTERN
    with st.expander("📚 Learn about 'Center of Life' and its tax implications"):
        st.markdown("""
        **Understanding 'Center of Life' for Tax Purposes:**
        
        If you maintain significant presence or business connections with another country after moving, 
        that country may consider your "Center of Life" to be there, making you liable for taxation.

        **Countries determine your "center of life" based on:**
        - Time spent in the country (often >183 days/year)
        - Location of permanent home
        - Family ties
        - Economic interests (job, bank accounts)
        - Social connections

        **Simplified explanation:**
        Your "center of life" is like your favorite playground. Countries want to know if their 
        'playground' is your favorite because it affects how much 'taxes' they can collect from you.
        
        Understanding this concept is crucial for tax planning when relocating or spending significant 
        time abroad.
        """)
    
    # CONSISTENT CHECKBOX PATTERN
    has_other_ties = st.checkbox(
        "I will maintain significant ties with my current country, or another country that is not the destination country, after moving.",
        key="has_other_ties",
        value=get_data("individual.residencyIntentions.centerOfLife.maintainsSignificantTies"),
        help="Check if you'll keep a home, business, or spend substantial time in your current country"
    )
    update_data("individual.residencyIntentions.centerOfLife.maintainsSignificantTies", has_other_ties)
    
    # CONDITIONAL DISPLAY PATTERN
    if has_other_ties:
        ties_description = st.text_area(
            "Describe your ongoing connections",
            value=get_data("individual.residencyIntentions.centerOfLife.tiesDescription") or "",
            help="Examples: keeping property, business interests, family connections, frequent visits",
            placeholder="E.g., I will keep my house and visit family for 2 months each year"
        )
        update_data("individual.residencyIntentions.centerOfLife.tiesDescription", ties_description)

def move_motivation_section():
    """Textbox for user's motivation to move to the country, with state binding."""
    st.subheader("✍️ Why do you want to move?")
    move_motivation = st.text_area(
        "Briefly describe your motivation for moving",
        value=get_data("individual.residencyIntentions.moveMotivation") or "",
        help="This can help tailor advice to your personal goals and may be relevant for visa applications."
    )
    update_data("individual.residencyIntentions.moveMotivation", move_motivation)

def filled_in_correctly(state):
    """Validate that all required fields are filled in correctly"""
    # VALIDATION PATTERN
    errors = []
    
    # Check destination country
    if not state.get("destinationCountry", {}).get("country"):
        errors.append("Destination country is required")
    
    # Check move type
    if not state.get("destinationCountry", {}).get("moveType"):
        errors.append("Type of move is required")
    
    # Check temporary duration if applicable
    if state.get("destinationCountry", {}).get("moveType") == "Temporary" and not state.get("destinationCountry", {}).get("intendedTemporaryDurationOfStay"):
        errors.append("Duration of temporary stay is required")
    
    # Check residency plans if applicable
    if state.get("residencyPlans", {}).get("applyForResidency") and state.get("residencyPlans", {}).get("maxMonthsWillingToReside") is None:
        errors.append("Maximum months willing to reside is required")
    
    # Check citizenship plans if applicable
    if state.get("citizenshipPlans", {}).get("interestedInCitizenship"):
        # Check investment details if willing
        if state.get("citizenshipPlans", {}).get("investment", {}).get("willing") and not state.get("citizenshipPlans", {}).get("investment", {}).get("amount"):
            errors.append("Investment amount is required")
        
        # Check donation details if willing
        if state.get("citizenshipPlans", {}).get("donation", {}).get("willing") and not state.get("citizenshipPlans", {}).get("donation", {}).get("amount"):
            errors.append("Donation amount is required")
    
    # Display validation results
    if errors:
        st.error("⚠️ Please fix the following errors:")
        for error in errors:
            st.warning(error)
        return False
    
    return True

