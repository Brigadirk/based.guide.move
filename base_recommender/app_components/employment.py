import streamlit as st
from app_components.helpers import get_data, update_data, get_country_list

# Step 5: Employment Information Section with enhanced structure

def employment():

    if st.session_state.current_step == 5:
        # st.header("Employment Information")
        st.write("Your employment status affects both your income tax obligations and visa/residency options.")
    
        # Current Employment Status
        st.subheader("Current Employment")
        
        currently_employed = st.checkbox(
            "I am currently employed", 
            value=get_data("individual.employmentInformation.currentEmploymentStatus.isCurrentlyEmployed", False),
            help="If you're currently working for an employer"
        )
        update_data("individual.employmentInformation.currentEmploymentStatus.isCurrentlyEmployed", currently_employed)
        
        if currently_employed:
            col1, col2 = st.columns(2)
            
            with col1:
                employer_name = st.text_input(
                    "Employer Name",
                    value=get_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.employerName", ""),
                    help="Name of your current employer - needed for tax documentation"
                )
                update_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.employerName", employer_name)
                
                employer_country = st.selectbox(
                    "Employer Country",
                    options=[""] + get_country_list(),
                    index=0 if not get_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.employerCountry") 
                        else (get_country_list().index(get_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.employerCountry")) + 1 
                                if get_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.employerCountry") in get_country_list() else 0),
                    help="Country where your employer is based - affects source of income for tax purposes"
                )
                update_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.employerCountry", employer_country)
            
            with col2:
                annual_salary = st.number_input(
                    "Annual Salary",
                    min_value=0,
                    value=get_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.annualSalary", 0),
                    help="Your annual salary before taxes - primary basis for income tax calculation"
                )
                update_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.annualSalary", annual_salary)
                
                salary_currency = st.text_input(
                    "Salary Currency",
                    value=get_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.currency", ""),
                    help="Currency code (USD, EUR, etc.)"
                )
                update_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.currency", salary_currency)
            
            st.subheader("Remote Work")
            
            col1, col2 = st.columns(2)
            
            with col1:
                can_work_remotely = st.checkbox(
                    "I can work remotely",
                    value=get_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.remoteWorkOption.canWorkRemotely", False),
                    help="Whether your job can be performed remotely"
                )
                update_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.remoteWorkOption.canWorkRemotely", can_work_remotely)
            
            with col2:
                if can_work_remotely:
                    allows_working_abroad = st.checkbox(
                        "My employer allows working from abroad",
                        value=get_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.remoteWorkOption.employerAllowsWorkingFromAbroad", False),
                        help="Whether your employer permits working from another country - critical for planning international moves"
                    )
                    update_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.remoteWorkOption.employerAllowsWorkingFromAbroad", allows_working_abroad)
                    
                    eor_option = st.checkbox(
                        "My employer would use an Employer of Record (EOR) service",
                        value=get_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.remoteWorkOption.employerWillingToUseEOR", False),
                        help="EOR services can simplify international employment compliance"
                    )
                    update_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.remoteWorkOption.employerWillingToUseEOR", eor_option)
            
            st.subheader("Tax Withholding")
            
            tax_withholding_country = st.selectbox(
                "Country currently withholding taxes",
                options=[""] + get_country_list(),
                index=0 if not get_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.taxWithholding.country") 
                    else (get_country_list().index(get_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.taxWithholding.country")) + 1 
                            if get_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.taxWithholding.country") in get_country_list() else 0),
                help="Where your employer currently withholds taxes - important for tax credits and agreements"
            )
            update_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.taxWithholding.country", tax_withholding_country)
            
            continue_withholding = st.checkbox(
                "Employer will continue withholding taxes after I move",
                value=get_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.taxWithholding.willContinueWithholdingAfterMove", False),
                help="Whether tax withholding will continue in origin country - affects potential double taxation"
            )
            update_data("individual.employmentInformation.currentEmploymentStatus.employerDetails.taxWithholding.willContinueWithholdingAfterMove", continue_withholding)
        
        # Potential Employment
        st.subheader("Job Offer in Target Country")
        
        has_job_offer = st.checkbox(
            "I have a job offer in my target country",
            value=get_data("individual.employmentInformation.potentialEmployment.hasJobOfferInTargetCountry", False),
            help="Whether you have employment already lined up in your destination country"
        )
        update_data("individual.employmentInformation.potentialEmployment.hasJobOfferInTargetCountry", has_job_offer)
        
        if has_job_offer:
            col1, col2 = st.columns(2)
            
            with col1:
                offer_employer = st.text_input(
                    "Potential Employer Name",
                    value=get_data("individual.employmentInformation.potentialEmployment.jobOfferDetails.employerName", ""),
                    help="Name of the company offering employment"
                )
                update_data("individual.employmentInformation.potentialEmployment.jobOfferDetails.employerName", offer_employer)
                
                offer_position = st.text_input(
                    "Offered Position",
                    value=get_data("individual.employmentInformation.potentialEmployment.jobOfferDetails.offeredPosition", ""),
                    help="Your job title or role - may affect work permit eligibility"
                )
                update_data("individual.employmentInformation.potentialEmployment.jobOfferDetails.offeredPosition", offer_position)
            
            with col2:
                offer_salary = st.number_input(
                    "Offered Annual Salary",
                    min_value=0,
                    value=get_data("individual.employmentInformation.potentialEmployment.jobOfferDetails.annualSalary", 0),
                    help="Expected salary in target country - basis for future tax calculations"
                )
                update_data("individual.employmentInformation.potentialEmployment.jobOfferDetails.annualSalary", offer_salary)
                
                offer_currency = st.text_input(
                    "Salary Currency",
                    value=get_data("individual.employmentInformation.potentialEmployment.jobOfferDetails.currency", ""),
                    help="Currency code for your future salary"
                )
                update_data("individual.employmentInformation.potentialEmployment.jobOfferDetails.currency", offer_currency)
            
            offer_tax_handling = st.checkbox(
                "New employer will handle tax withholding/payment",
                value=get_data("individual.employmentInformation.potentialEmployment.jobOfferDetails.employerWillHandleTaxes", False),
                help="Whether your new employer will handle tax compliance - affects your administrative burden"
            )
            update_data("individual.employmentInformation.potentialEmployment.jobOfferDetails.employerWillHandleTaxes", offer_tax_handling)
