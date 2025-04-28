import streamlit as st
from app_components.helpers import (
    update_data, get_data, display_section)

def future_financial_plans(anchor):
    st.header(f"🏡 {anchor}", anchor=anchor, divider="rainbow")    
    if not st.toggle(f"Show {anchor}", value=True, key=f"show_{anchor}"):
        st.info(f"{anchor} section is hidden. Toggle to show. Your previously entered data is preserved.")
    
    else:
        # Retrieve planned financial activities
        planned_investments = get_data("individual.futureFinancialPlans.plannedInvestments")
        planned_property_transactions = get_data("individual.futureFinancialPlans.plannedPropertyTransactions")
        planned_retirement_contributions = get_data("individual.futureFinancialPlans.plannedRetirementContributions")
        planned_business_changes = get_data("individual.futureFinancialPlans.plannedBusinessChanges")

        # Planned Investments Section
        st.subheader("Investment plans")        
        with st.expander("Add Planned Investment"):
            with st.form("add_planned_investment"):
                investment_type = st.selectbox(
                    "Investment type",
                    ["Stocks", "Bonds", "Real Estate", "Cryptocurrency", "Mutual Funds", "Other"]
                )
                other_investment_type = ""
                if investment_type == "Other":
                    other_investment_type = st.text_input("If Other, specify")
                country = st.text_input("Country of Investment")
                estimated_value = st.number_input("Estimated Value (in local currency)", min_value=0.0)
                
                submitted = st.form_submit_button("Add Investment")
                if submitted and (investment_type or other_investment_type):
                    planned_investments.append({
                        "type": investment_type if investment_type != "Other" else other_investment_type,
                        "country": country,
                        "estimatedValue": estimated_value,
                    })
                    update_data("individual.futureFinancialPlans.plannedInvestments", planned_investments)
        
        if planned_investments:
            for investment in planned_investments:
                st.write(investment)

        # Planned Property Transactions Section
        st.subheader("Real estate plans")        
        with st.expander("Add Property Transaction"):
            with st.form("add_property_transaction"):
                transaction_type = st.selectbox(
                    "Transaction Type",
                    ["Buy", "Sell", "Rent Out"]
                )
                country = st.text_input("Country of Property")
                estimated_value = st.number_input(
                    f"Estimated {'Purchase Price' if transaction_type == 'Buy' else 'Sale Value'} (in local currency)", 
                    min_value=0.0
                )
                
                submitted = st.form_submit_button("Add Property Transaction")
                if submitted and transaction_type:
                    planned_property_transactions.append({
                        "transactionType": transaction_type,
                        "country": country,
                        "estimatedValue": estimated_value,
                    })
                    update_data("individual.futureFinancialPlans.plannedPropertyTransactions", planned_property_transactions)
        
        if planned_property_transactions:
            for transaction in planned_property_transactions:
                st.write(transaction)

        # Planned Retirement Contributions Section
        st.subheader("Retirement plans")        
        with st.expander("Add Retirement Contribution"):
            with st.form("add_retirement_contribution"):
                account_type = st.selectbox(
                    "Retirement Account Type",
                    ["401(k)", "IRA/Roth IRA", "Pension Plan", "Other"]
                )
                other_account_type = ""
                if account_type == "Other":
                    other_account_type = st.text_input("If Other, specify")
                country = st.text_input("Country of Account")
                contribution_amount = st.number_input(
                    "Planned Contribution Amount (in local currency)", 
                    min_value=0.0
                )
                
                submitted = st.form_submit_button("Add Contribution")
                if submitted and (account_type or other_account_type):
                    planned_retirement_contributions.append({
                        "accountType": account_type if account_type != "Other" else other_account_type,
                        "country": country,
                        "contributionAmount": contribution_amount,
                    })
                    update_data(
                        "individual.futureFinancialPlans.plannedRetirementContributions",
                        planned_retirement_contributions
                    )
        
        if planned_retirement_contributions:
            for contribution in planned_retirement_contributions:
                st.write(contribution)

        st.subheader("Business plans")
        with st.expander("Add Business Change"):
            with st.form("add_business_change"):
                change_type = st.selectbox(
                    "Change Type",
                    ["Start New Business", "Sell Existing Business", "Expand Business to Another Country"]
                )
                country = st.text_input("Country of Business Activity")
                estimated_value_impact = st.number_input(
                    f"Estimated {'Startup Cost' if change_type == 'Start New Business' else 'Value Impact'} (in local currency)", 
                    min_value=0.0
                )
                
                submitted = st.form_submit_button("Add Business Change")
                if submitted and change_type:
                    planned_business_changes.append({
                        "changeType": change_type,
                        "country": country,
                        "estimatedValueImpact": estimated_value_impact,
                    })
                    update_data(
                        "individual.futureFinancialPlans.plannedBusinessChanges",
                        planned_business_changes
                    )
        
        if planned_business_changes:
            for business_change in planned_business_changes:
                st.write(business_change)

    st.divider()
    display_section("individual.futureFinancialPlans", "Future Financial Plans")    
    st.divider()