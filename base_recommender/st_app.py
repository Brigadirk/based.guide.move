import streamlit as st
import json
from datetime import datetime, date
import base64
import os
import sys
from PIL import Image

# Import modular components
from app_components.helpers import get_data, navigate_to, update_data
from app_components.personal import personal
from app_components.assets import assets
from app_components.employment import employment
from app_components.residency_intentions import residency_intentions
from app_components.tax_compliance_history import tax_compliance_history
from app_components.social_security_pensions import social_security_pensions
from app_components.tax_deductions_and_credits import tax_deductions_and_credits
from app_components.future_financial_plans import future_financial_plans
from app_components.additional_information import additional_information
from app_components.sidebar import display_sidebar
from app_components.info import display_intro
from app_components.state import init_session_state
from app_components.destination import select_destination_country
from app_components.summary import display_review_export

def set_page_config():
    st.set_page_config(
        page_title="Mr. Pro Bonobo",
        page_icon="🌎",
        layout="wide",
        initial_sidebar_state="expanded")

def main():
    set_page_config()
    
    init_session_state()

    display_sidebar()
    
    display_intro()

    select_destination_country()

    personal()
    
    residency_intentions()
    
    # employment()
    # assets()
    
    tax_compliance_history()
    
    # st.header("Social Security & Pensions", anchor="Social Security & Pensions")
    # social_security_pensions()
    
    tax_deductions_and_credits()
    
    # st.header("Future Financial Plans", anchor="Future Financial Plans")
    # future_financial_plans()

    # Figure out where and how we get partner info
    # if st.session_state.has_partner:
    #     partner_information()
    #     st.divider()

    #display_review_export()

if __name__ == "__main__":
    project_dir = os.path.join(os.path.dirname(__file__), 'base_recommender')
    sys.path.insert(0, project_dir)
    
    main()
