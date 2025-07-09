import streamlit as st
import textwrap
from app_components.helpers import update_data, get_data, display_section, get_country_list

def social_security_pensions(anchor):
    """
    Social Security and Pensions Section with distinctive styling
    """
    # ======================= SECTION HEADER =======================
    if st.session_state.get("skip_tax_sections"):
        st.header(f"🏥 {anchor}", anchor=anchor, divider="rainbow")
        st.info("🚀 Detailed Social-Security / Pension inputs skipped per your earlier choice.")
        display_section("individual.socialSecurityAndPensions", "Social Security & Pensions (Summary Only)")
        return

    st.header(f"⚖️ {anchor}", anchor=anchor, divider="rainbow")

    # -------------------- VISIBILITY TOGGLE --------------------
    if not st.toggle(f"📋 Show {anchor}", value=True, key=f"show_{anchor}"):
        st.info(f"🔍 {anchor} section is hidden. Toggle to show. Your previously entered data is preserved.")
        return

    # -------------------- SECTION IMPORTANCE --------------------
    with st.expander("💡 Why is this section important?"):
        st.warning(textwrap.dedent("""
        **Understanding your pension and social security situation helps:**
        - Determine tax obligations in multiple jurisdictions
        - Qualify for retirement benefits in your destination country
        - Ensure compliance with international social security agreements
        - Plan for retirement tax efficiency
        - Avoid double taxation on pension income
        - Meet residency requirements that often consider social security integration
        """))

    # ======================= SOCIAL SECURITY CONTRIBUTIONS =======================
    with st.container(border=True):
        st.subheader("🔐 Social security/national insurance contributions")
        st.caption("Applies to any government-mandated retirement/social insurance system")
        
        # DATA BINDING WITH CLEAR LABELING
        contributing_to_social_security = st.checkbox(
            "Currently making mandatory social security contributions",
            value=get_data("individual.socialSecurityAndPensions.currentCountryContributions.isContributing"),
            help="Includes national insurance, superannuation, provident funds, or any state pension system")
        update_data(
            "individual.socialSecurityAndPensions.currentCountryContributions.isContributing",
            contributing_to_social_security)

        # CONDITIONAL DISPLAY WITH CONSISTENT COLUMN LAYOUT
        if contributing_to_social_security:
            col1, col2 = st.columns(2)
            with col1:
                # COUNTRY SELECTION WITH DATA BINDING
                contribution_country = st.selectbox(
                    "Country of contribution",
                    options=[""] + get_country_list(),
                    index=get_country_list().index(get_data("individual.socialSecurityAndPensions.currentCountryContributions.country")) + 1 
                    if get_data("individual.socialSecurityAndPensions.currentCountryContributions.country") in get_country_list() else 0,
                    help="Select country where you're currently contributing")
                update_data(
                    "individual.socialSecurityAndPensions.currentCountryContributions.country",
                    contribution_country)

            with col2:
                # NUMERICAL INPUT WITH CONSISTENT FORMATTING
                years_contributed = st.number_input(
                    "Total contribution years (including partial years)",
                    min_value=0.0,
                    value=float(get_data("individual.socialSecurityAndPensions.currentCountryContributions.yearsOfContribution") or 0.0),
                    step=0.5,
                    format="%.1f",
                    help="Counts contributions to any national system, even if not continuous")
                update_data(
                    "individual.socialSecurityAndPensions.currentCountryContributions.yearsOfContribution",
                    years_contributed)

    # ======================= VOLUNTARY PENSION ARRANGEMENTS =======================
    with st.container(border=True):
        st.subheader("💰 Voluntary pension arrangements")
        
        # CONSISTENT CHECKBOX PATTERN
        planning_pension_contributions = st.checkbox(
            "Making voluntary retirement contributions",
            value=get_data("individual.socialSecurityAndPensions.futurePensionContributions.isPlanning"),
            help="Includes private pensions, occupational schemes, or personal retirement accounts")
        update_data(
            "individual.socialSecurityAndPensions.futurePensionContributions.isPlanning",
            planning_pension_contributions)

        if planning_pension_contributions:
            # DATA INITIALIZATION PATTERN
            pension_schemes = get_data("individual.socialSecurityAndPensions.futurePensionContributions.details")
            if not isinstance(pension_schemes, list):  # Handle legacy single-entry format
                pension_schemes = [pension_schemes] if pension_schemes else []
                update_data("individual.socialSecurityAndPensions.futurePensionContributions.details", pension_schemes)

            # -------------------- ADD NEW ITEM PATTERN --------------------
            with st.expander("➕ Add new pension scheme"):
                with st.form("add_pension_scheme"):
                    # CONSISTENT OPTION SELECTION
                    options = [
                        "Employer-sponsored plan", 
                        "Personal retirement account",
                        "National voluntary scheme",
                        "Industry-wide plan",
                        "Cross-border pension",
                        "Other"]
                    
                    pension_type = st.selectbox(
                        "Pension scheme type",
                        options=options,
                        index=0,
                        help="Select closest match to your retirement vehicle")
                    
                    # CONDITIONAL INPUT PATTERN
                    other_pension_type = st.text_input(
                        "Specify scheme name if needed",
                        value="",
                        help="Required if selecting 'Other'"
                    ) if pension_type == "Other" else None
                    
                    # CONSISTENT TWO-COLUMN LAYOUT FOR RELATED INPUTS
                    col_curr, col_amt = st.columns(2)
                    with col_curr:
                        currency = st.selectbox(
                            "Contribution currency",
                            options=sorted(st.session_state.currencies),
                            index=st.session_state.currencies.index("USD"),
                            key="new_pension_currency")

                    with col_amt:
                        contribution_amount = st.number_input(
                            "Annual contribution amount",
                            min_value=0.0,
                            value=0.0,
                            step=0.5,
                            help="In local currency - include employer matches if applicable")
                    
                    # COUNTRY SELECTION PATTERN
                    country_of_pension = st.selectbox(
                        "Governing jurisdiction",
                        options=[""] + get_country_list(),
                        index=0,
                        help="Country where the pension scheme is regulated")
                    
                    # CONSISTENT FORM SUBMISSION PATTERN
                    submitted = st.form_submit_button("💾 Add Scheme")
                    if submitted:
                        new_scheme = {
                            "pensionType": pension_type if pension_type != "Other" else other_pension_type,
                            "contributionAmount": contribution_amount,
                            "currency": currency,
                            "country": country_of_pension}
                        pension_schemes.append(new_scheme)
                        update_data("individual.socialSecurityAndPensions.futurePensionContributions.details", pension_schemes)
                        st.rerun()

            # -------------------- DISPLAY ITEMS PATTERN --------------------
            if pension_schemes:
                st.markdown("**📊 Registered pension schemes**")
                for idx, scheme in enumerate(pension_schemes):
                    with st.expander(f"Scheme {idx+1}: {scheme.get('pensionType', 'Unnamed Scheme')}"):
                        # SPLIT CONTENT AND ACTIONS
                        col1, col2 = st.columns([0.8, 0.2]) 
                        with col1:
                            st.write(f"**Type:** {scheme.get('pensionType', '')}")
                            st.write(f"**Country:** {scheme.get('country', '')}")
                            st.write(f"**Annual Contribution:** {scheme.get('currency', '')} {scheme.get('contributionAmount', 0.0):,.2f}")
                        with col2:
                            # CONSISTENT REMOVAL PATTERN
                            if st.button("❌ Remove", key=f"remove_scheme_{idx}"):
                                del pension_schemes[idx]
                                update_data("individual.socialSecurityAndPensions.futurePensionContributions.details", pension_schemes)
                                st.rerun()

    # ======================= EXISTING RETIREMENT ASSETS =======================
    with st.container(border=True):
        st.subheader("🏦 Existing Retirement Assets")
        
        # CONSISTENT CHECKBOX PATTERN
        has_existing_pensions = st.checkbox(
            "Hold existing retirement/pension assets",
            value=get_data("individual.socialSecurityAndPensions.existingPlans.hasPlans"),
            help="Includes any vested pension rights, frozen plans, or portable retirement accounts")
        update_data("individual.socialSecurityAndPensions.existingPlans.hasPlans", has_existing_pensions)

        if has_existing_pensions:
            # DATA INITIALIZATION PATTERN
            existing_plans = get_data("individual.socialSecurityAndPensions.existingPlans.details")
            if not isinstance(existing_plans, list):  # Handle legacy format
                existing_plans = [existing_plans] if existing_plans else []
                update_data("individual.socialSecurityAndPensions.existingPlans.details", existing_plans)

            # -------------------- ADD NEW ITEM PATTERN --------------------
            with st.expander("➕ Add pension asset"):
                with st.form("add_existing_pension"):
                    # CONSISTENT OPTION SELECTION
                    plan_type = st.selectbox(
                        "Plan category",
                        options=[
                            "Defined benefit plan",
                            "Defined contribution plan",
                            "National social security entitlement",
                            "Portable retirement account",
                            "Annuity contract",
                            "Other"],
                        index=0,
                        help="Select closest regulatory classification")
                    
                    # CONSISTENT TWO-COLUMN LAYOUT FOR RELATED INPUTS
                    col_curr, col_amt = st.columns(2)
                    with col_curr:
                        currency = st.selectbox(
                            "Asset currency",
                            options=sorted(st.session_state.currencies),
                            index=sorted(st.session_state.currencies).index("USD"),
                            help="Select currency for asset valuation")

                    with col_amt:
                        current_value = st.number_input(
                            "Current actuarial value",
                            min_value=0.0,
                            value=0.0,
                            step=0.5,
                            help="For DB plans, estimate transfer value")
                    
                    # COUNTRY SELECTION PATTERN
                    governing_country = st.selectbox(
                        "Governing jurisdiction",
                        options=[""] + get_country_list(),
                        index=0,
                        help="Country where plan is regulated")
                    
                    # CONSISTENT FORM SUBMISSION PATTERN
                    submitted = st.form_submit_button("💾 Add pension asset")
                    if submitted:
                        existing_plans.append({
                            "planType": plan_type,
                            "currency": currency,
                            "currentValue": current_value,
                            "country": governing_country})
                        update_data("individual.socialSecurityAndPensions.existingPlans.details", existing_plans)
                        st.rerun()

            # -------------------- DISPLAY ITEMS PATTERN --------------------
            if existing_plans:
                st.markdown("**📊 Registered Retirement Assets**")
                for idx, plan in enumerate(existing_plans):
                    with st.expander(f"Asset {idx+1}: {plan.get('planType', 'Unnamed Plan')}"):
                        # SPLIT CONTENT AND ACTIONS
                        col1, col2 = st.columns([0.8, 0.2])
                        with col1:
                            st.write(f"**Type:** {plan.get('planType', '')}")
                            st.write(f"**Country:** {plan.get('country', '')}")
                            st.write(f"**Current Value:** {plan.get('currency', 'USD')} {plan.get('currentValue', 0.0):,.2f}")
                        with col2:
                            # CONSISTENT REMOVAL PATTERN
                            if st.button("❌ Remove", key=f"remove_plan_{idx}"):
                                del existing_plans[idx]
                                update_data("individual.socialSecurityAndPensions.existingPlans.details", existing_plans)
                                st.rerun()

    # ======================= SECTION SUMMARY =======================
    display_section("individual.socialSecurityAndPensions", "Social Security and Pensions")
        

