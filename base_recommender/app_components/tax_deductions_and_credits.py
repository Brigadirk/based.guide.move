import streamlit as st
from app_components.helpers import update_data, get_data
import json

def filled_in_correctly(tax_deductions_and_credits_state):
    """
    Checks if all deductions in the state have complete information.
    Returns True if all deductions have 'type', 'amount', and 'currency' filled in,
    or if no deductions are present.
    """
    # Retrieve potential deductions from the state
    deductions = tax_deductions_and_credits_state.get("potentialDeductions", [])
    
    # If no deductions, consider it valid
    if not deductions:
        return True
    
    # Check each deduction for completeness
    for deduction in deductions:
        if not all(key in deduction and deduction[key] for key in ["type", "amount", "currency"]):
            return False  # Return False if any deduction is incomplete

    return True  # Return True if all deductions are complete


def deductions_section():
    """Handles adding and displaying potential tax deductions."""
    st.subheader("Potential Tax Deductions")
    
    # Expander: What are tax deductions?
    with st.expander("INFO: What are Tax Deductions?"):
        st.write(
            "Tax deductions reduce your taxable income, which can lower \
                the amount of taxes you owe. "
            "You can either take the standard deduction (a fixed amount) \
                or itemize your deductions "
            "if your eligible expenses exceed the standard deduction.")
        st.write("INFO: Examples of common tax deductions include:")
        st.markdown(
            """
            - **Charitable Donations**: Contributions to IRS-recognized charities.
            - **Medical and Dental Expenses**: Unreimbursed expenses exceeding \
                7.5% of your adjusted gross income (AGI).
            - **Mortgage Interest**: Interest paid on home loans.
            - **State and Local Taxes (SALT)**: Up to $10,000 for property \
                taxes and state/local income or sales taxes.
            - **Education Expenses**: Student loan interest or educator expenses.
            - **Home Office Expenses**: For self-employed individuals using part \
                of their home exclusively for business.
            """)

    # Retrieve existing deductions from state
    deductions = get_data(
        "individual.taxDeductionsAndCredits.potentialDeductions")
    
    # Add new deduction form
    add_deduction_form(deductions)
    
    # Display existing deductions
    if deductions:
        display_deductions(deductions)

def add_deduction_form(deductions):
    """Form for adding a new tax deduction."""
    with st.form("add_tax_deduction"):
        deduction_type = st.text_input(
            "Deduction Type",
            help= "Specify the type of deduction \
                (e.g., charitable donation, medical expenses)."
            )
        amount = st.number_input(
            "Amount",
            min_value=0.0,
            step=0.5,
            help="Enter the monetary value of the deduction."
            )
        currency = st.selectbox(
            "Currency",
            help="Specify the currency for this deduction (e.g., USD, EUR).",
            options=st.session_state.currencies,
            index=st.session_state.currencies.index("USD")
            )
        
        submitted = st.form_submit_button("Add Deduction (Optional)")
        if submitted and deduction_type:
            # Add new deduction to the list
            new_deduction = {
                "type": deduction_type,
                "amount": amount,
                "currency": currency
                }
            deductions.append(new_deduction)
            update_data(
                "individual.taxDeductionsAndCredits.potentialDeductions",
                deductions)
            st.success(f"Deduction '{deduction_type}' added successfully!")

def display_deductions(deductions):
    """Displays a list of existing deductions and their summary."""
    st.subheader("Existing Deductions")
    
    # Display each deduction in an expander
    for i, deduction in enumerate(deductions):
        with st.expander(f"{deduction['type']} - {deduction['amount']} {deduction['currency']}"):
            col1, col2 = st.columns(2)
            with col1:
                st.write(f"**Type:** {deduction['type']}")
                st.write(f"**Amount:** {deduction['amount']}")
            with col2:
                st.write(f"**Currency:** {deduction['currency']}")
            
            # Option to delete a deduction
            if st.button(f"Delete '{deduction['type']}'", key=f"delete_{i}"):
                deductions.pop(i)
                update_data("individual.taxDeductionsAndCredits.potentialDeductions", deductions)
                st.warning(f"Deduction '{deduction['type']}' deleted successfully!")
                break
    
    # Generate summary table
    if deductions:
        st.subheader("Summary of Deductions")
        
        # Aggregate data into a summary format
        summary_data = {
            "Type": [deduction["type"] for deduction in deductions],
            "Amount": [deduction["amount"] for deduction in deductions],
            "Currency": [deduction["currency"] for deduction in deductions],
        }
        
        # Display the summary table
        st.table(summary_data)


def tax_deductions_and_credits():
    """Main function to render the Tax Planning section."""
    st.header("Tax Deductions and Credits", anchor="Tax Deductions and Credits")
    if not st.toggle("Show section", value=True, key="show_tax_planning"):
        st.info("Tax Planning section is hidden. \
                Toggle to show. Your previously entered data is preserved.")
    else:
        cols = st.columns(2)
        with cols[0]:
            deductions_section()

            tax_deductions_and_credits_state = get_data(
                "individual.taxDeductionsAndCredits")
            if st.button("Show current Tax Deduction and Credits state"):
                st.json(
                    json.dumps(
                        tax_deductions_and_credits_state, 
                        indent=2))
                    
            filled = filled_in_correctly(tax_deductions_and_credits_state)
            st.divider()
            return filled

