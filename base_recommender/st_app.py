import streamlit as st
import os
import sys

# Import modular components
from app_components.personal \
    import personal
from app_components.residency_intentions \
    import residency_intentions
from app_components.social_security_pensions \
    import social_security_pensions
from app_components.tax_deductions_and_credits \
    import tax_deductions_and_credits
from app_components.future_financial_plans \
    import future_financial_plans
from app_components.additional_information \
    import additional_information
from app_components.sidebar.sidebar \
    import display_sidebar
from app_components.disclaimer \
    import display_disclaimer_intro
from app_components.state.state \
    import init_session_state
from app_components.destination \
    import select_destination_country
from app_components.summary \
    import display_review_export
from app_components.finance \
    import finance
from app_components.education \
    import education

def set_page_config():
    st.set_page_config(
        page_title="Mr. Pro Bonobo",
        page_icon="🌎",
        initial_sidebar_state="expanded")

def main():
    set_page_config()
    init_session_state()
    display_sidebar()

    # Done
    # display_disclaimer_intro("Disclaimer")

    st.divider()

    # Will have to keep because it affects other sections
    select_destination_country("Desired Destination")

    st.divider()

    personal("Personal Information")

    st.divider()
    
    education("Education")

    st.divider()

    residency_intentions("Residency Intentions")

    st.divider()
      
    finance("Income and Assets")
        
    st.divider()

    social_security_pensions("Social Security and Pensions")
    
    st.divider()

    tax_deductions_and_credits("Tax Deductions and Credits")
    
    st.divider()

    future_financial_plans("Future Financial Plans")

    st.divider()

    additional_information("Additional Information")

    st.divider()

    display_review_export("Review and Export")

if __name__ == "__main__":
    project_dir = os.path.join(os.path.dirname(__file__), 'base_recommender')
    sys.path.insert(0, project_dir)
    
    main()
