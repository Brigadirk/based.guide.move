from app_components.helpers import (
    get_data, get_country_list, update_data, 
    get_country_regions)
import streamlit as st

def select_destination_country(anchor):
    """
    Destination Country Selection Section with distinctive styling
    """
    # ======================= SECTION HEADER =======================
    st.header(f"🌎 {anchor}", anchor=anchor, divider="rainbow")
        
    # -------------------- VISIBILITY TOGGLE --------------------
    if not st.toggle(f"📋 Show {anchor}", value=True, key=f"show_{anchor}"):
        st.info(f"🔍 {anchor} section is hidden. Toggle to show. Your previously entered data is preserved.")
        return
    
    # -------------------- SECTION IMPORTANCE --------------------
    with st.expander("💡 Why is this section important?"):
        st.warning("""
        **Selecting your destination country is essential to**
        - Determine applicable tax treaties and regulations
        - Identify visa and immigration requirements
        - Calculate cost of living adjustments
        - Plan for regional healthcare and insurance needs
        - Understand local banking and financial systems
        - Prepare for cultural and lifestyle adjustments
        """)

    # ======================= COUNTRY SELECTION =======================
    st.subheader("🗺️ Destination Selection")
    st.caption("Select the country and region you plan to relocate to")
    
    # COUNTRY SELECTION WITH DATA BINDING
    destination = st.selectbox(
        "Destination country",
        help="Enter the country you plan to relocate to.",
        options=[""] + get_country_list(),
        index=(
            get_country_list().index(
                get_data(
                    "individual.residencyIntentions.destinationCountry.country")) + 1) \
                        if get_data("individual.residencyIntentions.destinationCountry.country") \
                            in get_country_list() \
                                else 0)
    update_data("individual.residencyIntentions.destinationCountry.country", 
            destination)
    
    # CONDITIONAL DISPLAY OF REGION SELECTION
    if destination:
        # REGION SELECTION WITH DATA BINDING
        destination_region = st.selectbox(
            f"Destination region of {destination}",
            help="Enter which region you are interested in.",
            options=get_country_regions(destination),
            index=(
                get_country_list().index(
                    get_data(
                        "individual.residencyIntentions.destinationCountry.region")) + 1) \
                            if get_data("individual.residencyIntentions.destinationCountry.region") \
                                in get_country_list() \
                                    else 0)
        update_data("individual.residencyIntentions.destinationCountry.region", 
                destination_region)
    
        
    
    
