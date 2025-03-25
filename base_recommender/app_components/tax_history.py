import streamlit as st
from app_components.helpers import update_data, get_data

def tax_history():
    """Render the Tax History section."""
    # st.header("Tax History")
    st.write("Provide details about your tax history and obligations.")

    previous_residencies = get_data("individual.taxHistory.previousCountriesOfResidency", [])
    
    with st.expander("Add Previous Residency"):
        with st.form("add_previous_residency"):
            country = st.text_input("Country")
            years = st.number_input("Years Spent in Country", min_value=0, step=1)
            tax_fulfilled = st.checkbox("Tax Obligations Fulfilled")
            unpaid_taxes = st.checkbox("Unpaid Taxes")

            submitted = st.form_submit_button("Add Residency")
            if submitted and country:
                previous_residencies.append({
                    "country": country,
                    "years": years,
                    "taxObligationsFulfilled": tax_fulfilled,
                    "unpaidTaxes": unpaid_taxes
                })
                update_data("individual.taxHistory.previousCountriesOfResidency", previous_residencies)

    if previous_residencies:
        st.write("Previous Residencies:")
        for residency in previous_residencies:
            st.write(residency)
