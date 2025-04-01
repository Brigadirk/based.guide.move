import streamlit as st
import datetime
from app_components.helpers import get_data, update_data, get_country_list
import json

# E.G. Homeschooling

def special_requirements():
    st.header("Special Requirements", anchor="Special Requirements")
    show_section = st.toggle("Show section", value=True, key="show_personal_information")
    if not show_section:
        st.info("Personal Information section is hidden. Toggle to show. Your previously entered data is preserved.")
    if show_section:
        cols = st.columns(2)
        with cols[0]:

            # date_of_birth()
            # current_country()
            # residency_status()

            # subcols = st.columns(2)

            # with subcols[0]:
            #     years_at_residence()
            # with subcols[1]:
            #     months_at_residence()

            # select_nationalities()

            # if relocation_partner():
            #     relationship_type = relocation_partner_relation()
            #     if relationship_type:
            #         relationship_duration(relationship_type)
            #         marital_status(relationship_type)
            #     partner_nationalities()

            # if has_dependents():
            #     add_dependents()
                
            st.divider()
            if st.button("Show current Personal Information state"):
                personal_information_state = get_data("individual.personalInformation")
                st.json(json.dumps(personal_information_state, indent=2))