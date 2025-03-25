import streamlit as st
from app_components.helpers import update_data, get_data

def partner_information():
    """Render the Partner Information section."""
    # st.header("Partner Information")
    
    full_name = st.text_input(
        "Partner's Full Name",
        help="Enter your partner's full name."
    )
    update_data("partner.personalInformation.fullName", full_name)

    dob = st.date_input(
        "Partner's Date of Birth",
        help="Enter your partner's date of birth."
    )
    update_data("partner.personalInformation.dateOfBirth", dob.strftime("%Y-%m-%d"))
