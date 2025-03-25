import streamlit as st
from app_components.helpers import update_data, get_data

def tax_planning():
    """Render the Tax Planning section."""
    # st.header("Tax Planning")
    
    deductions = get_data("individual.taxDeductionsAndCredits.potentialDeductions", [])
    
    with st.expander("Add Tax Deduction"):
        with st.form("add_tax_deduction"):
            deduction_type = st.text_input("Deduction Type")
            amount = st.number_input("Amount", min_value=0.0)
            currency = st.text_input("Currency")
            
            submitted = st.form_submit_button("Add Deduction")
            if submitted and deduction_type:
                deductions.append({"type": deduction_type, "amount": amount, "currency": currency})
                update_data("individual.taxDeductionsAndCredits.potentialDeductions", deductions)
    
    if deductions:
        for deduction in deductions:
            st.write(deduction)
