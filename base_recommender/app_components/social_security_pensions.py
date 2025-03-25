import streamlit as st
from app_components.helpers import update_data, get_data

def social_security_pensions():
    """Render the Social Security & Pensions section."""
    # st.header("Social Security & Pensions")

    contributing_to_social_security = st.checkbox(
        "Currently Contributing to Social Security",
        help="Check if you are currently contributing to a social security system."
    )
    update_data("individual.socialSecurityAndPensions.currentCountryContributions.isContributing", contributing_to_social_security)

    if contributing_to_social_security:
        years_contributed = st.number_input(
            "Years of Contribution",
            min_value=0,
            step=1,
            help="Enter the number of years you have contributed to social security."
        )
        update_data("individual.socialSecurityAndPensions.currentCountryContributions.yearsOfContribution", years_contributed)
