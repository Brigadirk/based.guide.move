import streamlit as st

def display_intro():
    """Display the introduction section."""
    st.header("Based Tax Guide", anchor="Information")

    with st.columns(2)[0]:
        st.write("AI disclaimer: I am an AI product. I say wrong things.")

        st.caption("We're going to need information from you to determine what \
                   living in your desired country means for you tax-wise, as \
                   well as eligibility for visas.")
        st.write("Complete this form to receive a detailed analysis of your tax \
                 obligations when moving internationally.")
        st.divider()