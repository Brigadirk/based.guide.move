import streamlit as st

def display_disclaimer_intro(anchor):
    """
    Disclaimer and Introduction Section with distinctive styling
    """
    # ======================= SECTION HEADER =======================
    st.header(f"⚠️ {anchor}", anchor=anchor, divider="rainbow")
    
    # -------------------- MAIN DISCLAIMER CONTENT --------------------
    with st.container():
        # Test version notice
        st.info("**TEST VERSION** - We do not store your data in any way. Feel free to use your real financial information.")
        
        # Main disclaimer content with enhanced styling
        with st.container(border=True):
            st.markdown("### 🤖 AI-Powered Guidance Disclaimer")
            
            st.markdown("""
            This tool uses artificial intelligence to provide personalized guidance for international tax and immigration planning. 
            While we strive for accuracy and comprehensive analysis, please understand that:
            """)
            
            # Create a more structured layout
            disclaimer_points = [
                "⚠️ **AI systems may occasionally provide incorrect or outdated information**",
                "📅 **Tax and immigration laws change frequently across jurisdictions**",
                "⚖️ **This analysis is for informational purposes only, not legal advice**",
                "🔍 **Always verify information with qualified professionals before making decisions**"
            ]
            
            for point in disclaimer_points:
                st.markdown(point)
            
            st.warning("💡 **By proceeding, you acknowledge these limitations and agree to use this tool for informational purposes only.**")
        
        # Purpose explanation with enhanced styling
        with st.container(border=True):
            st.markdown("### 🎯 What This Assessment Provides")
            
            st.markdown("We'll analyze your personal situation to help you understand:")
            
            # Create assessment benefits in a grid-like layout
            benefits = [
                ("💰", "Tax obligations in your destination country"),
                ("🛂", "Visa eligibility and residency requirements"),
                ("📊", "Financial implications of your international move"),
                ("🗺️", "Recommended next steps for your specific circumstances")
            ]
            
            cols = st.columns(2)
            for i, (icon, benefit) in enumerate(benefits):
                with cols[i % 2]:
                    with st.container(border=True):
                        st.markdown(f"{icon} **{benefit}**")
        
        # Data privacy information
        with st.expander("🔒 Data Privacy & Security", expanded=False):
            with st.container(border=True):
                st.markdown("### How We Handle Your Information")
                
                privacy_points = [
                    "🔐 **No Data Storage:** Your data is used solely to generate your personalized analysis",
                    "🚫 **No Sharing:** Information is not shared with third parties",
                    "🗑️ **No Retention:** Data is not stored unless you explicitly grant permission",
                    "🛡️ **Secure Processing:** All information is processed securely during your session"
                ]
                
                for point in privacy_points:
                    st.markdown(point)
        
        # Call to action with green-themed styling
        st.markdown("---")
        with st.container(border=True):
            st.markdown("&nbsp;")  # Add space at top
            st.markdown("### 🚀 Ready to Get Started?")
            st.markdown("Select your destination country and begin your personalized assessment")
            st.markdown("&nbsp;")  # Add space at bottom

