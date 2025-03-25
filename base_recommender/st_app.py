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
from app_components.tax_history import tax_history
from app_components.social_security_pensions import social_security_pensions
from app_components.tax_planning import tax_planning
from app_components.future_financial_plans import future_financial_plans
from app_components.partner_information import partner_information
from app_components.additional_information import additional_information
from app_components.sidebar import display_sidebar

def init_session_state():
    """Initialize session state variables."""
    if 'data' not in st.session_state:
        st.session_state.data = {
            "description": "This JSON is designed to gather all relevant information for a tax and migration rundown for an individual and their partner.",
            "individual": {
                "description": "Primary individual seeking tax and migration information.",
                "personalInformation": {
                    "description": "Personal details of the primary individual.",
                    "fullName": "",
                    "dateOfBirth": "",
                    "nationalities": [],
                    "maritalStatus": "",
                    "currentResidency": {
                        "country": "",
                        "status": "",
                        "yearsAtCurrentResidency": 0
                    }
                },
                "financialInformation": {
                    "annualIncome": {"amount": 0, "currency": ""},
                    "incomeSources": [],
                    "assets": {
                        "realEstate": [],
                        "investments": [],
                        "retirementAccounts": [],
                        "cryptocurrencyHoldings": []
                    },
                    "liabilities": {"loans": []},
                    "netWorth": {"totalValue": 0, "currency": ""},
                    "taxAdvantagedAccounts": []
                },
            },
            "partner": {},
            "additionalInformation": {}
        }

    if 'current_header' not in st.session_state:
        st.session_state.current_header = "Personal Information"

    if 'has_partner' not in st.session_state:
        st.session_state.has_partner = False

def set_page_config():
    """Configure the Streamlit page."""
    st.set_page_config(
        page_title="Mr. Pro Bonobo",
        page_icon="🌎",
        layout="wide",
        initial_sidebar_state="expanded"
    )

def display_intro():
    """Display the introduction section."""
    st.title("Based Tax Guide")
    st.caption("We're going to need information from you to determine what living in your desired country means for you tax-wise, as well as eligibility for visas.")
    st.write("Complete this form to receive a detailed analysis of your tax obligations when moving internationally.")

def display_review_export():
    """Display the review and export section."""
    personal_data = get_data("individual.personalInformation", {})
    financial_data = get_data("individual.financialInformation", {})
    
    st.subheader("Personal Information Summary")
    st.write(f"**Name:** {personal_data.get('fullName', 'Not provided')}")
    st.write(f"**Date of Birth:** {personal_data.get('dateOfBirth', 'Not provided')}")
    st.write(f"**Marital Status:** {personal_data.get('maritalStatus', 'Not provided')}")
    
    # Nationalities
    nationalities = personal_data.get('nationalities', [])
    if nationalities:
        st.write("**Nationalities:**")
        for nat in nationalities:
            st.write(f"- {nat['country']} {'(taxes citizens worldwide)' if nat.get('hasCitizenshipBasedTaxation', False) else ''}")
    
    # Current residency
    residency = personal_data.get('currentResidency', {})
    st.write(f"**Current Residence:** {residency.get('country', 'Not provided')} ({residency.get('status', 'Not provided')})")
    st.write(f"**Years at Current Residence:** {residency.get('yearsAtCurrentResidency', 'Not provided')}")
    
    # Financial Summary
    st.subheader("Financial Summary")
    st.write(f"**Annual Income:** {financial_data.get('annualIncome', {}).get('currency', '')} {financial_data.get('annualIncome', {}).get('amount', 0):,}")
    
    # Assets summary
    assets = financial_data.get('assets', {})
    total_assets = sum(prop.get('value', 0) for prop in assets.get('realEstate', [])) + \
                  sum(inv.get('value', 0) for inv in assets.get('investments', [])) + \
                  sum(c.get('value', 0) for c in assets.get('cryptocurrencyHoldings', [])) + \
                  sum(ret.get('value', 0) for ret in assets.get('retirementAccounts', []))
    
    st.write(f"**Total Assets Value:** {financial_data.get('annualIncome', {}).get('currency', 'USD')} {total_assets:,}")
    
    # Export options
    st.subheader("Export Data")
    
    # Generate JSON string with proper formatting
    json_str = json.dumps(st.session_state.data, indent=2)
    
    # Create a download button
    def get_binary_file_downloader_html(bin_data, file_label='File'):
        b64 = base64.b64encode(bin_data.encode()).decode()
        return f'<a href="data:application/octet-stream;base64,{b64}" download="tax_migration_data.json">Download {file_label}</a>'
    
    st.markdown(get_binary_file_downloader_html(json_str, 'JSON File'), unsafe_allow_html=True)
    
    # Option to view raw JSON
    with st.expander("View JSON Data"):
        st.code(json_str, language="json")

# Call this initialization function at the start of your main()
def main():
    set_page_config()
    
    init_session_state()  # <-- important!

    display_sidebar()
    
    display_intro()

    st.header("Personal Information", anchor="Personal Information")
    personal()
    
    assets()
    
    employment()
    
    residency_intentions()
    
    tax_history()
    
    social_security_pensions()
    
    tax_planning()
    
    future_financial_plans()

    # Conditionally render partner and dependent sections later based on session state
    if st.session_state.has_partner:
        partner_information()

    if st.session_state.has_dependents and st.session_state.num_dependents > 0:
        additional_information()

    display_review_export()

if __name__ == "__main__":
    # Project path configuration
    project_dir = os.path.join(os.path.dirname(__file__), 'base_recommender')
    sys.path.insert(0, project_dir)
    
    # Run the app
    main()
