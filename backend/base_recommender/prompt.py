def prompt_tax_rundown(tax_profile_json):
    """
    Generates a detailed prompt for an LLM to provide a tax rundown based on a JSON tax profile.

    Args:
        tax_profile_json (str): A JSON string representing the tax profile of an individual.

    Returns:
        str: A formatted prompt string ready to be used with an LLM.
    """

    prompt_template = f"""
        You are an expert tax advisor, highly skilled in international tax law.

        Your goal is to provide a comprehensive and accurate tax rundown for an individual in their "desiredCountry" for the next full tax year.

        All the necessary financial and personal information for this individual is provided in the following JSON profile.  
        
        You **must** base your tax rundown **exclusively** on the data provided in this JSON. Do not make assumptions or bring in outside information.

        **JSON Tax Profile:**
        ```json
        {tax_profile_json}

        Also, give them a step-by-step relocation process: what they need to do if they want to move to that country.

        Lastly, provide them with some information on how health insurance works in that country, as well as other potential requirements.
    """