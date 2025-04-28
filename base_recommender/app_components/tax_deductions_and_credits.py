import streamlit as st
import datetime
from app_components.helpers import (
    update_data, get_data, display_section, get_country_list)

def tax_deductions_and_credits(anchor):
    """
    Tax Deductions and Credits Section with distinctive styling
    """

    # ======================= SECTION HEADER =======================
    st.header(f"🪙 {anchor}", anchor=anchor, divider="rainbow")
    
    # -------------------- VISIBILITY TOGGLE --------------------
    if not st.toggle(f"📋 Show {anchor}", value=True, key=f"show_{anchor}"):
        st.info(f"🔍 {anchor} section is hidden. Toggle to show. Your previously entered data is preserved.")
        return

    # -------------------- SECTION IMPORTANCE --------------------
    with st.expander("💡 Why is this section important?"):
        st.warning("""
        **Understanding tax deductions and credits helps:**
        - Identify potential tax savings in your destination country
        - Ensure compliance with international tax treaties
        - Plan for cross-border tax efficiency
        - Avoid double taxation on certain expenses
        - Maximize available benefits in your new tax jurisdiction
        - Document important financial obligations with tax implications
        """)

    # ======================= DEDUCTIONS SECTION =======================
    deductions_section()
                    
    # ======================= SECTION SUMMARY =======================
    display_section("individual.taxDeductionsAndCredits", "Tax Deductions and Credits")
    
    return filled_in_correctly(get_data("individual.taxDeductionsAndCredits"))

def deductions_section():
    """Handles adding and displaying potential tax deductions with international support."""
    # ======================= DEDUCTIONS HEADER =======================
    st.subheader("💲 Potential Tax Deductions & Credits")
    
    # DATA INITIALIZATION PATTERN
    deductions = get_data("individual.taxDeductionsAndCredits.potentialDeductions")
    if not isinstance(deductions, list):
        deductions = [deductions] if deductions else []
        update_data("individual.taxDeductionsAndCredits.potentialDeductions", deductions)
    
    # -------------------- INFORMATION EXPANDER --------------------
    with st.expander("📚 Understanding Tax Deductions & Credits"):
        st.markdown("""
        **Tax treatments vary by country. Common deductible items include:**
        - **Alimony/Spousal Support**: *Paid* (may reduce taxable income) / *Received* (may be taxable)
        - **Charitable Donations**: To registered organizations
        - **Medical Expenses**: Above specific income thresholds
        - **Education Costs**: Tuition fees, student loan interest
        - **Work-Related Expenses**: Uniforms, tools, home office
        - **Retirement Contributions**: To approved pension plans

        *Always verify local tax rules - this is not legal advice.*
        """)

    # -------------------- ALIMONY FORM PATTERN --------------------
    with st.expander("➕ Add Alimony/Spousal Support"):
        with st.form("alimony_form"):
            # CONSISTENT TWO-COLUMN LAYOUT FOR RELATED INPUTS
            col1, col2 = st.columns(2)
            with col1:
                alimony_type = st.radio(
                    "Alimony Type",
                    ["Paid", "Received"],
                    help="Select whether you paid or received spousal support")
            with col2:
                country = st.selectbox(
                    "Governing Country",
                    options=[""] + get_country_list(),
                    index=0,
                    help="Country where divorce agreement was finalized")

            # DATE INPUT WITH CONSISTENT FORMATTING
            agreement_date = st.date_input(
                "Agreement Date",
                value=None,
                min_value=datetime.date(1970, 1, 1),
                max_value=datetime.date.today(),
                help="Date of court order/legal agreement"
            )

            # NUMERICAL INPUT WITH CONSISTENT FORMATTING
            amount = st.number_input(
                "Annual Amount",
                min_value=0.0,
                step=500.0,
                format="%.2f",
                help="Yearly spousal support amount")

            # CURRENCY SELECTION PATTERN
            currency = st.selectbox(
                "Currency",
                options=sorted(st.session_state.currencies),
                index=sorted(st.session_state.currencies).index("USD"),
                key="alimony_currency")

            # CONSISTENT FORM SUBMISSION PATTERN
            if st.form_submit_button("💾 Add Alimony Entry"):
                new_entry = {
                    "type": f"Alimony {alimony_type}",
                    "amount": amount,
                    "currency": currency,
                    "country": country,
                    "date": agreement_date.isoformat() if agreement_date else "",
                    "notes": f"Governed by {country} law" if country else ""
                }
                deductions.append(new_entry)
                update_data("individual.taxDeductionsAndCredits.potentialDeductions", deductions)
                st.rerun()

    # -------------------- GENERAL DEDUCTION FORM --------------------
    add_deduction_form(deductions)
    
    # -------------------- DISPLAY EXISTING DEDUCTIONS --------------------
    if deductions:
        display_deductions(deductions)
        st.warning("⚠️ Whether this is a deductible in your desired destination remains to be seen.")

def add_deduction_form(deductions):
    """Universal deduction form with common international categories"""
    # -------------------- ADD NEW ITEM PATTERN --------------------
    with st.expander("➕ Add Other Deduction/Credit"):
        with st.form("general_deduction_form"):
            # CONSISTENT OPTION SELECTION
            ded_type = st.selectbox(
                "Deduction Category",
                options=[
                    "Charitable Donations",
                    "Medical Expenses",
                    "Education Costs",
                    "Work-Related Expenses",
                    "Retirement Contributions",
                    "Other"
                ],
                index=0)

            # CONDITIONAL INPUT PATTERN
            custom_type = st.text_input(
                "Specify Type (if 'Other')",
                disabled=(ded_type != "Other")) if ded_type == "Other" else None

            # NUMERICAL INPUT WITH CONSISTENT FORMATTING
            amount = st.number_input(
                "Amount",
                min_value=0.0,
                step=0.5,
                format="%.2f")

            # CURRENCY SELECTION PATTERN
            currency = st.selectbox(
                "Currency",
                options=sorted(st.session_state.currencies),
                index=sorted(st.session_state.currencies).index("USD"))

            # COUNTRY SELECTION PATTERN
            country = st.selectbox(
                "Applicable Country",
                options=[""] + get_country_list(),
                help="Country where deduction is claimed")

            # CONSISTENT FORM SUBMISSION PATTERN
            if st.form_submit_button("💾 Add Deduction"):
                entry = {
                    "type": ded_type if ded_type != "Other" else custom_type,
                    "amount": amount,
                    "currency": currency,
                    "country": country
                }
                deductions.append(entry)
                update_data("individual.taxDeductionsAndCredits.potentialDeductions", deductions)
                st.rerun()

def filled_in_correctly(tax_deductions_and_credits_state):
    """Enhanced validation for international compliance"""
    deductions = tax_deductions_and_credits_state.get("potentialDeductions", [])
    
    for ded in deductions:
        # Require country for all entries
        if not ded.get("country"):
            return False
        
        # Special validation for alimony
        if "Alimony" in ded.get("type", ""):
            if not ded.get("date"):
                return False
            if ded.get("type") == "Alimony Paid" and not ded.get("legal_reference"):
                st.warning("⚠️ Alimony payments require legal agreement details")
                return False

    return True

def display_deductions(deductions):
    """Displays a list of existing deductions and their summary."""
    # -------------------- DISPLAY ITEMS PATTERN --------------------
    st.markdown("**📊 Registered Deductions & Credits**")
    
    # Display each deduction in an expander
    for i, deduction in enumerate(deductions):
        with st.expander(f"Item {i+1}: {deduction.get('type', 'Unnamed Deduction')}"):
            # SPLIT CONTENT AND ACTIONS
            col1, col2 = st.columns([0.8, 0.2])
            with col1:
                st.write(f"**Type:** {deduction.get('type', '')}")
                st.write(f"**Amount:** {deduction.get('currency', '')} {deduction.get('amount', 0.0):,.2f}")
                st.write(f"**Country:** {deduction.get('country', '')}")
                if deduction.get('date'):
                    st.write(f"**Date:** {deduction.get('date', '')}")
                if deduction.get('notes'):
                    st.write(f"**Notes:** {deduction.get('notes', '')}")
            
            with col2:
                # CONSISTENT REMOVAL PATTERN
                if st.button("❌ Remove", key=f"remove_deduction_{i}"):
                    del deductions[i]
                    update_data("individual.taxDeductionsAndCredits.potentialDeductions", deductions)
                    st.rerun()
    
    # Generate summary table
    if deductions:
        st.subheader("📈 Summary of Deductions")
        
        # Aggregate data into a summary format
        summary_data = {
            "Type": [deduction.get("type", "") for deduction in deductions],
            "Amount": [f"{deduction.get('currency', '')} {deduction.get('amount', 0.0):,.2f}" 
                      for deduction in deductions],
            "Country": [deduction.get("country", "") for deduction in deductions],
        }
        
        # Display the summary table
        st.table(summary_data)
