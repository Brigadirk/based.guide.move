import streamlit as st
from app_components.helpers import update_data

def residency_intentions():
    """Render the Residency Intentions section."""
    # st.header("Residency Intentions")
    st.write("Provide details about your intended relocation.")

    move_type = st.selectbox(
        "Type of Move",
        ["Permanent", "Temporary", "Digital Nomad"],
        help="Select the type of move you are planning."
    )
    update_data("individual.residencyIntentions.moveType", move_type)

    reasons_for_moving = st.multiselect(
        "Reasons for Moving",
        ["Work", "Business", "Retire", "Study", "Family", "Lifestyle", "Other"],
        help="Select all reasons that apply to your move."
    )
    update_data("individual.residencyIntentions.reasons_for_moving", reasons_for_moving)

    intended_country = st.text_input(
        "Intended Country",
        help="Enter the country you plan to relocate to."
    )
    update_data("individual.residencyIntentions.intendedCountry", intended_country)

    duration_of_stay = st.text_input(
        "Duration of Stay",
        help="Specify how long you plan to stay (e.g., 6 months, 1 year, indefinite)."
    )
    update_data("individual.residencyIntentions.durationOfStay", duration_of_stay)

    open_to_investment = st.checkbox(
        "Open to Investment",
        help="Check if you are open to making investments in your target country."
    )
    update_data("individual.residencyIntentions.open_to_investment", open_to_investment)

    family_reunification = st.checkbox(
        "Eligible for Family Reunification",
        help="Check if you are eligible for family reunification in your target country."
    )
    update_data("individual.residencyIntentions.familyReunificationEligibility", family_reunification)
