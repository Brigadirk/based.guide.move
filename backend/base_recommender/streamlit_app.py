import streamlit as st
import datetime
import json
from countries import ALL_COUNTRIES
from PIL import Image
from prompt_filter import create_quick_prompt #, create_comprehensive_prompt
import recommender
from pathlib import Path

# Path to the country_info JSON file
country_info_path = Path("./backend/base_recommender/country_info/country_info.json")

# Load ALL_COUNTRIES_AND_CURRENCIES from the JSON file
if country_info_path.exists():
    with open(country_info_path, "r") as f:
        ALL_COUNTRIES_AND_CURRENCIES = json.load(f)
else:
    raise FileNotFoundError(f"{country_info_path} does not exist.")

# Generate ALL_COUNTRIES by filtering the dictionary
ALL_COUNTRIES = [
    key for key, value in ALL_COUNTRIES_AND_CURRENCIES.items()
    if value.get("embedding_name") != "not-included"
]
def return_base_analysis(data, atype):
    if atype == "quick_and_dirty":
        prompt = create_quick_prompt(data)
    elif atype == "comprehensive":
        query, country1, country2 = create_comprehensive_prompt(data)
    response = recommender.main(query=prompt[0], country1=prompt[1], country2=prompt[2])
    return response

# Function to save data to a JSON file
def save_to_json(data, type):
    if type == "quick_and_dirty":
        filename = f".backend/base_recommender/temp_profiles/quick_and_dirty/{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.json"
    else:
        filename = f".backend/base_recommender/temp_profiles/comprehensive/{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.json"
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)
    st.success(f"Data saved to {filename} as {filename}!")

def quick_and_dirty_analysis():
    st.subheader("Quick and Dirty Analysis")
    st.write("Provide the following information for a quick analysis:")

    desired_country = st.selectbox(
        "Desired country", ALL_COUNTRIES, key="desired_country")
    main_nationality = st.selectbox(
        "Main nationality", ALL_COUNTRIES, key="quick_nationality")
    income_type = st.selectbox(
        "Income type", ["Self-Employed", "Employer"], key="quick_income_type")
    income_amount = st.number_input(
        "Annual income in USD", min_value=0, key="quick_income_amount")
    holdings_amount = st.number_input(
        "Total holdings in USD", min_value=0, key="quick_holdings_amount")
    expected_sale_amount = st.number_input(
        "Expected net capital gains sale (USD above cost basis)",
        min_value=0, key="quick_expected_sale_amount")

    if st.button("Submit Quick Analysis"):
        data = {
            "quickAnalysis": {
                "desiredCountry": desired_country,
                "mainNationality": main_nationality,
                "incomeType": income_type,
                "incomeAmount": income_amount,
                "holdingsAmount": holdings_amount,
                "expectedSaleAmount": expected_sale_amount
            }
        }

        # Get the result from return_base_analysis
        result = return_base_analysis(data, "quick_and_dirty")
        
        # Display the result
        if result and "result" in result:
            st.subheader("Analysis Result")
            st.write(result["result"])  # Display the result directly
        else:
            st.warning("No result returned from the analysis.")
        
        st.success("Saved and returned")


def collect_personal_info(prefix=""):
    st.divider()
    st.subheader(f"{prefix} Personal Information")
    st.divider()

    # Set a reasonable date range (e.g., 100 years in the past and 10 years in the future)
    min_date = datetime.date.today() - datetime.timedelta(days=365 * 100)  # 100 years ago
    max_date = datetime.date.today()

    date_of_birth = st.date_input(
        f"{prefix} Date of birth", 
        key=f"{prefix}_dob",
        min_value=min_date,  # Allow dates up to 100 years in the past
        max_value=max_date   # Allow dates up to 10 years in the future
    )
    st.caption("Your age may influence whether you are eligible for certain special programs.")
    st.divider()

    # List to store selected nationalities
    nationalities = []

    # Loop to keep adding nationalities
    add_nationality = True
    while add_nationality:
        # Dynamically update the list of available countries
        available_countries = [country for country in ALL_COUNTRIES if country not in nationalities]

        if not available_countries:
            st.warning("No more countries available to select.")
            break

        selected_country = st.selectbox(
            f"{prefix} Nationality", 
            available_countries, 
            key=f"{prefix}_nationality_{len(nationalities)}"
        )

        nationalities.append(selected_country)

        # Ask if the user wants to add another nationality
        add_nationality = st.checkbox(
            f"Do you have another nationality?", 
            key=f"{prefix}_add_another_nationality_{len(nationalities)}"
        )

    st.divider()

    # Collect marital status
    marital_status = st.selectbox(
        f"{prefix} Marital status", 
        ["Single", "Married", "Divorced"], 
        key=f"{prefix}_marital_status"
    )
    st.caption("Whether being married is tax-advantageous or disadvantageous depends on the specific tax laws of your country, your income levels, and whether there is a significant income disparity between spouses.")
    st.divider()

    # Collect current residency information
    current_residency_country = st.selectbox(
        f"{prefix} Current country of residency", 
        available_countries, 
        key=f"{prefix}_residency_{len(nationalities)}"
    )

    # Check if the selected residency country is in the list of citizenships
    if current_residency_country in nationalities:
        # Automatically set residency status to "Citizen"
        current_residency_status = "Citizen"
        st.write(f"Residency status automatically set to **Citizen** because {current_residency_country} is in your list of citizenships.")
    else:
        # Allow the user to select residency status
        current_residency_status = st.selectbox(
            f"{prefix} Residency status", 
            ["Permanent resident", "Temporary resident"], 
            key=f"{prefix}_current_residency_status"
        )
    st.divider()

    return {
        "dateOfBirth": date_of_birth.isoformat(),
        "nationalities": [{"country": country} for country in nationalities],
        "maritalStatus": marital_status,
        "currentResidency": {
            "country": current_residency_country,
            "status": current_residency_status
        }
    }

def collect_income_sources(prefix=""):
    st.write("### Income Sources")
    income_sources = []
    add_income_source = st.checkbox(f"{prefix} Add Income Source", key=f"{prefix}_add_income_source")
    income_source_counter = 0  # Counter to ensure unique keys

    while add_income_source:
        # Select income type
        income_type = st.selectbox(
            f"{prefix} Income Type", 
            [
                "Employment", 
                "Self-Employment", 
                "Gig Economy", 
                "Professional Services", 
                "Royalties", 
                "Pensions and Annuities", 
                "Social Security or Government Benefits", 
                "Other Income"
            ], 
            key=f"{prefix}_income_type_{income_source_counter}"
        )

        # Collect additional details based on income type
        income_details = {}

        if income_type == "Employment":
            income_details["number_of_employers"] = st.number_input(
                f"{prefix} Number of Employers", 
                min_value=1, 
                key=f"{prefix}_num_employers_{income_source_counter}"
            )
            income_details["employment_type"] = st.selectbox(
                f"{prefix} Employment Type", 
                ["Full-Time", "Part-Time", "Temporary"], 
                key=f"{prefix}_employment_type_{income_source_counter}"
            )
            income_details["employer_location"] = st.selectbox(
                f"{prefix} Employer Location", 
                ALL_COUNTRIES, 
                key=f"{prefix}_employer_location_{income_source_counter}"
            )

        elif income_type == "Self-Employment":
            income_details["number_of_clients"] = st.number_input(
                f"{prefix} Number of Clients/Income Sources", 
                min_value=1, 
                key=f"{prefix}_num_clients_{income_source_counter}"
            )
            income_details["business_structure"] = st.selectbox(
                f"{prefix} Business Structure", 
                ["Sole Proprietorship", "LLC", "Partnership", "Corporation"], 
                key=f"{prefix}_business_structure_{income_source_counter}"
            )
            income_details["business_expenses"] = st.number_input(
                f"{prefix} Estimated Annual Business Expenses (optional)", 
                min_value=0, 
                key=f"{prefix}_business_expenses_{income_source_counter}"
            )

        elif income_type == "Gig Economy":
            income_details["platforms_used"] = st.text_input(
                f"{prefix} Platforms Used (e.g., Uber, Fiverr)", 
                key=f"{prefix}_platforms_used_{income_source_counter}"
            )
            income_details["number_of_gigs"] = st.number_input(
                f"{prefix} Number of Gigs/Projects", 
                min_value=1, 
                key=f"{prefix}_num_gigs_{income_source_counter}"
            )

        elif income_type == "Professional Services":
            income_details["service_type"] = st.text_input(
                f"{prefix} Type of Service Provided", 
                key=f"{prefix}_service_type_{income_source_counter}"
            )
            income_details["number_of_clients"] = st.number_input(
                f"{prefix} Number of Clients", 
                min_value=1, 
                key=f"{prefix}_num_clients_{income_source_counter}"
            )

        elif income_type == "Royalties":
            income_details["intellectual_property_type"] = st.text_input(
                f"{prefix} Type of Intellectual Property", 
                key=f"{prefix}_ip_type_{income_source_counter}"
            )
            income_details["licensing_agreements"] = st.text_input(
                f"{prefix} Licensing Agreements (optional)", 
                key=f"{prefix}_licensing_agreements_{income_source_counter}"
            )

        elif income_type == "Pensions and Annuities":
            income_details["pension_source"] = st.selectbox(
                f"{prefix} Source of Pension/Annuity", 
                ["Government", "Private Employer", "Other"], 
                key=f"{prefix}_pension_source_{income_source_counter}"
            )
            income_details["tax_status"] = st.selectbox(
                f"{prefix} Tax Status", 
                ["Taxable", "Tax-Free"], 
                key=f"{prefix}_tax_status_{income_source_counter}"
            )

        elif income_type == "Social Security or Government Benefits":
            income_details["benefit_type"] = st.text_input(
                f"{prefix} Type of Benefit", 
                key=f"{prefix}_benefit_type_{income_source_counter}"
            )
            income_details["tax_status"] = st.selectbox(
                f"{prefix} Tax Status", 
                ["Taxable", "Tax-Free"], 
                key=f"{prefix}_tax_status_{income_source_counter}"
            )

        elif income_type == "Other Income":
            income_details["description"] = st.text_input(
                f"{prefix} Description of Income Source", 
                key=f"{prefix}_other_income_desc_{income_source_counter}"
            )

        # Common fields for all income types
        income_amount = st.number_input(
            f"{prefix} Annual Income Amount", 
            min_value=0, 
            key=f"{prefix}_income_amount_{income_source_counter}"
        )
        income_currency = st.text_input(
            f"{prefix} Currency", 
            key=f"{prefix}_income_currency_{income_source_counter}"
        )

        # Append income source to the list
        income_sources.append({
            "type": income_type,
            "details": income_details,
            "amount": income_amount,
            "currency": income_currency
        })

        # Ask if the user wants to add another income source
        income_source_counter += 1
        add_income_source = st.checkbox(
            f"{prefix} Add another Income Source?", 
            key=f"{prefix}_add_another_income_source_{income_source_counter}"
        )

    return income_sources

# Function to collect assets
def collect_assets(prefix=""):
    st.write("### Assets")
    assets = {}
    if st.checkbox(f"{prefix} Add Real Estate", key=f"{prefix}_add_real_estate"):
        real_estate_location = st.text_input(f"{prefix} Real Estate Location", key=f"{prefix}_real_estate_location")
        real_estate_value = st.number_input(f"{prefix} Real Estate Value", key=f"{prefix}_real_estate_value")
        real_estate_currency = st.text_input(f"{prefix} Currency", key=f"{prefix}_real_estate_currency")
        assets["realEstate"] = [{
            "location": real_estate_location,
            "value": real_estate_value,
            "currency": real_estate_currency
        }]

    if st.checkbox(f"{prefix} Add Investments", key=f"{prefix}_add_investments"):
        investment_type = st.text_input(f"{prefix} Investment Type", key=f"{prefix}_investment_type")
        investment_value = st.number_input(f"{prefix} Investment Value", key=f"{prefix}_investment_value")
        investment_currency = st.text_input(f"{prefix} Currency", key=f"{prefix}_investment_currency")
        assets["investments"] = [{
            "type": investment_type,
            "value": investment_value,
            "currency": investment_currency
        }]

    return assets

# Function to collect liabilities
def collect_liabilities(prefix=""):
    st.write("### Liabilities")
    liabilities = {}
    if st.checkbox(f"{prefix} Add Loan", key=f"{prefix}_add_loan"):
        loan_type = st.text_input(f"{prefix} Loan Type", key=f"{prefix}_loan_type")
        loan_amount = st.number_input(f"{prefix} Loan Amount", key=f"{prefix}_loan_amount")
        loan_currency = st.text_input(f"{prefix} Currency", key=f"{prefix}_loan_currency")
        liabilities["loans"] = [{
            "type": loan_type,
            "amount": loan_amount,
            "currency": loan_currency
        }]
    return liabilities

# Function to calculate annual income from income sources
def calculate_annual_income(income_sources):
    total_income = 0
    currency = None
    if not income_sources:
        return 0, None  # Return 0 if no income sources
    for source in income_sources:
        total_income += source["amount"]
        if not currency:
            currency = source["currency"]
        elif currency != source["currency"]:
            st.warning("Multiple currencies detected in income sources. Please ensure all amounts are in the same currency.")
            return None, None
    return total_income, currency

# Function to collect residency intentions
def collect_residency_intentions(prefix=""):
    st.subheader(f"{prefix} Residency Intentions")
    move_type = st.selectbox(f"{prefix} Move Type", ["Permanent", "Digital Nomad"], key=f"{prefix}_move_type")
    intended_country = st.text_input(f"{prefix} Intended Country", key=f"{prefix}_intended_country")
    duration_of_stay = st.selectbox(f"{prefix} Duration of Stay", ["6 months", "1 year", "Indefinite"], key=f"{prefix}_duration_of_stay")
    preferred_maximum_stay_requirement = st.selectbox(f"{prefix} Preferred Maximum Stay Requirement", ["1 month", "3 months", "No requirement"], key=f"{prefix}_preferred_maximum_stay_requirement")
    notes = st.text_area(f"{prefix} Notes (optional)", key=f"{prefix}_notes")

    return {
        "moveType": move_type,
        "intendedCountry": intended_country,
        "durationOfStay": duration_of_stay,
        "preferredMaximumMinimumStayRequirement": preferred_maximum_stay_requirement,
        "notes": notes
    }

# Main Streamlit app
def main():
    st.title("Based Tax Guide")

    image = Image.open("./backend/base_recommender/images/ape.png")
    st.image(image, caption="Mr. Pro Bonobo", use_container_width=True)

    st.caption("We're going to need information from you to determine what \
    living in your desired country means for you tax-wise, as well as \
    eligibility for visas. We also need to sort out whether your significant \
    other may join you on your move, and what that means to your bill.")

    # Option for quick and dirty analysis
    if st.checkbox("Perform a quick and dirty analysis"):
        quick_and_dirty_analysis()
    else:
        # Collect detailed information
        personal_info = collect_personal_info()
        income_sources = collect_income_sources()
        assets = collect_assets()
        liabilities = collect_liabilities()
        st.divider()
        residency_intentions = collect_residency_intentions()
        st.divider()

        st.header("Partner Information")
        has_partner = st.checkbox("Do you have a partner?")
        partner_personal_info = None
        partner_income_sources = []
        partner_assets = {}
        partner_liabilities = {}
        partner_residency_intentions = None # Initialize outside the if block

        if has_partner:
            partner_personal_info = collect_personal_info("Partner")
            partner_income_sources = collect_income_sources("Partner")
            partner_assets = collect_assets("Partner")
            partner_liabilities = collect_liabilities("Partner")
            partner_residency_intentions = collect_residency_intentions("Partner")

        st.header("Dependents information")
        dependents = []
        add_dependent = st.checkbox("Add dependent")
        dependent_counter = 0
        while add_dependent:
            dependent_name = st.text_input(f"Dependent name", key=f"dependent_name_{dependent_counter}")
            dependent_relationship = st.text_input("Dependent relationship", key=f"dependent_relationship_{dependent_counter}")
            dependent_age = st.number_input("Dependent age", min_value=0, max_value=120, key=f"dependent_age_{dependent_counter}")
            dependents.append({
                "name": dependent_name,
                "relationship": dependent_relationship,
                "age": dependent_age
            })
            dependent_counter += 1
            add_dependent = st.checkbox("Add another dependent?", key=f"add_another_dependent_{dependent_counter}")

        special_circumstances = st.text_area("Special circumstances (optional)")

        # Save data to JSON
        st.divider()
        if st.button("Save data"):
            data = {
                "individual": {
                    "personalInformation": personal_info,
                    "financialInformation": {
                        "annualIncome": {
                            "amount": calculate_annual_income(income_sources)[0],
                            "currency": calculate_annual_income(income_sources)[1]
                        },
                        "incomeSources": income_sources,
                        "assets": assets,
                        "liabilities": liabilities
                    },
                    "residencyIntentions": residency_intentions
                },
                "partner": {
                    "personalInformation": partner_personal_info,
                    "financialInformation": {
                        "annualIncome": {
                            "amount": calculate_annual_income(partner_income_sources)[0],
                            "currency": calculate_annual_income(partner_income_sources)[1]
                        },
                        "incomeSources": partner_income_sources,
                        "assets": partner_assets,
                        "liabilities": partner_liabilities
                    },
                    "residencyIntentions": partner_residency_intentions
                } if has_partner else None,
                "additionalInformation": {
                    "dependents": dependents,
                    "specialCircumstances": special_circumstances
                }
            }
            save_to_json(data)

# Run the app
if __name__ == "__main__":
    main()