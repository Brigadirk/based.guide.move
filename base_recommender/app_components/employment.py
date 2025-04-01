import streamlit as st
from app_components.helpers import get_data, update_data, get_country_list
import json
import plotly.express as px

# Helper function to validate inputs
def filled_in_correctly(employment_information):
    required_fields = [
        "status.currentStatus",
        "incomeSource",
        "annualIncome.amount",
        "annualIncome.currency"
    ]
    for field in required_fields:
        if not get_data(f"individual.employmentInformation.{field}", None):
            return False
    return True

# # Function to determine employment status
# def determine_employment_status():
#     employment_status = st.selectbox(
#         "What is your current employment status?",
#         options=["Employed", "Self-Employed", "Business Owner", "Unemployed", "Retired"],
#         index=0
#     )
#     update_data("individual.employmentInformation.status.currentStatus", employment_status)
#     return employment_status

# Function to collect income source details
def collect_income_sources():
    income_source = st.radio(
        "What is the source of your income?",
        options=["Domestic (within current country)", "Foreign (outside current country)", "Both domestic and foreign"],
        index=0
    )
    update_data("individual.employmentInformation.incomeSources", income_source)

    # col1, col2 = st.columns(2)
    # with col1:
    #     annual_income = st.number_input("Annual Income", min_value=0, value=0, step=1000)
    # with col2:
    #     income_currency = st.selectbox("Currency", options=st.session_state.currencies)
    # update_data("individual.employmentInformation.annualIncome.amount", annual_income)
    # update_data("individual.employmentInformation.annualIncome.currency", income_currency)

# Function to handle employed users
def handle_employed():
    employer_name = st.text_input("Current Employer Name")
    update_data("individual.employmentInformation.employerName", employer_name)

    job_title = st.text_input("Job Title")
    update_data("individual.employmentInformation.jobTitle", job_title)

    employment_duration = st.number_input("Years with current employer", min_value=0, value=0, step=1)
    update_data("individual.employmentInformation.employmentDuration", employment_duration)

    has_job_offer = st.checkbox("I have a job offer in the target country")
    update_data("individual.employmentInformation.jobOffer.hasOffer", has_job_offer)

    if has_job_offer:
        offer_employer = st.text_input("Name of offering employer")
        update_data("individual.employmentInformation.jobOffer.offerEmployer", offer_employer)

        offer_job_title = st.text_input("Offered Job Title")
        update_data("individual.employmentInformation.jobOffer.offerJobTitle", offer_job_title)

# Function to handle self-employed users
def handle_self_employed():
    business_type = st.text_input("Type of business or profession")
    update_data("individual.employmentInformation.selfEmployment.businessType", business_type)

    years_self_employed = st.number_input("Years of self-employment", min_value=0, value=0, step=1)
    update_data("individual.employmentInformation.selfEmployment.yearsSelfEmployed", years_self_employed)

# Function to handle business owners
def handle_business_owner():
    company_name = st.text_input("Company Name")
    update_data("individual.employmentInformation.corporateOwnership.companyName", company_name)

    industry = st.text_input("Industry")
    update_data("individual.employmentInformation.corporateOwnership.industry", industry)

    num_employees = st.number_input("Number of Employees", min_value=0, value=0, step=1)
    update_data("individual.employmentInformation.corporateOwnership.numEmployees", num_employees)

    relocating_business = st.radio(
        "Do you plan to relocate your business?",
        options=[
            "Keep the entity where it is",
            "Open a new entity",
            "Both",
            "Open to whatever is most advantageous"
        ],
        index=3
    )
    update_data("individual.employmentInformation.corporateOwnership.relocatingBusiness", relocating_business)

# Function to handle unemployed users
def handle_unemployed():
    seeking_employment = st.checkbox("I am actively seeking employment in the target country")
    update_data("individual.employmentInformation.status.seekingEmployment", seeking_employment)

# Function to handle retired users
def handle_retired():
    retirement_income = st.number_input("Annual Retirement Income", min_value=0, value=0, step=1000)
    retirement_income_currency = st.selectbox(
        "Retirement Income Currency",
        options=st.session_state.currencies
    )
    update_data("individual.employmentInformation.retirement.retirementIncome.amount", retirement_income)
    update_data("individual.employmentInformation.retirement.retirementIncome.currency", retirement_income_currency)

# Function to collect cryptocurrency payment details
def collect_crypto_details():
    crypto_paid = st.checkbox(
        "Are you paid in cryptocurrency? If yes, please provide the equivalent value in a dominant currency."
    )
    if crypto_paid:
        crypto_value = st.number_input(
            "Equivalent Annual Income in Dominant Currency",
            min_value=0,
            value=0,
            step=1000
        )
        crypto_currency = st.selectbox(
            "Dominant Currency",
            options=st.session_state.currencies
        )
        update_data(
            "individual.employmentInformation.annualIncome.paidInCryptoCurrency",
            {"amount": crypto_value, "currency": crypto_currency}
        )

# Function to display income source pie chart
def display_income_pie_chart():
    income_sources = get_data("individual.employmentInformation.incomeSources", [])
    
    if income_sources:
        countries = [source["incomeSourceCountry"] for source in income_sources]
        amounts = [source["annualIncome"]["amount"] for source in income_sources]
        
        fig = px.pie(values=amounts, names=countries, title="Income Sources by Country")
        st.plotly_chart(fig)
        
# Main Employment Section Function
def employment():
    st.header("Employment Information")

    # employment_status = determine_employment_status()

    if employment_status in ["Employed", "Self-Employed", "Business Owner"]:
        collect_income_sources()
        
        if employment_status == "Employed":
            handle_employed()
        
        elif employment_status == "Self-Employed":
            handle_self_employed()
        
        elif employment_status == "Business Owner":
            handle_business_owner()

        collect_crypto_details()

    elif employment_status == "Unemployed":
        handle_unemployed()

    elif employment_status == "Retired":
        handle_retired()

    # Display pie chart for income sources
    display_income_pie_chart()

# # Run the Employment Section
# employment_section()
