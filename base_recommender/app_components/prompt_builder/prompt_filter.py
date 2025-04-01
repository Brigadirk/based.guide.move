from countries import ALL_COUNTRIES

def create_quick_prompt(data):
    # Extract data from the input JSON
    desired_country = data['quickAnalysis']['desiredCountry']
    main_nationality = data['quickAnalysis']['mainNationality']
    income_type = data['quickAnalysis']['incomeType']
    income_amount = data['quickAnalysis']['incomeAmount']
    holdings_amount = data['quickAnalysis']['holdingsAmount']
    expected_sale_amount = data['quickAnalysis']['expectedSaleAmount']

    # Get country embeddings
    desired_country_embedding_name = ALL_COUNTRIES[desired_country]
    main_nationality_embedding_name = ALL_COUNTRIES[main_nationality]
    
    # Create the prompt template
    prompt_template = f"""
        You are an expert tax advisor, highly skilled in international tax law.

        Your goal is to provide a comprehensive and accurate tax rundown for an 
        individual in their {desired_country} for the next full tax year, assuming
        they are positioned as the JSON implies.

        The individual's nationality is {main_nationality}. 

        They are collecting an income in USD for the amount of {income_amount},
        and they are receiving this from a(n) {income_type} construction.
        
        The individual is holding {holdings_amount} USD in various holding types,

        and in the next fiscal year that he may want to live in {desired_country} 
        intends to sell some stock leading to have {expected_sale_amount} USD
        capital gains.
        
        Do not make assumptions or bring in outside information.

        Make sure to mention potential discount programs, 
        or available visas for the individual.

        Include a calculation both in dollars and in the original country's currency.

        Update the user on your latest updated information on {desired_country}

        Also, give them a step-by-step relocation process: what they need 
        to do if they want to move to that country.

        Lastly, provide them with some information on how health insurance 
        works in that country, as well as other potential requirements.
        """

    print(prompt_template)

    # Return the required tuple
    return [prompt_template, desired_country_embedding_name, main_nationality_embedding_name]
