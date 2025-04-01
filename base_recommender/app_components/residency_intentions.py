import streamlit as st
import json
from app_components.helpers import update_data, get_country_list, get_data

def filled_in_correctly(residency_intentions):
    pass

def center_of_life():
    st.divider()
    st.markdown("#### Important: Center of Life")
    st.caption("TODO: Also determine this based on questions.")
    with st.expander("Learn about 'Center of Life' and its tax implications"):
        st.write("""
        If you, after moving to your destination country, 
                **wish to still have significant presence or business with 
                another country**, you need to look into whether they may 
                judge your "Center of Life" to be there, making you liable 
                to taxation.

        Countries determine your "center of life" to assess if they can tax 
        your worldwide income. Key factors include:

        - Time spent in the country (often >183 days/year)
        - Location of permanent home
        - Family ties
        - Economic interests (job, bank accounts)
        - Social connections

        ELI5: Your "center of life" is like your favorite playground. Countries 
        want to know if their 'playground' is your favorite because it affects 
        how much 'candy' (taxes) they can collect from you.
        
        Understanding this concept is crucial for tax planning when relocating 
        or spending significant time abroad.
        """)
    st.divider()

def select_move_type():
    move_type_options = ["Permanent", "Temporary", "Digital Nomad"]
    current_move_type = get_data("individual.residencyIntentions.destinationCountry.moveType")
    move_type_index = move_type_options.index(current_move_type) \
        if current_move_type in move_type_options \
            else 0
    move_type = st.selectbox(
        "Type of move",
        move_type_options,
        help="Select the type of move you are planning.",
        index=move_type_index)
    update_data("individual.residencyIntentions.destinationCountry.moveType", move_type)
    return move_type

def duration_of_stay():
    cols = st.columns(2)
    with cols[0]:
        duration_of_stay = st.number_input(
            "Years",
            min_value=0.0, 
            max_value=10.0, 
            value=get_data("individual.residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay"),
            step=0.5)
    update_data("individual.residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay", duration_of_stay)

def citizen_status(destination):
    # Check if the destination country is in the user's nationalities
    if destination in get_data("individual.personalInformation.nationalities"):
        # Automatically set citizen_status to "Yes" and make it unchangeable
        st.write(f"You are already a citizen of {destination}.")
        citizen_status = "Yes"
        update_data("individual.residencyIntentions.destinationCountry.citizenshipStatus", True)
    else:
        # Allow the user to select their citizenship status
        citizen_status = st.radio(
            f"Are you already a citizen of {destination}, OR on track for citizenship?",
            options=["Yes", "No"],
            index=1 if not get_data("individual.residencyIntentions.destinationCountry.citizenshipStatus") else 0,
            horizontal=True,
            key="citizen_status"
        )
        update_data("individual.residencyIntentions.destinationCountry.citizenshipStatus", citizen_status == "Yes")
    
    return citizen_status

def residency(destination):
    apply_for_residency = st.checkbox(
        f"I want to apply for residency in {destination}", 
        value=get_data("individual.residencyIntentions.residencyPlans.applyForResidency"))
    update_data(
        "individual.residencyIntentions.residencyPlans.applyForResidency",
        apply_for_residency)
    return apply_for_residency

def citizenship(destination):
    interested_in_citizenship = st.checkbox(
        f"I am interested in becoming a citizen of {destination}", 
        value=get_data("individual.residencyIntentions.citizenshipPlans.interestedInCitizenship"))
    update_data(
        "individual.residencyIntentions.citizenshipPlans.interestedInCitizenship",
        interested_in_citizenship)
    return interested_in_citizenship

def maximum_minimum_stay():
    st.markdown("#### Important: minimum stay requirement")
    with st.expander("Learn about minimum stay requirements for residency applications."):
        st.write("""
        Some countries require applicants to be physically present in the country for a minimum number of months each year, 
        especially during the initial years of residency. Please consider how much time you intend to spend outside the country. 
        This is typically relaxed as you stay more years. I will let you know in the results whether this is OK, and use this 
        information to potentially recommend you other locations.
        """)

    max_months = st.slider(
        "Maximum months per year I am willing to reside in the target country in my first year.",
        min_value=0,
        max_value=12,
        value=get_data("individual.residencyIntentions.residencyPlans.maxMonthsWillingToReside"),
        help="Select the maximum number of months you're willing to stay in the country each year."
    )
    update_data("individual.residencyIntentions.residencyPlans.maxMonthsWillingToReside", max_months)

    if max_months == 0:
        st.caption("Looks like you don't want to be there at all.. are you at least open to visit from time to time?")
        open_to_visiting = st.checkbox(
            "Yes, fine, whatever.",
            help="Some countries are OK with you showing up from time to time.",
            value=get_data("individual.residencyIntentions.residencyPlans.openToVisiting")
        )
        update_data("individual.residencyIntentions.residencyPlans.openToVisiting", open_to_visiting)
    if max_months <= 6:
        st.caption("Be mindful of Center of Life arguments from other countries. [See the section on Center of Life below](#important-center-of-life-todo-try-to-determine-this-with-questions).")

def citizenship_by_family():
    with st.expander("Family"):
        st.markdown("##### Citizenship by family ties")
        open_to_family = st.checkbox(
            "I have family ties to this country",
            help="Check if you have family connections that might help with citizenship",
            value=get_data("individual.residencyIntentions.citizenshipPlans.familyTies.hasConnections")
        )
        update_data("individual.residencyIntentions.citizenshipPlans.familyTies.hasConnections", open_to_family)
        
        if open_to_family:
            family_relation = st.text_input(
                "Describe your closest family relation in the country.",
                help="Select your closest family relation in the country",
                value=get_data("individual.residencyIntentions.citizenshipPlans.familyTies.closestRelation", "")
            )
            update_data("individual.residencyIntentions.citizenshipPlans.familyTies.closestRelation", family_relation)

def citizenship_by_military_service():
    with st.expander("Military Service"):
        st.markdown("##### Citizenship through military service")
        open_to_military = st.checkbox(
            "I am open to military service",
            help="Check if you are willing to serve in the military for citizenship",
            value=get_data("individual.residencyIntentions.citizenshipPlans.militaryService.willing")
        )
        update_data("individual.residencyIntentions.citizenshipPlans.militaryService.willing", open_to_military)
        
        if open_to_military:
            service_duration = st.number_input(
                "Maximum years of service",
                min_value=1,
                max_value=10,
                value=get_data("individual.residencyIntentions.citizenshipPlans.militaryService.maxServiceYears"),
                help="Enter the maximum number of years you're willing to serve"
            )
            update_data("individual.residencyIntentions.citizenshipPlans.militaryService.maxServiceYears", service_duration)

def citizenship_by_investment():
    with st.expander("Investment"):
        st.markdown("##### Citizenship by investment")
        open_to_investment = st.checkbox(
            "I am open to investment",
            help="Check if you are open to making investments for citizenship",
            value=get_data("individual.residencyIntentions.citizenshipPlans.investment.willing")
        )
        update_data("individual.residencyIntentions.citizenshipPlans.investment.willing", open_to_investment)
        
        if open_to_investment:
            col41, col42, = st.columns(2)
            with col41:
                investment_amount = st.number_input(
                    "Investment Amount",
                    min_value=0,
                    value=get_data("individual.residencyIntentions.citizenshipPlans.investment.amount"),
                    help="Enter the amount you are willing to invest"
                )
                update_data("individual.residencyIntentions.citizenshipPlans.investment.amount", investment_amount)
            with col42:
                usd_index = st.session_state.currencies.index("USD") if "USD" in st.session_state.currencies else 0
                investment_currency = st.selectbox(
                    "Currency",
                    st.session_state.currencies,
                    index=st.session_state.currencies.index(get_data("individual.residencyIntentions.citizenshipPlans.investment.currency")) if get_data("individual.residencyIntentions.citizenshipPlans.investment.currency") else "USD",
                    help="Select the currency for your investment"
                )
                update_data("individual.residencyIntentions.citizenshipPlans.investment.currency", investment_currency)

def citizenship_by_donation():
    with st.expander("Donation"):
        st.markdown("##### Citizenship by donation")
        open_to_donation = st.checkbox(
            "I am open to donate",
            help="Check if you are open to making donations for citizenship",
            value=get_data("individual.residencyIntentions.citizenshipPlans.donation.willing")
        )
        update_data("individual.residencyIntentions.citizenshipPlans.donation.willing", open_to_donation)
        
        if open_to_donation:
            col51, col52, = st.columns(2)
            with col51:
                donation_amount = st.number_input(
                    "Donation amount",
                    min_value=0,
                    value=get_data("individual.residencyIntentions.citizenshipPlans.donation.amount", 0),
                    help="Enter the amount you are willing to donate"
                )
                update_data("individual.residencyIntentions.citizenshipPlans.donation.amount", donation_amount)
            with col52:
                usd_index = st.session_state.currencies.index("USD") if "USD" in st.session_state.currencies else 0
                donation_currency = st.selectbox(
                    "Currency",
                    st.session_state.currencies,
                    index=st.session_state.currencies.index(get_data("individual.residencyIntentions.citizenshipPlans.donation.currency")) if get_data("individual.residencyIntentions.citizenshipPlans.donation.currency") in st.session_state.currencies else usd_index,
                    help="Select the currency for your donation"
                )
                update_data("individual.residencyIntentions.citizenshipPlans.donation.currency", donation_currency)

def residency_intentions():
    st.header("Residency Intentions", anchor="Residency Intentions")
    if not st.toggle("Show section", value=True, key="show_residency_intentions"):
        st.info("Section is hidden. Toggle to show. Your previously entered data is preserved.")
    else:
        st.write("Provide details about your intended relocation.")
        with st.container():
            cols = st.columns([1,.8,.5])
            with cols[0]:
                destination = get_data("individual.residencyIntentions.destinationCountry.country")
                if destination:         
                    with cols[0]:
                        move_type = select_move_type()
                    with cols[0]:
                        if move_type == "Temporary":
                            duration_of_stay()

        with st.container(): 
            st.markdown("\n")
            if destination:    
                if citizen_status(destination) == "No":
                    apply_for_residency = residency(destination)
                    interested_in_citizenship = citizenship(destination)
                
                    nota_bene = "N.B. For most countries, being a resident (and taxpayer) for some number of years is a way to obtain citizenship. I will inform you whether this is so for "
                    if destination:
                        st.caption(f"{nota_bene}{destination}.")

                    if apply_for_residency:
                        maximum_minimum_stay()

                    if interested_in_citizenship:
                        st.markdown("#### Citizenship Options")
                        
                        col_family, col_military = st.columns(2)
                        
                        with col_family:
                            citizenship_by_family()

                        with col_military:
                            citizenship_by_military_service()

                        col_investment, col_donation = st.columns(2)

                        with col_investment:
                            citizenship_by_investment()

                        with col_donation:
                            citizenship_by_donation()
                    
        center_of_life()

        if st.button("Show current Residency Intentions state"):
            residency_intentions_state = get_data("individual.residencyIntentions")
            st.json(json.dumps(residency_intentions_state, indent=2))

    filled = filled_in_correctly(residency_intentions)
    st.divider()
    return filled
