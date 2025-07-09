import streamlit as st
import datetime
from app_components.helpers import (
    get_data, update_data, get_country_list, display_section)

def personal(anchor):
    """
    Personal Information Section with distinctive styling
    """
    # ======================= SECTION HEADER =======================
    st.header(f"👤 {anchor}", anchor=anchor, divider="rainbow")
    
    # -------------------- VISIBILITY TOGGLE --------------------
    if not st.toggle(f"📋 Show {anchor}", value=True, key=f"show_{anchor}"):
        st.info(f"🔍 {anchor} section is hidden. Toggle to show. Your previously entered data is preserved.")
        return

    # -------------------- SECTION IMPORTANCE --------------------
    with st.expander("💡 Why is this section important?"):
        st.warning("""
        **Your personal information helps:**
        - Determine tax residency status in multiple jurisdictions
        - Assess eligibility for specific visa categories
        - Identify applicable tax treaties based on nationality
        - Evaluate family-based immigration options
        - Calculate age-related benefits and obligations
        - Establish timeline requirements for residency applications
        """)

    # ======================= BASIC INFORMATION =======================
    st.subheader("📝 Basic Information")
    
    # DATE OF BIRTH WITH DATA BINDING
    date_of_birth = st.date_input(
        "Date of birth *",
        value=datetime.datetime.strptime(get_data("individual.personalInformation.dateOfBirth"), "%Y-%m-%d").date() 
            if get_data("individual.personalInformation.dateOfBirth") 
            else datetime.date.today() - datetime.timedelta(days=365*30),
        min_value=datetime.date.today() - datetime.timedelta(days=365*100),
        max_value=datetime.date.today(),
        help="Your date of birth affects tax credits, retirement options, and age-related benefits.")
    update_data(
        "individual.personalInformation.dateOfBirth", 
        date_of_birth.strftime("%Y-%m-%d"))

    # ======================= CURRENT RESIDENCE =======================
    st.subheader("🏠 Current Residence")
    
    # COUNTRY SELECTION WITH DATA BINDING
    previous_country = get_data("individual.personalInformation.currentResidency.country")
    current_country = st.selectbox(
        "Country of current residence *",
        options=[""] + get_country_list(),
        index=(get_country_list().index(previous_country) + 1) if previous_country in get_country_list() else 0,
        help="Where you currently live and pay taxes."
    )
    if current_country != previous_country:
        update_data("individual.personalInformation.currentResidency.country", current_country)
        st.rerun()

    # RESIDENCY STATUS WITH DATA BINDING
    previous_residency_status = get_data("individual.personalInformation.currentResidency.status")
    residency_status_options = ["Citizen", "Permanent Resident", "Temporary Resident"]
    residency_status = st.selectbox(
        "Current residency status *",
        options=residency_status_options,
        index=residency_status_options.index(previous_residency_status) if previous_residency_status in residency_status_options else 0,
        help="Your official status in your current country affects your tax obligations."
    )
    if residency_status != previous_residency_status:
        update_data("individual.personalInformation.currentResidency.status", residency_status)
        st.rerun()

    # CONDITIONAL DISPLAY OF RESIDENCE DURATION
    if residency_status == "Temporary Resident":
        years_at_residence = st.number_input(
            "Years at current residence *",
            min_value=0.0,
            max_value=100.0,
            value=float(get_data("individual.personalInformation.currentResidency.duration") or 0.0),
            step=0.5,
            help="Length of time at current residence affects residency status for tax purposes.")
        update_data(
            "individual.personalInformation.currentResidency.duration",
            years_at_residence)

    # ======================= CITIZENSHIPS =======================
    st.subheader("🌍 Citizenship(s) *")
    
    # DATA INITIALIZATION PATTERN
    nationalities = get_data("individual.personalInformation.nationalities") or []
    current_status = get_data("individual.personalInformation.currentResidency.status")
    current_country = get_data("individual.personalInformation.currentResidency.country")

    # Convert old format (list of strings) to new format (list of dicts)
    if nationalities and isinstance(nationalities[0], str):
        nationalities = [{"country": nat, "willingToRenounce": False} for nat in nationalities]

    # Ensure current country is handled as before, but with new structure
    def nationality_in_list(country):
        return any(n["country"] == country for n in nationalities)

    if current_country and not nationality_in_list(current_country) and current_status == "Citizen":
        nationalities.insert(0, {"country": current_country, "willingToRenounce": False})
    if current_country and nationality_in_list(current_country) and current_status == "Citizen":
        nationalities = [n for n in nationalities if n["country"] != current_country]
        nationalities.insert(0, {"country": current_country, "willingToRenounce": False})
    if current_country and nationality_in_list(current_country) and current_status != "Citizen":
        nationalities = [n for n in nationalities if n["country"] != current_country]

    # Remove any empty strings or empty country fields
    nationalities = [n for n in nationalities if n.get("country")]
    update_data("individual.personalInformation.nationalities", nationalities)

    # -------------------- ADD NEW ITEM PATTERN --------------------
    with st.form("add_citizenship_form", clear_on_submit=True):
        new_citizenship = st.selectbox(
            "Citizenship",
            options=[""] + get_country_list(),
            help="Select each country where you hold citizenship."
        )
        submitted = st.form_submit_button("💾 Add citizenship")
        if submitted and new_citizenship:
            if new_citizenship != "" and not nationality_in_list(new_citizenship):
                nationalities.append({"country": new_citizenship, "willingToRenounce": False})
                update_data(
                    "individual.personalInformation.nationalities",
                    nationalities
                )
                st.rerun()

    # -------------------- DISPLAY ITEMS PATTERN --------------------
    if nationalities:
        for nat in nationalities:
            col_nat, col_renounce, col_remove = st.columns([0.5, 0.3, 0.2])
            with col_nat:
                st.write(f"- {nat['country']}")
            with col_renounce:
                renounce = st.checkbox(
                    "Willing to give up?",
                    value=nat.get("willingToRenounce", False),
                    key=f"renounce_{nat['country']}",
                    help="Renouncing a citizenship can remove obligations such as military service "
                         "or **citizenship-based taxation**. For example, the United States taxes its "
                         "citizens on worldwide income even when they live abroad, creating double-tax exposure."
                )
                if renounce != nat.get("willingToRenounce", False):
                    nat["willingToRenounce"] = renounce
                    update_data("individual.personalInformation.nationalities", nationalities)
            with col_remove:
                # Prevent removal of the current country
                if nat["country"] != current_country or current_status != "Citizen":
                    if st.button(f"❌", key=f"remove_nat_{nat['country']}"):
                        updated_nationalities = [n for n in nationalities if n["country"] != nat["country"]]
                        update_data(
                            "individual.personalInformation.nationalities",
                            updated_nationalities
                        )
                        st.rerun()

    if not len(nationalities) >= 1:
        st.warning("⚠️ You must be a citizen of at least one country!")

    # ======================= MARITAL STATUS =======================
    st.subheader("💍 Marital Status")
    
    # CONSISTENT OPTION SELECTION
    marital_status_options = [
        "Single", 
        "Official Partnership",
        "Married",
        "Divorced",
        "Widowed"
    ]
    current_marital_status = get_data("individual.personalInformation.maritalStatus") or "Single"

    new_status = st.selectbox(
        "Marital status *",
        options=marital_status_options,
        index=marital_status_options.index(current_marital_status) if current_marital_status in marital_status_options else 0,
        help="Your marital status affects tax filing status."
    )
    
    if new_status != current_marital_status:
        update_data("individual.personalInformation.maritalStatus", new_status)
        st.rerun()

    # ======================= RELOCATION PARTNER =======================
    relocation_partner = st.checkbox(
        "I have a partner who will relocate with me",
        value=get_data("individual.personalInformation.relocationPartner"),
        help="Include information about a spouse or partner relocating with you.")
    update_data("individual.personalInformation.relocationPartner", relocation_partner)

    if relocation_partner:
        st.subheader("👥 Partner Relationship")
        
        # -------------------- RELATIONSHIP TYPE --------------------
        current_relationship_type = get_data(
            "individual.personalInformation.relocationPartnerInfo.relationshipType"
        )
        
        # INFORMATION EXPANDER PATTERN
        with st.expander("📚 Learn more about relationship types"):
            st.markdown("""
            ### This list covers the main categories recognized in various immigration systems:

            1. **Spouse**: Refers to legally married partners, which is the most widely recognized category.

            2. **Fiancé(e)**: Included for those engaged to be married, often eligible for specific visas.

            3. **Civil Partner**: Kept for jurisdictions that recognize this status.

            4. **Unmarried Partner**: A common term in immigration contexts for long-term, committed relationships.

            5. **Common-law Partner**: Recognized in some countries for long-term cohabiting couples.

            6. **Cohabiting Partner**: Retained from your original list, as some systems specifically use this term.

            7. **Domestic Partner**: Added for jurisdictions that recognize this status.

            8. **Conjugal Partner**: Recognized in some immigration systems (e.g., Canada) for committed partners unable to live together.

            9. **Other**: Kept to cover any unique situations or relationships not fitting the above categories.

            This expanded list aims to be more inclusive of various relationship types recognized across different immigration systems while maintaining clarity for users.
            """)

        # CONSISTENT OPTION SELECTION
        relationship_options = [
            "Unmarried Partner",
            "Spouse", 
            "Fiancé(e)",
            "Civil Partner",
            "Cohabiting Partner",
            "Common-law Partner",
            "Conjugal Partner",
            "Domestic Partner",
            "Other"
        ]

        # Default to "Spouse" if married and no relationship type set yet
        if current_marital_status == "Married" and not current_relationship_type:
            default_relationship = "Spouse"
        else:
            default_relationship = current_relationship_type or relationship_options[0]

        new_relationship_type = st.selectbox(
            "Partner relationship type *",
            options=relationship_options,
            index=relationship_options.index(default_relationship) if default_relationship in relationship_options else 0,
            help="Select the legal nature of your relationship"
        )

        # CONDITIONAL INPUT PATTERN
        if new_relationship_type == "Other":
            explanation = st.text_input(
                "Please explain your relationship type *",
                value=get_data(
                    "individual.personalInformation.relocationPartnerInfo.relationshipType"
                ) if get_data(
                    "individual.personalInformation.relocationPartnerInfo.relationshipType"
                ) != "Other" else ""
            )
            new_relationship_type = explanation

        if new_relationship_type != current_relationship_type:
            update_data(
                "individual.personalInformation.relocationPartnerInfo.relationshipType",
                new_relationship_type
            )
            
            # VALIDATION WARNINGS
            if new_relationship_type == "Spouse" and current_marital_status != "Married":
                st.error("⚠️ You have selected 'Spouse' as your relationship type but your marital status is not 'Married'. Please make your input consistent.")
            
            elif new_relationship_type in ["Civil Partner", "Domestic Partner"] and current_marital_status != "Official Partnership":
                st.error(f"⚠️ You have selected '{new_relationship_type}' but your marital status is not 'Official Partnership'. Please update your marital status.")
            
            st.rerun()

        # SAME-SEX PARTNERSHIP INFO
        current_same_sex = get_data("individual.personalInformation.relocationPartnerInfo.sameSex")
        same_sex_partnership = st.checkbox(
            "This is a same-sex relationship",
            value=current_same_sex,
            help="This may affect how some counties see your union."
        )   
        
        if same_sex_partnership != current_same_sex:
            update_data(
                "individual.personalInformation.relocationPartnerInfo.sameSex",
                same_sex_partnership
            )
            st.rerun()

        # -------------------- RELATIONSHIP CONSISTENCY --------------------
        relationship_type = get_data("individual.personalInformation.relocationPartnerInfo.relationshipType")
        marital_stat = get_data("individual.personalInformation.maritalStatus")
        
        # Case 1: Simple matching cases - no explanation needed
        if relationship_type == "Spouse" and marital_stat == "Married":
            st.caption("✅ You are married to your relocation partner")
        
        elif relationship_type in ["Civil Partner", "Domestic Partner"] and marital_stat == "Official Partnership":
            st.caption(f"✅ You are in an official partnership with your relocation partner as {relationship_type}")
            
        elif marital_stat in ["Single", "Divorced", "Widowed"] and relationship_type not in ["Spouse", "Civil Partner", "Domestic Partner"]:
            st.caption(f"✅ You are {marital_stat.lower()} and in a relationship with your {relationship_type.lower()}")
            
        # Case 2: Inconsistent states requiring explanation
        elif relationship_type == "Spouse" and marital_stat != "Married":
            st.error("⚠️ Your relationship type is 'Spouse' but your marital status is not 'Married'. Please update your marital status.")
            
        elif relationship_type in ["Civil Partner", "Domestic Partner"] and marital_stat != "Official Partnership":
            st.error(f"⚠️ Your relationship type is '{relationship_type}' but your marital status is not 'Official Partnership'. Please update your marital status.")
            
        # Case 3: Complex cases requiring explanation
        elif marital_stat == "Married" and relationship_type != "Spouse":
            with st.expander("ℹ️ Being married while bringing an unmarried partner requires explanation"):
                st.markdown("""
                    Many countries require proof that any prior marriages have been dissolved 
                    (e.g., divorce certificates) when applying for visas based on relationships. 
                    This ensures compliance with requirements like "any previous relationship has broken down permanently"
                """)
            still_married_situation = st.text_input(
                "Please explain your situation. E.g. separated and divorce in progress? *",
                value=get_data("individual.personalInformation.enduringMaritalStatusInfo")
            )
            update_data("individual.personalInformation.enduringMaritalStatusInfo", still_married_situation)
            
        elif marital_stat == "Official Partnership" and relationship_type not in ["Civil Partner", "Domestic Partner"]:
            with st.expander("ℹ️ Being in an official partnership while bringing a different partner requires explanation"):
                st.markdown("""
                    You'll need to explain your current partnership status and how it relates to your 
                    relocation partner relationship. Some countries may require the official partnership 
                    to be dissolved before recognizing a new relationship.
                """)
            partnership_situation = st.text_input(
                "Please explain your situation. E.g. partnership dissolution in progress? *",
                value=get_data("individual.personalInformation.enduringMaritalStatusInfo")
            )
            update_data("individual.personalInformation.enduringMaritalStatusInfo", partnership_situation)

        # -------------------- RELATIONSHIP DURATION --------------------
        relationship_type = get_data("individual.personalInformation.relocationPartnerInfo.relationshipType")
        cols = st.columns(2)

        with cols[0]:
            with st.container(height=170):
                with st.container(height=50, border=False):
                    st.write(f"Full duration: how long have you been in a relationship \
                            with your {relationship_type.lower()}? (in years) *")
                full_relationship_duration = st.number_input(
                    label="full_relationship_duration",
                    label_visibility="hidden",
                    min_value=0.0,
                    step=0.5,
                    value=float(get_data("individual.personalInformation.relocationPartnerInfo.fullRelationshipDuration") or 0.0))
                update_data(
                    "individual.personalInformation.relocationPartnerInfo.fullRelationshipDuration",
                    full_relationship_duration)

        with cols[1]:
            if relationship_type == "Spouse":
                with st.container(height=170):
                    with st.container(height=50, border=False):
                        st.write("How long have you been married? (in years) *")
                    marriage_duration = st.number_input(
                        label="marriage_duration",
                        label_visibility="hidden",
                        min_value=0.0,
                        max_value=float(full_relationship_duration),
                        step=0.5,
                        value=float(get_data("individual.personalInformation.relocationPartnerInfo.officialRelationshipDuration") or 0.0))
                    update_data(
                        "individual.personalInformation.relocationPartnerInfo.officialRelationshipDuration",
                        marriage_duration)
            else:
                if relationship_type in ["Civil Partner", "Domestic Partner"]:
                    official_duration_question = \
                        f"How long have you been in an officially recognized \
                            {relationship_type.lower()} relationship? (in years) *"
                elif relationship_type in [
                    "Unmarried Partner",
                    "Common-law Partner", 
                    "Cohabiting Partner"
                    ]:
                    official_duration_question = \
                        "How long have you been living together? (in years) *"
                
                elif relationship_type == "Fiancé(e)":
                    official_duration_question = \
                        "How long have you been engaged? (in years) *"
                elif relationship_type == "Conjugal Partner":
                    official_duration_question = \
                        "How long have you been in a committed relationship? (in years) *"
                else:
                    official_duration_question = \
                        "How long have you been in this relationship officially? (in years) *"

                with st.container(height=170):
                    with st.container(height=50, border=False):
                        st.write(f"{official_duration_question}")
                    official_duration = st.number_input(
                        label="official_duration",
                        label_visibility="hidden",
                        min_value=0.0,
                        max_value=full_relationship_duration, 
                        step=0.5,
                        value=float(get_data("individual.personalInformation.relocationPartnerInfo.officialRelationshipDuration") or 0.0))
                    update_data(
                        "individual.personalInformation.relocationPartnerInfo.officialRelationshipDuration",
                        official_duration)

        # -------------------- PARTNER CITIZENSHIPS --------------------
        st.subheader("🌍 Partner citizenships *")
        partner_nationalities = get_data("individual.personalInformation.relocationPartnerInfo.partnerNationalities") or []

        # Convert old format (list of strings) to new format (list of dicts)
        if partner_nationalities and isinstance(partner_nationalities[0], str):
            partner_nationalities = [{"country": nat, "willingToRenounce": False} for nat in partner_nationalities]

        def partner_nat_in_list(country):
            return any(n["country"] == country for n in partner_nationalities)

        with st.form("add_partner_citizenship"):
            new_nat = st.selectbox(
                "Partner citizenship",
                options=[""] + get_country_list(),
                help="Select all nationalities held by partner"
            )
            if st.form_submit_button("💾 Add citizenship") and new_nat:
                if new_nat and not partner_nat_in_list(new_nat):
                    partner_nationalities.append({"country": new_nat, "willingToRenounce": False})
                    update_data(
                        "individual.personalInformation.relocationPartnerInfo.partnerNationalities", 
                        partner_nationalities)
                    st.rerun()

        for i, nat in enumerate(partner_nationalities):
            cols = st.columns([4, 2, 1])
            cols[0].write(f"- {nat['country']}")
            renounce = cols[1].checkbox(
                "Willing to give up?",
                value=nat.get("willingToRenounce", False),
                key=f"partner_renounce_{nat['country']}",
                help="Renouncing a citizenship can remove obligations such as military service "
                     "or **citizenship-based taxation**. For example, the United States taxes its "
                     "citizens on worldwide income even when they live abroad."
            )
            if renounce != nat.get("willingToRenounce", False):
                nat["willingToRenounce"] = renounce
                update_data("individual.personalInformation.relocationPartnerInfo.partnerNationalities", partner_nationalities)
            if cols[2].button("❌", key=f"partner_nat_{nat['country']}_{i}"):
                partner_nationalities.pop(i)
                update_data("individual.personalInformation.relocationPartnerInfo.partnerNationalities", partner_nationalities)
                st.rerun()

        if not partner_nationalities:
            st.warning("⚠️ Your partner must have at least one citizenship")

    # ======================= DEPENDENTS =======================
    has_dependents = st.checkbox(
        "I have dependents who will relocate with me",
        value=get_data("individual.personalInformation.numRelocationDependents") > 0,
        help="Include information about dependents relocating with you."
    )
    
    if has_dependents:
        update_data("individual.personalInformation.numRelocationDependents", 1)
        
        # -------------------- DEPENDENTS COUNT --------------------
        st.subheader("👨‍👩‍👧‍👦 Relocating Dependents")
        num_dependents = st.number_input(
            "Number of Relocating Dependents *",
            min_value=0,
            max_value=10,
            value=int(get_data("individual.personalInformation.numRelocationDependents") or 1)
        )
        update_data("individual.personalInformation.numRelocationDependents", num_dependents)
        
        # DATA INITIALIZATION PATTERN
        dependents = get_data("individual.personalInformation.relocationDependents") or []
        
        # Add new dependents if needed
        while len(dependents) < num_dependents:
            dependents.append({
                "dateOfBirth": "",
                "nationalities": [],
                "relationship": "",
                "isStudent": False
            })
        
        # Remove extra dependents if needed
        dependents = dependents[:num_dependents]
        
        update_data("individual.personalInformation.relocationDependents", dependents)
        
        # -------------------- DISPLAY ITEMS PATTERN --------------------
        for i in range(num_dependents):
            with st.expander(f"Dependent {i+1} Details"):
                col1, col2 = st.columns(2)
                
                with col1:
                    date_of_birth = st.date_input(
                        f"Dependent {i+1} Birth date *",
                        value=datetime.date.fromisoformat(dependents[i]["dateOfBirth"]) if dependents[i]["dateOfBirth"] else (datetime.date.today() - datetime.timedelta(days=365*5)),
                        min_value=datetime.date.today() - datetime.timedelta(days=365*100),
                        max_value=datetime.date.today(),
                        key=f"dep_{i}_dob"
                    )
                    dependents[i]["dateOfBirth"] = date_of_birth.isoformat()
                    
                    # Convert old format to new format
                    if dependents[i]["nationalities"] and isinstance(dependents[i]["nationalities"][0], str):
                        dependents[i]["nationalities"] = [
                            {"country": nat, "willingToRenounce": False} for nat in dependents[i]["nationalities"]
                        ]
                    nationalities = dependents[i]["nationalities"]

                    def dep_nat_in_list(country):
                        return any(n["country"] == country for n in nationalities)

                    new_nat = st.selectbox(
                        "Add citizenship *",
                        [""] + [c for c in get_country_list() if not dep_nat_in_list(c)],
                        key=f"dep_{i}_nat_select"
                    )
                    if st.button("💾 Add citizenship", key=f"dep_{i}_add_nat"):
                        if new_nat and not dep_nat_in_list(new_nat):
                            nationalities.append({"country": new_nat, "willingToRenounce": False})
                    dependents[i]["nationalities"] = nationalities

                    # Display existing nationalities with remove and renounce option
                    for j, nat in enumerate(list(nationalities)):
                        cols = st.columns([3, 2, 1])
                        cols[0].write(f"- {nat['country']}")
                        renounce = cols[1].checkbox(
                            "Willing to give up?",
                            value=nat.get("willingToRenounce", False),
                            key=f"dep_{i}_renounce_{nat['country']}",
                            help="Renouncing a citizenship can remove obligations such as military service "
                                 "or **citizenship-based taxation** (e.g., the U.S. worldwide-income tax)."
                        )
                        if renounce != nat.get("willingToRenounce", False):
                            nat["willingToRenounce"] = renounce
                            update_data("individual.personalInformation.relocationDependents", dependents)
                        if cols[2].button("❌", key=f"dep_{i}_remove_nat_{nat['country']}_{j}"):
                            nationalities.pop(j)
                            dependents[i]["nationalities"] = nationalities
                            update_data("individual.personalInformation.relocationDependents", dependents)
                            st.rerun()
                
                with col2:
                    # Relationship to dependent
                    relationship_options = [
                        "Child", "Parent", "Sibling", "Legal Ward (I am)", "Other"
                    ]
                    relationship = st.selectbox(
                        "Relationship to dependent *",
                        options=relationship_options,
                        index=relationship_options.index(dependents[i]["relationship"]) if dependents[i]["relationship"] in relationship_options else 0,
                        key=f"dep_{i}_relationship"
                    )
                    dependents[i]["relationship"] = relationship

                    st.markdown("\n")
                    is_student = st.checkbox(
                        "Is a student",
                        value=dependents[i]["isStudent"],
                        key=f"dep_{i}_is_student"
                    )
                    dependents[i]["isStudent"] = is_student
    
        update_data("individual.personalInformation.relocationDependents", dependents)

    st.divider()
    display_section("individual.personalInformation", "Personal Information")
    
