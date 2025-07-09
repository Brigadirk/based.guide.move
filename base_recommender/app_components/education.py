import streamlit as st
from app_components.helpers import (
    get_data,
    update_data,
    display_section,
    format_country_name,
)

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

        current_field_of_study = st.text_input(
            "Current Field of Study",
            value=get_data("individual.education.currentFieldOfStudy"),
            help="Name of the field of study you are currently pursuing."
        )
        update_data("individual.education.currentFieldOfStudy", current_field_of_study)

    # -------------------- PREVIOUS EDUCATION --------------------
    st.subheader("📚 Previous Education")
    
    # Why this matters
    with st.expander("ℹ️ Why your earlier degrees are relevant"):
        st.markdown(
            """
            • **Points-based migration** – many skilled-visa systems (e.g. Canada, Australia,
            UK PBS) award extra points for Bachelor's, Master's or PhD credentials.  

            • **Professional licensing & salary thresholds** – regulated professions or
            minimum-salary rules often depend on your highest qualification.  

            • **Qualification recognition** – some countries grant simplified
            diploma-recognition or "blue-card" routes when the awarding institution is
            accredited.  Listing your degrees helps us flag any equivalency steps you may need.  
            """
        )

    # Initialize or get existing degrees
    previous_degrees = get_data("individual.education.previousDegrees") or []
    
    # Add new degree form
    with st.form("add_degree", clear_on_submit=True):
        st.markdown("**Add a New Degree/Certification**")
        cols = st.columns([1, 1])
        degree_name = cols[0].text_input("Degree Name", key="degree_name")
        institution = cols[1].text_input("Institution", key="institution")
        cols = st.columns([1,1])
        field_of_study = cols[0].text_input("Field of Study", key="field")
        graduation_year = cols[1].text_input("Year", key="year", placeholder="YYYY")
        
        if st.form_submit_button("➕ Add Degree"):
            if degree_name and institution:
                previous_degrees.append({
                    "degree": degree_name,
                    "institution": institution,
                    "field": field_of_study,
                    "year": graduation_year
                })
                update_data("individual.education.previousDegrees", previous_degrees)
                st.rerun()
    
    # Display existing degrees
    if previous_degrees:
        st.markdown("**Your Educational Background**")
        for i, degree in enumerate(previous_degrees):
            cols = st.columns([0.6, 0.3, 0.1])
            cols[0].markdown(f"""
            - **{degree['degree']}**  
            {degree.get('institution', '')}  
            {degree.get('field', '')} ({degree.get('year', '')})
            """)
            if cols[2].button("❌", key=f"remove_degree_{i}"):
                previous_degrees.pop(i)
                update_data("individual.education.previousDegrees", previous_degrees)
                st.rerun()

    # -------------------- VISA-RELEVANT SKILLS --------------------
    st.subheader("🛂 Visa-Relevant Skills")
    st.markdown("""
    **Add skills that may qualify for skilled migration visas**  
    *Examples: Programming languages, medical specialties, engineering disciplines, etc.*
    """)

    visa_skills = get_data("individual.education.visaSkills") or []

    with st.form("add_visa_skill", clear_on_submit=True):

        new_skill = st.text_input("Skill/Expertise")

        # Credential fields (optional—labelled inline)
        credential_cols = st.columns([2, 2])
        credential_name = credential_cols[0].text_input(
            "Credential Name (optional)"
        )
        credential_institute = credential_cols[1].text_input(
            "Credential Institute (optional)"
        )

        # Optional: Validate credential fields if checkbox is checked
        if st.form_submit_button("➕ Add Skill"):
            if new_skill:
                visa_skills.append({
                    "skill": new_skill,
                    "credential_name": credential_name if credential_name else "",
                    "credential_institute": credential_institute if credential_institute else ""
                })
                update_data("individual.education.visaSkills", visa_skills)
                st.rerun()

    # --- Display existing visa-relevant skills ---
    if visa_skills:
        st.markdown("**Your Visa-Relevant Skills**")
        for i, skill in enumerate(visa_skills):
            cols = st.columns([0.7, 0.2, 0.1])
            skill_details = f"- **{skill['skill']}**"
            if skill.get('credential_name') or skill.get('credential_institute'):
                skill_details += "<br>"
                if skill.get('credential_name'):
                    skill_details += f"Credential: {skill['credential_name']}<br>"
                if skill.get('credential_institute'):
                    skill_details += f"Institution: {skill['credential_institute']}"
            cols[0].markdown(skill_details, unsafe_allow_html=True)
            if cols[2].button("❌", key=f"remove_skill_{i}"):
                visa_skills.pop(i)
                update_data("individual.education.visaSkills", visa_skills)
                st.rerun()

    # -------------------- EDUCATION INTERESTS & OFFERS --------------------
    st.subheader("🎓 Education Interests")

    # Info-bulletin about skill-visa routes
    with st.expander("ℹ️ Why list future studies / skills?"):
        st.markdown(
            "Many countries run **occupation- or skill-shortage visas** (e.g. Australian Skills "
            "Independent Visa, New Zealand Green List, Canada Express Entry).  \n"
            "Documenting what you plan to study—especially high-demand skills—helps us match you "
            "with these programs."
        )

    # ----- Destination name for the prompt -----
    dest_country   = get_data("individual.residencyIntentions.destinationCountry.country")
    country_phrase = (
        format_country_name(dest_country)
        if dest_country
        else "your destination country"
    )

    interested_in_studying = st.checkbox(
        f"I plan or am interested in formal study (courses, degrees or certified skills) in {country_phrase}.",
        value=get_data("individual.education.interestedInStudying"),
        help="Tick if you expect to enrol in a school, university **or official skills course**."
    )
    update_data("individual.education.interestedInStudying", interested_in_studying)

    # ------------------------------------------------------------
    # Ensure nested lists exist
    # ------------------------------------------------------------
    school_offers = get_data("individual.education.schoolOffers") or []
    learning_interests = get_data("individual.education.learningInterests") or []

    if interested_in_studying:
        school_interest_details = st.text_area(
            "Details about your education / skill interests",
            value=get_data("individual.education.schoolInterestDetails"),
            help="Tell us which qualifications or skills you'd like to pursue."
        )
        update_data("individual.education.schoolInterestDetails", school_interest_details)

        # --------------- ONE unified "Add planned study" form ---------------
        st.markdown("#### Add planned study (course OR university offer)")
        with st.form("add_planned_study", clear_on_submit=True):
            study_type = st.radio(
                "Entry type",
                ["Skill / Certificate course", "School / University offer"],
                horizontal=True,
            )

            if study_type == "Skill / Certificate course":
                cols = st.columns([2, 2])
                skill_name = cols[0].text_input("Skill or Course Name")
                interest_type = cols[1].radio(
                    "Interest type",
                    ["Open to learning", "Planned study"],
                    horizontal=True,
                )

                cols_t = st.columns([1, 1])
                time_months = cols_t[0].number_input(
                    "Duration (months)",
                    min_value=0,
                    value=0,
                    step=1,
                )
                hours_week = cols_t[1].number_input(
                    "Hours per week",
                    min_value=0,
                    value=0,
                    step=1,
                )
                # ------------------- Institution / Provider ----------------------
                if interest_type == "Planned study":
                    institute = st.text_input(
                        "Institution / Provider *",
                        value="",
                        help="Name of the school, university, boot-camp, etc.",
                    )
                else:
                    institute = st.text_input(
                        "Institution / Provider",
                        value="",
                        placeholder="I don't know / anywhere",
                        help="Leave blank or keep the placeholder if undecided.",
                    )

                # Funding status (now for *all* study types)
                funding_status = st.radio(
                    "Funding status",
                    ["Paid", "Have funds", "Not sure / need scholarship"],
                    horizontal=True,
                )

            else:  # School / University offer
                cols = st.columns([2, 2])
                school_name   = cols[0].text_input("School / University Name *")
                offer_program = cols[1].text_input("Offer / Programme")

                cols2 = st.columns([1, 2])
                offer_year = cols2[0].text_input("Year (YYYY)")
                funding_status = cols2[1].radio(
                    "Funding status",
                    ["Paid", "Have funds", "Not sure / need scholarship"],
                    horizontal=True,
                )

            if st.form_submit_button("➕ Add entry"):
                if study_type == "Skill / Certificate course":
                    if not skill_name:
                        st.error("Please enter a skill or course name.")
                    else:
                        if not institute:
                            institute = "I don't know / anywhere"
                        learning_interests.append(
                            {
                                "skill":  skill_name,
                                "status": "planned" if interest_type == "Planned study" else "open",
                                "institute": institute,
                                "months": int(time_months),
                                "hours_per_week": int(hours_week),
                                "funding_status": funding_status,
                            }
                        )
                        update_data("individual.education.learningInterests", learning_interests)
                        st.rerun()
                else:
                    if not school_name:
                        st.error("University / School name is required.")
                    else:
                        school_offers.append(
                            {
                                "school": school_name,
                                "program": offer_program,
                                "year":   offer_year,
                                "financial_status": funding_status,
                            }
                        )
                        update_data("individual.education.schoolOffers", school_offers)
                        st.rerun()

        # Display offers in a structured way
        if school_offers:
            st.markdown("**Your School / University Offers**")
            for i, offer in enumerate(school_offers):
                cols = st.columns([0.7, 0.2, 0.1])
                details = (
                    f"**{offer['school']}** - {offer['program']}<br>"
                    f"Year: {offer['year']}<br>"
                    f"Status: {offer['financial_status']}"
                )
                cols[0].markdown(details, unsafe_allow_html=True)
                if cols[2].button("❌ Remove", key=f"remove_offer_{i}"):
                    school_offers.pop(i)
                    update_data("individual.education.schoolOffers", school_offers)
                    st.rerun()

    st.divider()
    display_section("individual.education", "Education")
