from app_components.helpers import (
    get_data, get_country_list, update_data, 
    get_country_regions,
    format_country_name,
)
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
    
    # ======================= COUNTRY SELECTION =======================
    st.subheader("🗺️ Destination Country")
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
    
    # -------------------- REGION (only if relevant) --------------------
    if destination:
        regions = get_country_regions(destination)

        if regions:
            # REGION SELECTION WITH DATA BINDING
            st.subheader("📍 Region")

            with st.expander("💡 Why is the region selection important?"):
                st.warning(
                    "**Selecting your specific region within a country is crucial because**\n"
                    "- Visa quotas, processing times and special programs can be region-specific\n"
                    "- Tax rates, incentives or reporting rules sometimes differ by region\n"
                    "- Labour-market shortage lists and investment zones are often regional"
                )

            prev_region = get_data("individual.residencyIntentions.destinationCountry.region") or regions[0]
            idx = regions.index(prev_region) if prev_region in regions else 0

            destination_region = st.selectbox(
                f"Desired region of {format_country_name(destination)}",
                options=regions,
                index=idx,
                help="Choose a province/state/region if relevant, or 'I don't know yet'.",
            )
            update_data("individual.residencyIntentions.destinationCountry.region", destination_region)
        else:
            # No region-level distinctions → clear any saved region and inform the user
            update_data("individual.residencyIntentions.destinationCountry.region", "")
            st.info("✅ No region-specific visa or tax rules—skip region selection for this country.")
    
        
    
    
