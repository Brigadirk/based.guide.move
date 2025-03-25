import streamlit as st
from app_components.helpers import get_data, update_data

# Simplified version of the Assets section focusing on capital gains capture
def assets():
    if st.session_state.current_step == 3:
        # st.header("Assets")
        
        asset_tabs = st.tabs(["Real Estate", "Investments", "Cryptocurrency", "Retirement"])
        
        # Real Estate Assets Tab
        with asset_tabs[0]:
            st.subheader("Real Estate Properties")
            
            real_estate = get_data("individual.financialInformation.assets.realEstate", [])
            
            with st.expander("Add Real Estate Property", expanded=True):
                with st.form("add_real_estate"):
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        re_location = st.text_input("Property Location (City, Country)", 
                                                help="Where the property is located determines property tax jurisdiction")
                        re_value = st.number_input("Current Market Value", min_value=0, step=1000,
                                                help="Current market value for wealth tax calculations")
                        re_currency = st.text_input("Currency", help="Currency code (USD, EUR, etc.)")
                    
                    with col2:
                        re_acquisition_date = st.date_input("Acquisition Date", max_value=datetime.today(),
                                                        help="When you purchased the property - affects holding period")
                        re_acquisition_price = st.number_input("Original Purchase Price", min_value=0, step=1000,
                                                            help="What you paid for the property - basis for capital gain")
                        re_intend_to_sell = st.checkbox("I plan to sell this property",
                                                    help="Capital gains tax applies when you sell property")
                    
                    # Only show sale details if they plan to sell
                    if re_intend_to_sell:
                        st.subheader("Sale Details")
                        col3, col4 = st.columns(2)
                        
                        with col3:
                            re_expected_price = st.number_input("Expected Sale Price", min_value=0, step=1000,
                                                            help="Projected selling price determines capital gain amount")
                            re_sell_before_moving = st.checkbox("Sell before moving abroad",
                                                            help="Critical for determining which country taxes the gain")
                        
                        with col4:
                            re_expected_date = st.date_input("Expected Sale Date", min_value=datetime.today(),
                                                        help="Timing of sale affects which country has taxation rights")
                            re_pct_long_term = st.slider("Percentage as Long-Term Holding", 0, 100, 100,
                                                    help="Long-term holdings often qualify for lower tax rates")
                            re_pct_short_term = 100 - re_pct_long_term
                    
                    submit_re = st.form_submit_button("Add Property")
                    
                    if submit_re and re_location and re_value > 0 and re_currency:
                        property_data = {
                            "location": re_location,
                            "value": re_value,
                            "currency": re_currency,
                            "acquisitionDate": re_acquisition_date.strftime("%Y-%m-%d"),
                            "acquisitionPrice": re_acquisition_price,
                            "intendToSell": re_intend_to_sell
                        }
                        
                        if re_intend_to_sell:
                            property_data["plannedSaleDetails"] = {
                                "expectedSalePrice": re_expected_price,
                                "expectedSaleDate": re_expected_date.strftime("%Y-%m-%d"),
                                "sellBeforeMoving": re_sell_before_moving,
                                "holdingPeriodBreakdown": {
                                    "percentageLongTerm": re_pct_long_term,
                                    "percentageShortTerm": re_pct_short_term
                                }
                            }
                        
                        real_estate.append(property_data)
                        update_data("individual.financialInformation.assets.realEstate", real_estate)
            
            # Display existing properties
            if real_estate:
                st.write("Your Properties:")
                for i, prop in enumerate(real_estate):
                    with st.expander(f"Property in {prop['location']} - {prop['currency']} {prop['value']:,}"):
                        col1, col2 = st.columns(2)
                        
                        with col1:
                            st.write(f"**Location:** {prop['location']}")
                            st.write(f"**Current Value:** {prop['currency']} {prop['value']:,}")
                            st.write(f"**Purchase Date:** {prop['acquisitionDate']}")
                            st.write(f"**Purchase Price:** {prop['currency']} {prop['acquisitionPrice']:,}")
                        
                        with col2:
                            if prop['intendToSell']:
                                sale = prop['plannedSaleDetails']
                                st.write("**Sale Plans:**")
                                st.write(f"Expected Price: {prop['currency']} {sale['expectedSalePrice']:,}")
                                st.write(f"Expected Date: {sale['expectedSaleDate']}")
                                st.write(f"Sell before moving: {'Yes' if sale['sellBeforeMoving'] else 'No'}")
                                st.write(f"Long-term holding: {sale['holdingPeriodBreakdown']['percentageLongTerm']}%")
                                st.write(f"Short-term holding: {sale['holdingPeriodBreakdown']['percentageShortTerm']}%")
                                
                                # Calculate and display capital gain
                                gain = sale['expectedSalePrice'] - prop['acquisitionPrice']
                                st.metric("Potential Capital Gain", f"{prop['currency']} {gain:,}")
                        
                        if st.button("Remove Property", key=f"remove_re_{i}"):
                            real_estate.pop(i)
                            update_data("individual.financialInformation.assets.realEstate", real_estate)
