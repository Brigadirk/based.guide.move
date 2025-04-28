import streamlit as st
from app_components.helpers import get_data, update_data, display_section

def education(anchor):
    """
    Education Information Section
    """
    st.header(f"📚 {anchor}", anchor=anchor, divider="rainbow")

    # -------------------- VISIBILITY TOGGLE --------------------
    if not st.toggle(f"📋 Show {anchor}", value=True, key=f"show_{anchor}"):
        st.info(f"🔍 {anchor} section is hidden. Toggle to show. Your previously entered data is preserved.")
        return

    # -------------------- CURRENT STUDENT STATUS --------------------
    is_student = st.checkbox(
        "Are you currently a student?",
        value=get_data("individual.education.isStudent"),
        help="Indicate if you are currently enrolled in an educational institution."
    )
    update_data("individual.education.isStudent", is_student)

    if is_student:
        current_school = st.text_input(
            "Current School/University",
            value=get_data("individual.education.currentSchool"),
            help="Name of the school or university you are currently attending."
        )
        update_data("individual.education.currentSchool", current_school)

    # -------------------- PREVIOUS EDUCATION --------------------
    st.subheader("📚 Previous Education")
    previous_education = st.text_area(
        "List your previous educational qualifications",
        value=get_data("individual.education.previousEducation"),
        help="Include details like degree, institution, and year of graduation."
    )
    update_data("individual.education.previousEducation", previous_education)

    # -------------------- SCHOOL INTERESTS & OFFERS --------------------
    st.subheader("🏫 School Interests")
    interested_in_studying = st.checkbox(
        "Are you intending or interested in studying in your intended country?",
        value=get_data("individual.education.interestedInStudying"),
        help="Check if you are considering enrolling in a new educational institution in your destination."
    )
    update_data("individual.education.interestedInStudying", interested_in_studying)

    if interested_in_studying:
        school_interest_details = st.text_area(
            "Details about your school/university interests",
            value=get_data("individual.education.schoolInterestDetails"),
            help="Include details about the schools or programs you are interested in."
        )
        update_data("individual.education.schoolInterestDetails", school_interest_details)

        st.markdown("#### List any school/university offers you have received")
        school_offers = get_data("individual.education.schoolOffers") or []

        with st.form("add_school_offer", clear_on_submit=True):
            new_offer = st.text_input("School/University Offer")
            submitted = st.form_submit_button("Add Offer")
            if submitted and new_offer:
                school_offers.append(new_offer)
                update_data("individual.education.schoolOffers", school_offers)
                st.rerun()

        for i, offer in enumerate(school_offers):
            cols = st.columns([0.8, 0.2])
            cols[0].write(f"- {offer}")
            if cols[1].button("❌ Remove", key=f"remove_offer_{i}"):
                school_offers.pop(i)
                update_data("individual.education.schoolOffers", school_offers)
                st.rerun()

    st.divider()
    display_section("individual.education", "Education")