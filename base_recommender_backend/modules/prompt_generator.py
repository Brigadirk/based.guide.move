def generate_tax_prompt(data):
    """
    Generate a prompt for tax advice based on the provided JSON data
    """
    # Extract relevant information from the JSON
    individual_data = data.get('individual', {})
    personal_info = individual_data.get('personalInformation', {})
    residency_intentions = individual_data.get('residencyIntentions', {})
    finance_data = individual_data.get('finance', {})
    
    # Get destination country
    destination_country = residency_intentions.get('destinationCountry', {}).get('country', 'Unknown')
    
    # Get current residency
    current_residency = personal_info.get('currentResidency', {}).get('country', 'Unknown')
    
    # Get income information
    income = finance_data.get('income', {})
    annual_amount = income.get('annualAmount', 0)
    currency = income.get('currency', 'USD')
    
    # Build the prompt
    prompt = f"""
    I need tax advice for the following situation:
    
    Current Country of Residence: {current_residency}
    Intended Destination Country: {destination_country}
    Annual Income: {annual_amount} {currency}
    
    Personal Information:
    - Marital Status: {personal_info.get('maritalStatus', 'Not specified')}
    - Has Partner: {'Yes' if personal_info.get('relocationPartner', False) else 'No'}
    - Number of Dependents: {personal_info.get('numRelocationDependents', 0)}
    
    Residency Intentions:
    - Move Type: {residency_intentions.get('destinationCountry', {}).get('moveType', 'Not specified')}
    - Interested in Citizenship: {'Yes' if residency_intentions.get('citizenshipPlans', {}).get('interestedInCitizenship', False) else 'No'}
    
    Please provide detailed tax advice for this situation, including:
    1. Tax implications of the move
    2. Key tax considerations in the destination country
    3. Any tax treaties between the current and destination countries
    4. Recommendations for tax planning
    5. Any specific tax forms or requirements to be aware of
    
    Format the response as a structured report with clear sections and actionable advice.
    """
    
    return prompt
