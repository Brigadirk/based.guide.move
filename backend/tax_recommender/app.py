import streamlit as st

import json

# Function to recommend countries based on user input (placeholder - replace with actual logic)
def get_country_recommendations(user_data_json):
    user_data = json.loads(user_data_json)
    # Placeholder logic - for demonstration, just return a fixed list or an error based on input
    if user_data['personal']['citizenship']['primary'] == "Problem": # Example error condition
        return "Error: Could not process request due to citizenship issues."
    else:
        recommendations = ["Portugal", "Estonia", "Georgia"] # Example recommendations
        return recommendations

# Streamlit app
def main():
    st.title("Tax Optimization Home Base Recommender for Digital Nomads")
    st.markdown("This app helps digital nomads find the best country to use as a home base for tax optimization.")

    st.header("Personal Profile")
    primary_citizenship = st.text_input("Primary Citizenship", "USA", key="primary_citizenship")
    dual_citizenship = st.checkbox("Dual Citizenship", key="dual_citizenship")
    current_residency = st.text_input("Current Residency (if any)", "USA", key="current_residency")

    st.header("Income Details")
    income_sources = []
    with st.expander("Add Income Source"):
        income_type = st.selectbox("Income Type", ["Employment", "Freelance/Contract", "Investment", "Business"], key="income_type")
        income_location = st.text_input("Source Country", "USA", key="income_location")
        income_amount_usd = st.number_input("Annual Amount (USD)", value=50000, key="income_amount_usd")
        income_taxable = st.checkbox("Taxable in Source Country?", value=True, key="income_taxable")
        income_sources.append({
            "type": income_type,
            "location": income_location,
            "amount_usd": income_amount_usd,
            "taxable_source_country": income_taxable
        })
    # Consider allowing multiple income sources to be added dynamically.
    # For simplicity, we are using a single expander for now but could be improved.

    st.header("Assets & Investments")
    assets = []
    with st.expander("Add Asset/Investment Type"):
        asset_type = st.selectbox("Asset Type", ["Stocks/Bonds", "Real Estate", "Cryptocurrency", "Business Interests", "Other"], key="asset_type")
        asset_location = st.text_input("Asset Location", "USA", key="asset_location")
        asset_value_usd = st.number_input("Current Value (USD)", value=10000, key="asset_value_usd")
        holding_period = st.selectbox("Holding Period", ["<1 Year", "1-5 Years", ">5 Years"], key="asset_holding_period")
        assets.append({
            "type": asset_type,
            "location": asset_location,
            "value_usd": asset_value_usd,
            "holding_period": holding_period
        })
    # Similar to income, asset input could be enhanced for multiple entries.

    st.header("Tax Optimization Goals")
    primary_tax_goal = st.selectbox("Primary Tax Goal", ["Minimize Income Tax", "Minimize Capital Gains Tax", "Minimize Overall Tax Burden", "Simplicity & Compliance"], key="primary_tax_goal")
    tax_residency_preference = st.selectbox("Tax Residency Preference", ["Location with Territorial Tax", "Location with Low/No Income Tax", "Location with Favorable Tax Treaties"], key="tax_residency_preference")
    minimum_stay_flexibility = st.selectbox("Minimum Stay Flexibility (Days per year)", ["No Preference", "Flexible (< 90 days)", "More Flexible (< 180 days)"], key="minimum_stay_flexibility")

    st.header("Lifestyle & Practical Preferences")
    preferred_regions = st.text_input("Preferred Geographic Regions (e.g., Europe, Asia, Latin America, leave blank for any)", "", key="preferred_regions")
    visa_requirements_concern = st.selectbox("Visa Requirements a Major Concern?", ["No", "Yes, for Easy Visa Process", "Yes, for Long-Term Visa Options"], key="visa_requirements_concern")
    digital_nomad_visa_interest = st.checkbox("Interested in Digital Nomad Visas?", key="digital_nomad_visa_interest")
    cost_of_living_importance = st.selectbox("Importance of Low Cost of Living", ["Not Important", "Nice to Have", "Very Important"], key="cost_of_living_importance")

    st.header("Additional Considerations")
    family_members_visas = st.checkbox("Need Visa Options for Family Members?", key="family_members_visas")
    healthcare_importance = st.selectbox("Importance of Good Healthcare System", ["Not Important", "Nice to Have", "Very Important"], key="healthcare_importance")
    language_barrier_concern = st.selectbox("Language Barrier Concern", ["No Concern", "Minor Concern", "Major Concern"], key="language_barrier_concern")


    # Compile User Data into Optimized JSON
    user_data_optimized = {
        "personal": {
            "citizenship": {
                "primary": primary_citizenship,
                "dual": dual_citizenship
            },
            "residency": current_residency # Simplified - current residency is key for home base context
        },
        "income": income_sources, # Already a list, keeping as is
        "assets": assets, # Already a list, keeping as is
        "tax_goals": {
            "primary_goal": primary_tax_goal,
            "residency_preference": tax_residency_preference,
            "stay_flexibility": minimum_stay_flexibility
        },
        "preferences": {
            "regions": preferred_regions.split(",") if preferred_regions else [],
            "visa_concern": visa_requirements_concern,
            "digital_nomad_visa": digital_nomad_visa_interest,
            "cost_of_living": cost_of_living_importance,
            "family_visa_needs": family_members_visas,
            "healthcare_quality": healthcare_importance,
            "language_barrier": language_barrier_concern
        },
        # Removed less critical/redundant fields for digital nomad home base focus.
        # Could add more sections if needed in future (e.g., "legal_structure" for business owners).
    }

    st.subheader("Your Input Data (Optimized JSON)")
    st.json(user_data_optimized)

    # Recommend Countries based on Optimized Data
    if st.button("Recommend Countries", key="recommend_button"):
        recommendations = get_country_recommendations(json.dumps(user_data_optimized))
        if isinstance(recommendations, list):
            st.subheader("Recommended Countries")
            for country in recommendations:
                st.write(country)
        else:
            st.error(recommendations) # Display error message if get_country_recommendations returns an error string


if __name__ == "__main__":
    main()