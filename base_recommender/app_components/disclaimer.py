import streamlit as st

def display_disclaimer_intro(anchor):
    """
    Disclaimer and Introduction Section with distinctive styling
    """
    # ======================= SECTION HEADER =======================
    st.header(f"⚠️ {anchor}", anchor=anchor, divider="rainbow")
    
    # -------------------- DISCLAIMER CONTENT --------------------
    with st.container():
        st.warning("""
        **AI DISCLAIMER:**
        
        This tool uses artificial intelligence to provide guidance. While we strive for accuracy:
        - AI systems may occasionally provide incorrect or outdated information
        - Tax and immigration laws change frequently across jurisdictions
        - The analysis provided should not be considered legal, tax, or immigration advice
        - Always verify information with qualified professionals before making decisions
        
        By proceeding, you acknowledge these limitations and agree to use this tool for informational purposes only.
        """)
    
    # -------------------- PURPOSE EXPLANATION --------------------
    st.info("""
    **Purpose of this Assessment:**
    
    We'll collect information about your personal situation to help analyze:
    1. Potential tax obligations in your destination country
    2. Visa eligibility and residency requirements
    3. Financial implications of your international move
    4. Recommended next steps for your specific circumstances
    """)
    
    # -------------------- USAGE INSTRUCTIONS --------------------
    st.caption("""
    We're going to need information from you to determine what living in your desired country means for you tax-wise, 
    as well as eligibility for visas. Complete all sections for the most accurate analysis.
    """)
    
    # -------------------- CALL TO ACTION --------------------
    st.write("Complete this form to receive a detailed analysis of your tax obligations when moving internationally.")
    
    # -------------------- DATA PRIVACY NOTE --------------------
    with st.expander("🔒 Data Privacy Information"):
        st.markdown("""
        **How we handle your information:**
        - Your data is used solely to generate your personalized analysis
        - Information is processed securely and not shared with third parties
        - You can request deletion of your data at any time
        - We do not store personally identifiable information beyond what's necessary
        
        For questions about data handling, please contact our support team.
        """)
    

