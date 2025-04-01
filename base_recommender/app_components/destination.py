from app_components.helpers import get_data, get_country_list, update_data
import streamlit as st

def select_destination_country():

    cols = st.columns(2)

    with cols[0]:
        destination = st.selectbox(
            "Destination country",
            help="Enter the country you plan to relocate to.",
            options=[""] + get_country_list(),
            index=(
                get_country_list().index(
                    get_data(
                        "individual.residencyIntentions.destinationCountry.country")) + 1) \
                            if get_data("individual.residencyIntentions.destinationCountry.name") \
                                in get_country_list() \
                                    else 0)
        update_data("individual.residencyIntentions.destinationCountry.country", 
                destination)