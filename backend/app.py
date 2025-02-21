import streamlit as st

# Function to recommend countries based on user input
def recommend_countries(user_data):
    # Placeholder logic for country recommendations
    recommendations = ["Portugal", "Estonia", "Georgia", "Malaysia", "Costa Rica"]
    return recommendations

# Streamlit app
def main():
    st.title("Tax Optimization Country Recommender")

    # User Citizenship
    st.header("Citizenship")
    primary_citizenship = st.text_input("Primary Citizenship", "Netherlands", key="primary_citizenship")
    dual_citizenship = st.checkbox("Dual Citizenship", key="dual_citizenship")
    renunciation_plans = st.checkbox("Plans to Renounce Citizenship", key="renunciation_plans")

    # Residency Status
    st.header("Residency Status")
    current_residency = st.text_input("Current Residency", "US", key="current_residency")
    previous_residencies = st.text_input("Previous Residencies (comma separated)", "", key="previous_residencies")
    tie_breaker_rules = st.text_input("Tie-Breaker Rules", "US", key="tie_breaker_rules")

    # Income Sources
    st.header("Income Sources")
    income_sources = []
    with st.expander("Add Income Source"):
        type = st.selectbox("Type", ["salary", "investments", "rental_income"], key="income_type")
        location = st.text_input("Location", key="income_location")
        amount = st.number_input("Amount", value=0, key="income_amount")
        taxable = st.checkbox("Taxable", value=True, key="income_taxable")
        if type == "salary":
            feie_eligible = st.checkbox("FEIE Eligible", value=False, key="feie_eligible")
        else:
            feie_eligible = False
        income_sources.append({
            "type": type,
            "location": location,
            "amount": amount,
            "taxable": taxable,
            "feie_eligible": feie_eligible
        })

    # Assets
    st.header("Assets")
    assets = []
    with st.expander("Add Asset"):
        type = st.selectbox("Type", ["stocks", "property", "cryptocurrency"], key="asset_type")
        location = st.text_input("Location", key="asset_location")
        value = st.number_input("Value", value=0, key="asset_value")
        holding_period = st.selectbox("Holding Period", ["<1 year", ">1 year", ">5 years"], key="asset_holding_period")
        liquidity = st.selectbox("Liquidity", ["high", "low"], key="asset_liquidity")
        reporting_requirements = st.multiselect("Reporting Requirements", ["FBAR", "FATCA"], key="asset_reporting_requirements")
        assets.append({
            "type": type,
            "location": location,
            "value": value,
            "holding_period": holding_period,
            "liquidity": liquidity,
            "reporting_requirements": reporting_requirements
        })

    # Tax Goals
    st.header("Tax Goals")
    primary_objective = st.selectbox("Primary Objective", ["tax_optimization", "wealth_preservation"], key="primary_objective")
    risk_tolerance = st.selectbox("Risk Tolerance", ["low", "moderate", "high"], key="risk_tolerance")
    time_horizon = st.selectbox("Time Horizon", ["short_term", "medium_term", "long_term"], key="time_horizon")

    # Geographic Preferences
    st.header("Geographic Preferences")
    preferred_countries = st.text_input("Preferred Countries (comma separated)", "any", key="preferred_countries")
    maximum_minimum_stay = st.selectbox("Maximum Minimum Stay", ["any", "30 days", "90 days", "180 days"], key="maximum_minimum_stay")

    # Digital Nomad Flag
    digital_nomad = st.checkbox("I plan to use this as a digital nomad base", key="digital_nomad")

    # Bringing Another Person
    st.header("Bringing Another Person")
    bring_another_person = st.checkbox("I want to bring another person", key="bring_another_person")
    if bring_another_person:
        st.subheader("Other Person's Characteristics")
        other_citizenship = st.text_input("Other Person's Citizenship", "Colombia", key="other_citizenship")
        other_income_sources = st.text_input("Other Person's Income Sources (comma separated)", "", key="other_income_sources")
        other_assets = st.text_input("Other Person's Assets (comma separated)", "", key="other_assets")

    # Additional Context
    st.header("Additional Context")
    retirement_accounts = st.multiselect("Retirement Accounts", ["401(k)", "IRA", "Other"], key="retirement_accounts")
    retirement_visa_options = st.text_input("Retirement Visa Options (comma separated)", "", key="retirement_visa_options")
    spousal_income = st.number_input("Spousal Income", value=0, key="spousal_income")
    childcare_costs = st.number_input("Childcare Costs", value=0, key="childcare_costs")

    # Compile User Data
    user_data = {
        "user": {
            "citizenship": {
                "primary": primary_citizenship,
                "dual_citizenship": dual_citizenship,
                "renunciation_plans": renunciation_plans
            },
            "residency_status": {
                "current": current_residency,
                "previous": previous_residencies.split(",") if previous_residencies else [],
                "tie_breaker_rules": tie_breaker_rules
            },
            "income_sources": income_sources,
            "assets": assets,
            "tax_goals": {
                "primary_objective": primary_objective,
                "risk_tolerance": risk_tolerance,
                "time_horizon": time_horizon
            },
            "geographic_preferences": {
                "preferred_countries": preferred_countries.split(",") if preferred_countries else [],
                "maximum_minimum_stay": maximum_minimum_stay
            },
            "additional_context": {
                "retirement_planning": {
                    "retirement_accounts": retirement_accounts,
                    "retirement_visa_options": retirement_visa_options.split(",") if retirement_visa_options else []
                },
                "family_considerations": {
                    "spousal_income": spousal_income,
                    "childcare_costs": childcare_costs
                }
            }
        }
    }

    if digital_nomad:
        user_data["user"]["geographic_preferences"]["digital_nomad"] = True

    if bring_another_person:
        user_data["user"]["additional_context"]["other_person"] = {
            "citizenship": other_citizenship,
            "income_sources": other_income_sources.split(",") if other_income_sources else [],
            "assets": other_assets.split(",") if other_assets else []
        }

    # Display User Data
    st.subheader("Your Input Data")
    st.json(user_data)

    # Recommend Countries
    if st.button("Recommend Countries", key="recommend_button"):
        recommendations = recommend_countries(user_data)
        st.subheader("Recommended Countries")
        for country in recommendations:
            st.write(country)

if __name__ == "__main__":
    main()