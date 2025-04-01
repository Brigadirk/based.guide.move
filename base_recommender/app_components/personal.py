import streamlit as st
import datetime
from app_components.helpers import get_data, update_data, get_country_list
import json

def filled_in_correctly(personal_information):
    """Validate that all required fields are filled in correctly"""
    errors = []
    
    # Check date of birth
    if not personal_information.get("dateOfBirth"):
        errors.append("Date of birth is required")
    
    # Check nationalities
    if not personal_information.get("nationalities") or len(personal_information.get("nationalities", [])) == 0:
        errors.append("At least one nationality is required")
    
    # Check marital status
    if not personal_information.get("maritalStatus"):
        errors.append("Marital status is required")
    
    # Check current residency
    current_residency = personal_information.get("currentResidency", {})
    if not current_residency.get("country"):
        errors.append("Current country of residence is required")
    if not current_residency.get("status"):
        errors.append("Current residency status is required")
    
    # Check residency duration
    years = current_residency.get("yearsAtCurrentResidency")
    months = current_residency.get("monthsAtCurrentResidency")
    if (years is None or years == 0) and (months is None or months == 0):
        errors.append("Duration of current residency is required")
    
    # Check relocation partner info if applicable
    if personal_information.get("relocationPartner"):
        partner_info = personal_information.get("relocationPartnerInfo", {})
        
        if not partner_info.get("relationshipType"):
            errors.append("Partner relationship type is required")
        
        if not partner_info.get("fullRelationshipDuration") and partner_info.get("fullRelationshipDuration") != 0:
            errors.append("Full relationship duration is required")
        
        # Check official relationship duration for married/civil partners
        relationship_type = partner_info.get("relationshipType", "")
        if relationship_type not in ["Unmarried Partner", "Cohabiting Partner"] and not partner_info.get("officialRelationshipDuration") and partner_info.get("officialRelationshipDuration") != 0:
            errors.append("Official relationship duration is required")
        
        # Check partner nationalities
        if not partner_info.get("partnerNationalities") or len(partner_info.get("partnerNationalities", [])) == 0:
            errors.append("At least one partner nationality is required")
    
    # Check dependents if applicable
    num_dependents = personal_information.get("numRelocationDependents", 0)
    if num_dependents > 0:
        dependents = personal_information.get("relocationDependents", [])
        
        for i, dependent in enumerate(dependents[:num_dependents]):
            if not dependent.get("dateOfBirth"):
                errors.append(f"Dependent {i+1} date of birth is required")
            
            if not dependent.get("nationalities") or len(dependent.get("nationalities", [])) == 0:
                errors.append(f"Dependent {i+1} must have at least one nationality")
            
            if not dependent.get("relationship"):
                errors.append(f"Dependent {i+1} relationship is required")
    
    # Display validation results
    if errors:
        st.error("Please fix the following errors:")
        for error in errors:
            st.warning(error)
        return False
    else:
        st.success("All required information has been provided!")
        return True

def date_of_birth():
    date_of_birth = st.date_input(
        "Date of Birth *",
        value=datetime.date.today() - datetime.timedelta(days=365*30), # default to ~30 years old
        min_value=datetime.date.today() - datetime.timedelta(days=365*100),
        max_value=datetime.date.today(),
        help="Your date of birth affects tax credits, \
            retirement options, and age-related benefits.")
    update_data(
        "individual.personalInformation.dateOfBirth", 
        date_of_birth.strftime("%Y-%m-%d"))

def current_country():
    # Get the current value from session state
    previous_country = get_data("individual.personalInformation.currentResidency.country")
    
    # Create the selectbox
    current_country = st.selectbox(
        "Country of current residence *",
        options=[""] + get_country_list(),
        index=(get_country_list().index(previous_country) + 1) if previous_country in get_country_list() else 0,
        help="Where you currently live and pay taxes."
    )
    
    # Update session state if the value has changed
    if current_country != previous_country:
        update_data("individual.personalInformation.currentResidency.country", current_country)
        st.rerun()  # Trigger a rerun

def residency_status(): 
    # Get the current value from session state
    previous_residency_status = get_data("individual.personalInformation.currentResidency.status")
    
    # Define residency status options
    residency_status_options = ["Citizen", "Permanent Resident", "Temporary Resident"]
    
    # Create the selectbox
    residency_status = st.selectbox(
        "Current Residency Status *",
        options=residency_status_options,
        index=residency_status_options.index(previous_residency_status) if previous_residency_status else 0,
        help="Your official status in your current country affects your tax obligations."
    )
    
    # Update session state if the value has changed
    if residency_status != previous_residency_status:
        update_data("individual.personalInformation.currentResidency.status", residency_status)
        st.rerun()  # Trigger a rerun

    return residency_status

def years_at_residence():
    years_at_residence = st.number_input(
        "Years at current residence *",
        min_value=0.0,
        max_value=100.0,
        value=get_data("individual.personalInformation.currentResidency.duration"),
        step=0.5,
        help="Length of time at current residence affects residency status for tax purposes.")
    update_data(
        "individual.personalInformation.currentResidency.duration",
        years_at_residence)
        
def select_nationalities():
    st.subheader("Nationalities *")
    nationalities = get_data("individual.personalInformation.nationalities") or []
    current_status = get_data("individual.personalInformation.currentResidency.status")
    current_country = get_data("individual.personalInformation.currentResidency.country")

    # Ensure current country is correctly managed in the nationalities list
    if current_country and current_country not in nationalities and current_status == "Citizen":
        nationalities.insert(0, current_country)
    if current_country and current_country in nationalities and current_status == "Citizen":
        nationalities.remove(current_country)
        nationalities.insert(0, current_country)
    if current_country and current_country in nationalities and current_status != "Citizen":
        nationalities.remove(current_country)

    # Remove any empty strings from the list
    nationalities = [nat for nat in nationalities if nat]  # Filter out empty strings
    update_data("individual.personalInformation.nationalities", nationalities)

    # Form to add a new nationality
    with st.form("add_nationality_form", clear_on_submit=True):
                    new_nationality = st.selectbox(
            "Country of citizenship",
                        options=[""] + get_country_list(),
                        help="Select each country where you hold citizenship."
                    )
                
        submitted = st.form_submit_button("Add nationality")
        
        if submitted and new_nationality:
            # Validate and add the new nationality
            if new_nationality != "" and new_nationality not in nationalities:
                nationalities.append(new_nationality)
                update_data(
                    "individual.personalInformation.nationalities",
                    nationalities
                )
                st.rerun()  # Refresh the app state

    # Display and allow removal of existing nationalities
    if nationalities:
        for nat in nationalities:
            col_nat, col_remove = st.columns([0.7, 0.3])
            with col_nat:
                st.write(f"- {nat}")
            with col_remove:
                # Prevent removal of the current country
                if nat != current_country or current_status != "Citizen":
                    if st.button(f"Remove {nat}", key=f"remove_nat_{nat}"):
                        updated_nationalities = [n for n in nationalities if n != nat]
                        update_data(
                            "individual.personalInformation.nationalities",
                            updated_nationalities
                        )
                        st.rerun()  # Refresh the app state

    if not len(nationalities) >= 1:
        st.warning("You must be a citizen of at least one country!")

def relocation_partner():
    relocation_partner = st.checkbox(
        "I have a partner who will relocate with me",
        value=get_data("individual.personalInformation.relocationPartner"),
        help="Include information about a spouse or partner relocating with you.")
    update_data("individual.personalInformation.relocationPartner", relocation_partner)
    return relocation_partner

def relocation_partner_relation():
    with st.expander("Learn more about relationship types."):
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

    relationship_type = st.selectbox(
        "Partner Relationship Type *",
        options=[
                "Spouse", 
                "Fiancé(e)",
                "Civil Partner",
                "Unmarried Partner",
                "Cohabiting Partner",
                "Other"
            ],
        index=0,
        help="Select the legal nature of your relationship"
        )

    if relationship_type == "Other":
        update_data("individual.personalInformation.relocationPartnerInfo.relationshipType", "Explain..")
        explanation = st.text_input(
            "It's complicated? *",
            value=get_data(
                "individual.personalInformation.relocationPartnerInfo.relationshipType"))
        relationship_type = explanation
    update_data(
        "individual.personalInformation.relocationPartnerInfo.relationshipType",
        relationship_type)
    return relationship_type

def relationship_duration(relationship_type):
    cols = st.columns(2)

                    with cols[0]:
        with st.container(height=170):
            with st.container(height=50, border=False):
                st.write(f"Full duration: how long have you been in a relationship \
                        with your {relationship_type.lower()}? (in years) *")
            full_relationship_duration = st.number_input(
                label = "full_relationship_duration", # Already captured above wuth min height
                label_visibility="hidden",
                min_value=0.0,
                step=0.5)
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
                    step=0.5)
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
                    step=0.5)
                update_data(
                    "individual.personalInformation.relocationPartnerInfo.officialRelationshipDuration",
                    official_duration)
            
def marital_status(relationship_type):
    if relationship_type != "Spouse" and relationship_type != "Civil Partner":

        # Safely retrieve marital status from session state or default to "Single"
        marital_status_options = ["Married", "Single", "Divorced", "Widowed"]
        current_marital_status = get_data("individual.personalInformation.maritalStatus") or "Single"

        # Marital Status Dropdown
        marital_status = st.selectbox(
            "Marital Status *",
            options=marital_status_options,
            index=marital_status_options.index(current_marital_status) if current_marital_status in marital_status_options else 0,
            help="Your marital status affects tax filing status.")
    elif relationship_type == "Spouse":
        marital_status = "Married"
        st.caption("You are assumed to be married with your relocation partner.")
    elif relationship_type == "Civil Partner":
        marital_status = "Civil Partnership"
        st.caption("You are assumed to be in a civil partnership with your relocation partner.")
    update_data("individual.personalInformation.maritalStatus", marital_status)

    if marital_status == "Married" and relationship_type != "Spouse":
        with st.expander("Still being married while bringing an unmarried partner can be a problem;"):
            st.markdown(""" 
                Many countries require proof that any prior marriages have been dissolved 
                (e.g., divorce certificates) when applying for visas based on relationships. 
                This ensures compliance with requirements like "any previous relationship has broken down permanently""")
        still_married_situation = st.text_input(
            "Please explain your situation. E.g. will your marriage be resolved soon? *",
            value=get_data("individual.personalInformation.enduringMaritalStatusInfo"))
        update_data("individual.personalInformation.enduringMaritalStatusInfo", still_married_situation)

def partner_nationalities():
    st.subheader("Partner Nationalities *")
    partner_nationalities = \
        get_data("individual.personalInformation.relocationPartnerInfo.partnerNationalities") or []
    
    with st.form("add_partner_nationality"):
        new_nat = st.selectbox(
            "Partner Citizenship",
                options=[""] + get_country_list(),
            help="Select all nationalities held by partner"
        )
        if st.form_submit_button("Add Nationality") and new_nat:
            partner_nationalities.append(new_nat)
            update_data(
                "individual.personalInformation.relocationPartnerInfo.partnerNationalities", 
                list(set(partner_nationalities)))
    
    for i, nat in enumerate(list(set(partner_nationalities))):
        cols = st.columns([4,1])
        cols[0].write(nat)
        if cols[1].button("Remove", key=f"partner_nat_{i}"):
            partner_nationalities.remove(nat)
            update_data(
                "individual.personalInformation.relocationPartnerInfo.partnerNationalities",
                list(set(partner_nationalities)))
            st.rerun()
    
    if not partner_nationalities:
        st.warning("Your partner must have at least one nationality")

def has_dependents():
    has_dependents = st.checkbox(
        "I have dependents who will relocate with me",
        value=get_data("individual.personalInformation.numRelocationDependents") > 0,
        help="Include information about dependents relocating with you.")
    if has_dependents:
        update_data("individual.personalInformation.numRelocationDependents", 1)
    else:
        update_data("individual.personalInformation.numRelocationDependents", 0)
    return has_dependents

def create_new_dependent():
    return {
        "dateOfBirth": "",
        "nationalities": [],
        "relationship": "",
        "isStudent": False
    }

def add_dependents():
    num_dependents = st.number_input(
        "Number of Relocating Dependents *",
        min_value=0,
        max_value=10,
        value=get_data("individual.personalInformation.numRelocationDependents"))
    update_data("individual.personalInformation.numRelocationDependents", num_dependents)
    
    dependents = get_data("individual.personalInformation.relocationDependents") or []
    
    # Add new dependents if needed
    while len(dependents) < num_dependents:
        dependents.append(create_new_dependent())
    
    # Remove extra dependents if needed
    dependents = dependents[:num_dependents]
    
    update_data("individual.personalInformation.relocationDependents", dependents)
    
    for i in range(num_dependents):
        with st.expander(f"Dependent {i+1} Details"):
            col1, col2 = st.columns(2)
            
            with col1:
                date_of_birth = st.date_input(
                    f"Dependent {i+1} Birth Date *",
                    value=datetime.date.fromisoformat(dependents[i]["dateOfBirth"]) if dependents[i]["dateOfBirth"] else (datetime.date.today() - datetime.timedelta(days=365*5)),
                    min_value=datetime.date.today() - datetime.timedelta(days=365*100),
                    max_value=datetime.date.today(),
                    key=f"dep_{i}_dob"
                )
                dependents[i]["dateOfBirth"] = date_of_birth.isoformat()
                
                nationalities = set(dependents[i]["nationalities"])
                                
                new_nat = st.selectbox(
                    "Add Citizenship *",
                    [""] + [c for c in get_country_list() if c not in nationalities],
                    key=f"dep_{i}_nat_select"
                )
                if st.button("Add Nationality", key=f"dep_{i}_add_nat"):
                    if new_nat and new_nat not in nationalities:
                        nationalities.add(new_nat)
                        dependents[i]["nationalities"] = list(nationalities)
                        st.rerun()
            
                st.write("Nationalities:")
                for nat in list(nationalities):
                    col1, col2 = st.columns([0.9, 0.1])
                    with col1:
                        st.write(f"- {nat}")
                    with col2:
                        if st.button("✕", key=f"dep_{i}_remove_{nat}", help=f"Remove {nat}"):
                            nationalities.remove(nat)
                            dependents[i]["nationalities"] = list(nationalities)
                            st.rerun()
                
                if not nationalities:
                    st.warning("At least one nationality is required.")
            
            with col2:
                relationship = st.selectbox(
                    "Relationship *",
                    ["Child", "Legal Ward", "Parent", "Other Dependent"],
                    key=f"dep_{i}_relation",
                    index=["Child", "Legal Ward", "Parent", "Other Dependent"].index(dependents[i]["relationship"]) if dependents[i]["relationship"] else 0
                )
                dependents[i]["relationship"] = relationship
                
                is_student = st.checkbox(
                    "Full-time Student",
                    value=dependents[i]["isStudent"],
                    key=f"dep_{i}_student"
                )
                dependents[i]["isStudent"] = is_student
    
    # Update the entire relocationDependents list at once
    update_data("individual.personalInformation.relocationDependents", dependents)

def personal():
    st.header("Personal Information", anchor="Personal Information")    
    if not st.toggle("Show section", value=True, key="show_personal_information"):
        st.info("Personal Information section is hidden. Toggle to show. Your previously entered data is preserved.")
    
    else:
        cols = st.columns(2)
    
        with cols[0]:
            date_of_birth()
            current_country()
            if residency_status() == "Temporary Resident":
                years_at_residence()
            select_nationalities()

            if relocation_partner():
                st.subheader("Partner relationship")
                relationship_type = relocation_partner_relation()
                
                if relationship_type:
                    relationship_duration(relationship_type)
                    marital_status(relationship_type)
                
                partner_nationalities()

            if has_dependents():
                add_dependents()
                
            st.divider()

        personal_information_state = get_data("individual.personalInformation")
        if st.button("Show current Personal Information state"):
            st.json(json.dumps(personal_information_state, indent=2))
                
        filled = filled_in_correctly(personal_information_state)
        st.divider()
        return filled
