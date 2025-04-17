from app_components.helpers import (
    get_country_list, get_data, update_data, display_section)
import streamlit as st

def display_review_export(anchor):
    st.header(anchor, anchor=anchor)  
    state = get_data("individual")  # Retrieve section data)
    display_section("individual", state)    
    st.divider()

    # personal_data = get_data("individual.personalInformation", {})
    # financial_data = get_data("individual.financialInformation", {})
    
    # st.subheader("Personal Information Summary")
    # st.write(f"**Name:** {personal_data.get('fullName', 'Not provided')}")
    # st.write(f"**Date of Birth:** {personal_data.get('dateOfBirth', 'Not provided')}")
    # st.write(f"**Marital Status:** {personal_data.get('maritalStatus', 'Not provided')}")
    
    # nationalities = personal_data.get('nationalities', [])
    # if nationalities:
    #     st.write("**Nationalities:**")
    #     for nat in nationalities:
    #         st.write(f"- {nat['country']} {'(taxes citizens worldwide)' if nat.get('hasCitizenshipBasedTaxation', False) else ''}")
    
    # residency = personal_data.get('currentResidency', {})
    # st.write(f"**Current Residence:** {residency.get('country', 'Not provided')} ({residency.get('status', 'Not provided')})")
    # st.write(f"**Years at Current Residence:** {residency.get('yearsAtCurrentResidency', 'Not provided')}")
    
    # st.subheader("Financial Summary")
    # st.write(f"**Annual Income:** {financial_data.get('annualIncome', {}).get('currency', '')} {financial_data.get('annualIncome', {}).get('amount', 0):,}")
    
    # assets = financial_data.get('assets', {})
    # total_assets = sum(prop.get('value', 0) for prop in assets.get('realEstate', [])) + \
    #               sum(inv.get('value', 0) for inv in assets.get('investments', [])) + \
    #               sum(c.get('value', 0) for c in assets.get('cryptocurrencyHoldings', [])) + \
    #               sum(ret.get('value', 0) for ret in assets.get('retirementAccounts', []))
    
    # st.write(f"**Total Assets Value:** {financial_data.get('annualIncome', {}).get('currency', 'USD')} {total_assets:,}")
    
    # st.subheader("Export Data")
    
    # json_str = json.dumps(st.session_state.data, indent=2)
    
    # def get_binary_file_downloader_html(bin_data, file_label='File'):
    #     b64 = base64.b64encode(bin_data.encode()).decode()
    #     return f'<a href="data:application/octet-stream;base64,{b64}" download="tax_migration_data.json">Download {file_label}</a>'
    
    # st.markdown(get_binary_file_downloader_html(json_str, 'JSON File'), unsafe_allow_html=True)
    
    # with st.expander("View JSON Data"):
    #     st.code(json_str, language="json")