import streamlit as st

def display_disclaimer_intro(anchor):
    """
    Disclaimer and Introduction Section with distinctive styling
    """
    # ======================= SECTION HEADER =======================
    st.header(f"⚠️ {anchor}", anchor=anchor, divider="rainbow")
    
    # -------------------- DISCLAIMER CONTENT --------------------
    with st.container():

        st.info("THIS IS A TEST VERSION. WE DO NOT STORE YOUR DATA IN ANY WAY AT ALL. FEEL FREE TO PUT IN YOUR PRIVATE FINANCIAL DATA.")
        st.info("If you would like to help us test this version, then please pick a country you could see yourself moving to, \
                   and provide your real data, and see whether the result is useful to you, and let us know about difficulties. \
                   If you would like to help beyond this, please make up some potential scenario(s) and try it out on any country at all.")

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
            
    # -------------------- DATA PRIVACY NOTE --------------------
    with st.expander("🔒 Data Privacy Information"):
        st.markdown("""
        **How we handle your information:**
        - Your data is used solely to generate your personalized analysis
        - We do not store your data at all, unless you explicitly state that we can
        - Information is processed securely and not shared with third parties, if we store it at all with your permission
        - You can request deletion of your data at any time
        - We do not store personally identifiable information beyond what's necessary, again only if you approve to begin with
        """)
    

