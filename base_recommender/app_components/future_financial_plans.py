import streamlit as st
from app_components.helpers import update_data, get_data

def future_financial_plans():
    """Render the Future Financial Plans section."""
    # st.header("Future Financial Plans")

    planned_investments = get_data("individual.futureFinancialPlans.plannedInvestments", [])
    
    with st.expander("Add Planned Investment"):
        with st.form("add_planned_investment"):
            investment_type = st.text_input("Investment Type")
            country = st.text_input("Country")
            estimated_value = st.number_input("Estimated Value", min_value=0.0)
            currency = st.text_input("Currency")
            
            submitted = st.form_submit_button("Add Investment")
            if submitted and investment_type:
                planned_investments.append({
                    "type": investment_type,
                    "country": country,
                    "estimatedValue": estimated_value,
                    "currency": currency
                })
                update_data("individual.futureFinancialPlans.plannedInvestments", planned_investments)
    
    if planned_investments:
        for investment in planned_investments:
            st.write(investment)
