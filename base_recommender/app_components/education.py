import streamlit as st
from app_components.helpers import (
    get_data,
    update_data,
    display_section,
    format_country_name,
    get_languages,
    get_language_proficiency_levels,
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

    # ======================= LANGUAGE PROFICIENCY SECTION =======================
    language_complete = language_proficiency()
    
    # Check if language proficiency is required and complete
    if not language_complete:
        st.error("⚠️ **Language proficiency is required to complete this section.** Please fill in at least your language skills for the destination country.")
        st.stop()

    st.divider()

    # -------------------- EDUCATION HISTORY --------------------
    st.subheader("📚 Education History (past & present)")
    
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
    
    # -------------------- ADD NEW DEGREE (collapsed) --------------------
    with st.expander("➕  Add a new degree / certification", expanded=False):
        with st.form("add_degree", clear_on_submit=True):
            st.markdown("**Add a New Degree / Certification**")

            cols = st.columns([1, 1])
            degree_name = cols[0].text_input("Degree Name", key="degree_name")
            institution = cols[1].text_input("Institution", key="institution")
            cols = st.columns([1, 1])
            field_of_study = cols[0].text_input("Field of Study", key="field")
            in_progress = cols[1].checkbox("I am currently enrolled in this", key="in_progress")

            cols2 = st.columns([1, 1])
            start_year = cols2[0].text_input("Start Year (YYYY)", key="start_year")
            end_year = cols2[1].text_input(
                "Expected end year (YYYY)" if in_progress else "Year completed (YYYY)",
                key="end_year",
            )

            if st.form_submit_button("✅  Save degree"):
                if not (degree_name and institution and start_year and end_year):
                    st.error("Degree, institution, start year and end year are required.")
                else:
                    previous_degrees.append({
                        "degree": degree_name,
                        "institution": institution,
                        "field": field_of_study,
                        "start_year": start_year,
                        "end_year": end_year,
                        "in_progress": in_progress,
                    })
                    update_data("individual.education.previousDegrees", previous_degrees)
                    st.rerun()
    
    # Display existing degrees
    if previous_degrees:
        st.markdown("**Your Educational Background**")
        for i, degree in enumerate(previous_degrees):
            cols = st.columns([0.6, 0.3, 0.1])
            status = " *(in progress)*" if degree.get("in_progress") else ""
            cols[0].markdown(
                f"- **{degree['degree']}**{status}<br>"
                f"{degree.get('institution','')}<br>"
                f"{degree.get('field','')} "
                f"({degree.get('start_year','?')} – {degree.get('end_year','?')})",
                unsafe_allow_html=True,
            )
            if cols[2].button("❌", key=f"remove_degree_{i}"):
                previous_degrees.pop(i)
                update_data("individual.education.previousDegrees", previous_degrees)
                st.rerun()

    # -------------------- VISA-RELEVANT SKILLS (collapsed) --------------------
    with st.expander("🛂  Visa-relevant skills", expanded=False):

        st.markdown("""
        **Add skills that may qualify for skilled-migration visas**  
        *Examples: Programming languages, medical specialties, engineering disciplines, etc.*
        """)

        visa_skills = get_data("individual.education.visaSkills") or []

        with st.form("add_visa_skill", clear_on_submit=True):

            new_skill = st.text_input("Skill/Expertise")

            # Credential fields (optional—labelled inline)
            credential_cols = st.columns([2, 2])
            credential_name = credential_cols[0].text_input("Credential Name (optional)")
            credential_institute = credential_cols[1].text_input("Credential Institute (optional)")

            if st.form_submit_button("✅  Save skill"):
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
            st.markdown("**Your visa-relevant skills**")
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

        # --------------- PLANNED STUDY (collapsed) ---------------
        with st.expander("➕  Add planned study (course OR university offer)", expanded=False):
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

                if st.form_submit_button("✅  Save entry"):
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

        # ------- Display saved offers inside the same expander -------
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

def language_proficiency():
    """Handle language proficiency information for the individual and their family"""
    # CONSISTENT SUBHEADER PATTERN
    st.subheader("🗣️ Language Skills")
    
    # DATA INITIALIZATION PATTERN
    destination_country = get_data("individual.residencyIntentions.destinationCountry.country")
    destination_region = get_data("individual.residencyIntentions.destinationCountry.region")
    
    if not destination_country:
        st.warning("⚠️ Please complete the Destination section first to see language requirements.")
        return False
        
    # Get languages for the country/region
    language_info = get_languages(destination_country, destination_region)
    if not language_info:
        st.warning("⚠️ No language information available for this country.")
        return False
        
    # Format language information
    country_languages = sorted(language_info.get("country_languages", []))
    region_languages = sorted(language_info.get("region_languages", []))
    
    # INFORMATION DISPLAY PATTERN
    if country_languages:
        if len(country_languages) == 1:
            country_lang_text = country_languages[0]
        else:
            country_lang_text = f"{', '.join(country_languages[:-1])} and {country_languages[-1]}"
        st.info(f"🌐 The dominant language{'s' if len(country_languages) > 1 else ''} "
                f"in {destination_country} {'are' if len(country_languages) > 1 else 'is'} "
                f"**{country_lang_text}**.")
    
    if destination_region and destination_region != "I don't know" and region_languages:
        if len(region_languages) == 1:
            region_lang_text = region_languages[0]
        else:
            region_lang_text = f"{', '.join(region_languages[:-1])} and {region_languages[-1]}"
        st.info(f"📍 In {destination_region}, the dominant language{'s' if len(region_languages) > 1 else ''} "
                f"{'are' if len(region_languages) > 1 else 'is'} **{region_lang_text}**.")
    
    # Combine and deduplicate languages
    all_languages = list(set(country_languages + (region_languages or [])))
    
    # Get proficiency levels
    proficiency_levels = get_language_proficiency_levels()
    
    st.write("Please indicate proficiency levels for relevant languages:")
    
    # Initialize or get existing language data
    language_data = get_data("individual.residencyIntentions.languageProficiency") or {
        "individual": {},
        "partner": {},
        "dependents": [],
        "willing_to_learn": [],
        "can_teach": {},
        "other_languages": {}
    }
    
    # -------------------- INDIVIDUAL'S PROFICIENCY --------------------
    st.markdown("**📊 Your Language Skills**")
    individual_proficiency = {}
    for lang in all_languages:
        current_level = language_data["individual"].get(lang, 0)
        level = st.select_slider(
            f"Your proficiency in {lang}",
            options=range(6),
            value=current_level,
            format_func=lambda x: "None" if x == 0 else proficiency_levels.get(x, ""),
            key=f"individual_{lang}"
        )
        if level > 0:
            individual_proficiency[lang] = level
    
    # -------------------- PARTNER'S PROFICIENCY --------------------
    has_partner = get_data("individual.personalInformation.relocationPartner")
    if has_partner:
        st.markdown("**👥 Partner's Language Skills**")
        partner_proficiency = {}
        for lang in all_languages:
            current_level = language_data["partner"].get(lang, 0)
            level = st.select_slider(
                f"Partner's proficiency in {lang}",
                options=range(6),
                value=current_level,
                format_func=lambda x: "None" if x == 0 else proficiency_levels.get(x, ""),
                key=f"partner_{lang}"
            )
            if level > 0:
                partner_proficiency[lang] = level
    
    # -------------------- DEPENDENTS' PROFICIENCY --------------------
    num_dependents = get_data("individual.personalInformation.numRelocationDependents") or 0
    dependents_proficiency = []
    if num_dependents > 0:
        st.markdown("**👨‍👩‍👧‍👦 Dependents' Language Skills**")
        for i in range(num_dependents):
            dependent_langs = {}
            with st.expander(f"Dependent {i+1}"):
                for lang in all_languages:
                    current_level = (language_data["dependents"][i] if i < len(language_data["dependents"]) else {}).get(lang, 0)
                    level = st.select_slider(
                        f"Proficiency in {lang}",
                        options=range(6),
                        value=current_level,
                        format_func=lambda x: "None" if x == 0 else proficiency_levels.get(x, ""),
                        key=f"dependent_{i}_{lang}"
                    )
                    if level > 0:
                        dependent_langs[lang] = level
            dependents_proficiency.append(dependent_langs)
    
    # -------------------- LANGUAGE LEARNING WILLINGNESS --------------------
    willing_to_learn = []
    for lang in all_languages:
        if lang not in individual_proficiency or individual_proficiency[lang] < 3:
            if st.checkbox(f"Willing to learn {lang}", 
                         value=lang in language_data["willing_to_learn"],
                         key=f"learn_{lang}"):
                willing_to_learn.append(lang)
    
    # -------------------- TEACHING CAPABILITIES --------------------
    can_teach = {}
    
    # Languages from current country/region
    for lang, level in individual_proficiency.items():
        if level >= 4:  # Only show teaching option for advanced/native speakers
            teaching_ability = st.radio(
                f"Can you teach {lang}?",
                ["No", "Informally", "Formally with credentials"],
                index=["No", "Informally", "Formally with credentials"].index(language_data["can_teach"].get(lang, "No")),
                horizontal=True,
                key=f"teach_{lang}"
            )
            if teaching_ability != "No":
                can_teach[lang] = teaching_ability
    
    # -------------------- OTHER LANGUAGES --------------------
    st.markdown("#### 🔤 Other languages you speak (and could teach)")
    st.caption("Add any other languages you can teach that aren't listed above")
    
    # Get or initialize other_languages
    other_languages = language_data.get("other_languages", {})
    
    # ADD NEW ITEM PATTERN
    with st.form("add_language_form", clear_on_submit=True):
        col1, col2 = st.columns([2, 1])
        with col1:
            new_language = st.text_input("Language name")
        with col2:
                teaching_level = st.radio(
                    "Teaching capability",
                    ["Not interested", "Informally", "Formally with credentials"],
                    horizontal=True
                )
            
        submitted = st.form_submit_button("💾 Add Language")
        if submitted and new_language:
            if new_language and new_language not in other_languages:
                other_languages[new_language] = teaching_level
                update_data("individual.residencyIntentions.languageProficiency.other_languages", other_languages)
                st.rerun()
    
    # -------------------- DISPLAY ITEMS PATTERN --------------------
    if other_languages:
        st.markdown("**🔤 Languages you can teach:**")
        for lang, level in dict(other_languages).items():  # Use dict() to avoid runtime modification issues
            col1, col2, col3 = st.columns([2, 1, 1])
            with col1:
                st.write(f"- {lang}")
            with col2:
                st.write(level)
            with col3:
                if st.button("❌ Remove", key=f"remove_{lang}"):
                    del other_languages[lang]
                    update_data("individual.residencyIntentions.languageProficiency.other_languages", other_languages)
                    st.rerun()
    
    # -------------------- UPDATE LANGUAGE DATA --------------------
    language_data.update({
        "individual": individual_proficiency,
        "partner": partner_proficiency if has_partner else {},
        "dependents": dependents_proficiency,
        "willing_to_learn": willing_to_learn,
        "can_teach": can_teach,
        "other_languages": other_languages
    })
    
    update_data("individual.residencyIntentions.languageProficiency", language_data)
    
    # Return True if at least the individual has some language proficiency
    return bool(individual_proficiency)
