import streamlit as st
import datetime
from app_components.helpers import get_data, update_data, get_country_list

def personal():
    col1, col2 = st.columns(2)

    with col1:
        current_country = st.selectbox(
            "Country of current residence",
            options=[""] + get_country_list(),
            index=(get_country_list().index(get_data("individual.personalInformation.currentResidency.country")) + 1) if get_data("individual.personalInformation.currentResidency.country") in get_country_list() else 0,
            help="Where you currently live and pay taxes."
            )
        update_data("individual.personalInformation.currentResidency.country", current_country)

        # residency_status_options = ["Citizen", "Permanent Resident", "Temporary Resident", "Non-Resident", "Tourist/Visitor"]
        # current_residency_status = get_data("individual.personalInformation.currentResidency.status", "Citizen")

        # if current_residency_status not in residency_status_options:
        #     current_residency_status = "Citizen"

        # residency_status = st.selectbox(
        #     "Current Residency Status",
        #     options=residency_status_options,
        #     index=residency_status_options.index(get_data("individual.personalInformation.currentResidency.status", "Citizen")),
        #     help="Your official status in your current country affects your tax obligations."
        # )
        # update_data("individual.personalInformation.currentResidency.status", residency_status)

        years_at_residence = st.number_input(
            "Years at Current Residence",
            min_value=0,
            max_value=100,
            value=get_data("individual.personalInformation.currentResidency.yearsAtCurrentResidency", 0),
            step=1,
            help="Length of time at current residence affects residency status for tax purposes."
        )
        update_data("individual.personalInformation.currentResidency.yearsAtCurrentResidency", years_at_residence)

    with col2:
        # Date of Birth
        date_of_birth = st.date_input(
            "Date of Birth",
            value=datetime.date.today() - datetime.timedelta(days=365*30),  # default to ~30 years old
            min_value=datetime.date.today() - datetime.timedelta(days=365*100),
            max_value=datetime.date.today(),
            help="Your date of birth affects tax credits, retirement options, and age-related benefits."
        )
        update_data("individual.personalInformation.dateOfBirth", date_of_birth.strftime("%Y-%m-%d"))

        # Safely retrieve marital status from session state or default to "Single"
        marital_status_options = ["Single", "Married", "Civil Partnership", "Divorced", "Widowed"]
        current_marital_status = get_data("individual.personalInformation.maritalStatus", "Single")

        # Ensure the current value exists in the options; otherwise, default to "Single"
        if current_marital_status not in marital_status_options:
            current_marital_status = "Single"

        # Marital Status Dropdown
        marital_status = st.selectbox(
            "Marital Status",
            options=marital_status_options,
            index=marital_status_options.index(current_marital_status),
            help="Your marital status affects tax filing status."
        )
        update_data("individual.personalInformation.maritalStatus", marital_status)

        # Partner Information
        has_partner = st.checkbox(
            "I have a partner who will relocate with me",
            value=get_data("has_partner", False),
            help="Include information about a spouse or partner relocating with you."
        )
        st.session_state.has_partner = has_partner
        update_data("has_partner", has_partner)

        # Dependents Information
        has_dependents = st.checkbox(
            "I have dependents who will relocate with me",
            value=get_data("has_dependents", False),
            help="Include information about dependents relocating with you."
        )
        update_data("has_dependents", has_dependents)

        if has_dependents:
            num_dependents = st.number_input(
                "How many dependents will relocate with you?",
                min_value=1,
                max_value=10,
                value=get_data("num_dependents", 1),
                step=1,
                help="This determines how many dependents' details we'll ask for later."
            )
            update_data("num_dependents", num_dependents)
        else:
            update_data("num_dependents", 0)

    st.subheader("Nationalities")
    nationalities = get_data("individual.personalInformation.nationalities", [])

    with st.form("add_nationality_form", clear_on_submit=True):
        new_nationality = st.selectbox(
            "Country of citizenship",
            options=[""] + get_country_list(),
            help="Select each country where you hold citizenship."
        )
        
        submitted = st.form_submit_button("Add nationality")
        
        if submitted and new_nationality:
            nationalities.append(new_nationality)
            update_data("individual.personalInformation.nationalities", nationalities)

    if nationalities:
        for i, nat in enumerate(nationalities):
            col_nat, col_remove = st.columns([4, 1])
            with col_nat:
                taxation_info = "(Worldwide taxation)" if nat["hasCitizenshipBasedTaxation"] else ""
                st.write(f"{i+1}. {nat['country']} {taxation_info}")
            with col_remove:
                if st.button(f"Remove {i+1}", key=f"remove_nat_{i}"):
                    nationalities.pop(i)
                    update_data("individual.personalInformation.nationalities", nationalities)
                    st.experimental_rerun()
