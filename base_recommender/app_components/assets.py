import streamlit as st
from app_components.helpers import get_data, update_data, get_country_list
from datetime import datetime
import json

def assets():
    st.header("Asset Portfolio", anchor="assets")
    
    asset_tabs = st.tabs(["Real Estate", "Securities", "Cryptocurrency", "Business Assets"])
    
    # Real Estate Tab
    with asset_tabs[0]:
        real_estate = get_data("individual.financialInformation.assets.realEstate", [])
        
        with st.expander("Add Real Estate Property"):
            with st.form("real_estate_form"):
                col1, col2 = st.columns(2)
                
                with col1:
                    prop_name = st.text_input("Property Name")
                    prop_country = st.selectbox("Country", options=get_country_list())
                    purchase_date = st.date_input("Purchase Date", max_value=datetime.today())
                
                with col2:
                    purchase_price = st.number_input("Purchase Price", min_value=0, step=1000)
                    current_value = st.number_input("Current Market Value", min_value=0, step=1000)
                    generates_income = st.checkbox("Generates Rental Income")
                
                if st.form_submit_button("Add Property"):
                    real_estate.append({
                        "name": prop_name,
                        "country": prop_country,
                        "purchaseDate": purchase_date.strftime("%Y-%m-%d"),
                        "purchasePrice": purchase_price,
                        "currentValue": current_value,
                        "rentalIncome": generates_income
                    })
                    update_data("individual.financialInformation.assets.realEstate", real_estate)
        
        # Display existing properties
        for i, prop in enumerate(real_estate):
            with st.expander(f"{prop['name']} ({prop['country']})"):
                st.write(f"**Purchase Date:** {prop['purchaseDate']}")
                st.write(f"**Purchase Price:** ${prop['purchasePrice']:,}")
                st.write(f"**Current Value:** ${prop['currentValue']:,}")
                st.write(f"**Rental Income:** {'Yes' if prop['rentalIncome'] else 'No'}")
    
    # Securities Tab
    with asset_tabs[1]:
        securities = get_data("individual.financialInformation.assets.securities", [])
        
        with st.expander("Add Security Holding"):
            with st.form("securities_form"):
                col1, col2 = st.columns(2)
                
                with col1:
                    security_type = st.selectbox("Asset Type", ["Stocks", "Bonds", "ETFs", "Mutual Funds"])
                    purchase_date = st.date_input("Purchase Date")
                    quantity = st.number_input("Shares/Units", min_value=0)
                
                with col2:
                    cost_basis = st.number_input("Cost Basis per Unit", min_value=0.0)
                    dividend_history = st.checkbox("Pays Regular Dividends")
                    frequency = st.selectbox("Dividend Frequency", ["Monthly", "Quarterly", "Annually"]) if dividend_history else None
                
                if st.form_submit_button("Add Holding"):
                    securities.append({
                        "type": security_type,
                        "purchaseDate": purchase_date.strftime("%Y-%m-%d"),
                        "quantity": quantity,
                        "costBasis": cost_basis,
                        "dividends": {
                            "paysDividends": dividend_history,
                            "frequency": frequency
                        } if dividend_history else None
                    })
                    update_data("individual.financialInformation.assets.securities", securities)
        
        # Display securities
        for i, security in enumerate(securities):
            with st.expander(f"{security['type']} Holding"):
                st.write(f"**Purchase Date:** {security['purchaseDate']}")
                st.write(f"**Quantity:** {security['quantity']}")
                st.write(f"**Cost Basis:** ${security['costBasis']:,.2f}/unit")
                if security.get('dividends'):
                    st.write(f"**Dividends:** {security['dividends']['frequency']}")

    # Cryptocurrency Tab
    with asset_tabs[2]:
        crypto = get_data("individual.financialInformation.assets.crypto", [])
        
        with st.expander("Add Cryptocurrency"):
            with st.form("crypto_form"):
                col1, col2 = st.columns(2)
                
                with col1:
                    coin = st.selectbox("Coin Type", ["Bitcoin", "Ethereum", "Other Altcoin"])
                    purchase_date = st.date_input("Acquisition Date")
                
                with col2:
                    quantity = st.number_input("Quantity", min_value=0.0)
                    staking_rewards = st.checkbox("Earns Staking Rewards")
                
                if st.form_submit_button("Add Holding"):
                    crypto.append({
                        "coin": coin,
                        "purchaseDate": purchase_date.strftime("%Y-%m-%d"),
                        "quantity": quantity,
                        "stakingRewards": staking_rewards
                    })
                    update_data("individual.financialInformation.assets.crypto", crypto)
        
        # Display crypto
        for i, holding in enumerate(crypto):
            with st.expander(f"{holding['coin']} Holdings"):
                st.write(f"**Acquisition Date:** {holding['purchaseDate']}")
                st.write(f"**Quantity:** {holding['quantity']}")
                st.write(f"**Staking Rewards:** {'Yes' if holding['stakingRewards'] else 'No'}")

    # Business Assets Tab
    with asset_tabs[3]:
        businesses = get_data("individual.financialInformation.assets.businesses", [])
        
        with st.expander("Add Business Asset"):
            with st.form("business_form"):
                col1, col2 = st.columns(2)
                
                with col1:
                    business_name = st.text_input("Business Name")
                    incorporation_date = st.date_input("Incorporation Date")
                
                with col2:
                    business_value = st.number_input("Valuation", min_value=0)
                    distributes_profits = st.checkbox("Distributes Profits")
                
                if st.form_submit_button("Add Business"):
                    businesses.append({
                        "name": business_name,
                        "incorporationDate": incorporation_date.strftime("%Y-%m-%d"),
                        "valuation": business_value,
                        "profitDistribution": distributes_profits
                    })
                    update_data("individual.financialInformation.assets.businesses", businesses)
        
        # Display businesses
        for i, business in enumerate(businesses):
            with st.expander(f"{business['name']}"):
                st.write(f"**Incorporation Date:** {business['incorporationDate']}")
                st.write(f"**Valuation:** ${business['valuation']:,}")
                st.write(f"**Profit Distributions:** {'Yes' if business['profitDistribution'] else 'No'}")

    # Total Net Worth Summary
    with st.expander("Total Asset Summary"):
        total_assets = sum(
            prop["currentValue"] for prop in 
            get_data("individual.financialInformation.assets.realEstate", [])
        ) + sum(
            security["quantity"] * security["costBasis"] 
            for security in get_data("individual.financialInformation.assets.securities", [])
        ) + sum(
            business["valuation"] 
            for business in get_data("individual.financialInformation.assets.businesses", [])
        )
        st.metric("Estimated Total Asset Value", f"${total_assets:,.2f}")
