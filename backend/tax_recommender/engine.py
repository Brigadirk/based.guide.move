import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

# engine.py

def get_country_recommendations(user_data_json):
    """
    Takes user data JSON (optimized structure), sends it to Gemini,
    and returns country recommendations in a structured JSON format.

    Args:
        user_data_json (str): JSON string representing user data (optimized structure).

    Returns:
        dict: JSON dict containing recommended countries with characteristics,
              or an error message string.
    """
    load_dotenv()  # Load API key from .env
    api_key = os.getenv("GOOGLE_API_KEY")

    if api_key is None:
        return "Error: GOOGLE_API_KEY not found in .env file"

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-pro')  # Or your preferred model

    prompt = f"""
    You are an expert tax optimization consultant specializing in advising digital nomads.
    Given the following user's financial, personal, and lifestyle details, recommend the top 5 countries
    that would be most suitable for them as a home base for tax optimization.

    Consider all relevant factors including:
    - Citizenship and Residency rules
    - Income sources and types
    - Assets and investments
    - Tax optimization goals (income tax, capital gains, overall burden)
    - Geographic preferences and lifestyle needs
    - Digital nomad visa availability
    - Cost of living
    - Healthcare quality
    - Language barriers
    - Tax system specifics (territorial, worldwide, tax treaties)

    User Data (Optimized JSON Structure):
    {user_data_json}

    Your response should be a JSON object with a top-level key "recommendations".
    Under "recommendations", provide a list of countries (maximum 5).
    For each country in the list, include the following characteristics in detail:

    - country: (Country Name)
    - tax_summary:
        - territorial_tax: (true/false if territorial tax system is in place)
        - income_tax_rate: (Brief summary of income tax rates relevant to digital nomads)
        - capital_gains_tax: (Brief summary of capital gains tax, if applicable)
        - tax_treaties: (List of significant tax treaties, if any, for digital nomads' common citizenships - e.g., US, EU)
        - digital_nomad_tax_info: (Specific tax rules or incentives for digital nomads, if available)
    - visa_info:
        - digital_nomad_visa_available: (true/false if a digital nomad visa or similar exists)
        - visa_duration: (Typical duration of digital nomad visa or relevant long-stay visa)
        - visa_requirements_summary: (Very brief summary of key visa requirements - e.g., income proof, health insurance)
        - family_visa_options: (Availability of visa options for family members of digital nomads)
    - lifestyle_info:
        - cost_of_living: (Relative cost of living - e.g., "Low", "Medium", "High" or brief description compared to US/EU)
        - healthcare_quality: (Brief description of healthcare quality - e.g., "Good", "Excellent", "Developing")
        - language: (Primary language(s), and English proficiency level in major cities/digital nomad areas)
        - digital_nomad_community: (Presence and strength of digital nomad communities)
        - safety: (General safety and security level)
    - overall_suitability_score: (Optional: A score from 1 to 5 (5 being best) indicating overall suitability for this user, based on provided data)
    - reasons_for_recommendation: (A concise bulleted list of 2-3 reasons why this country is recommended based on the user's profile)

    Ensure the response is valid JSON and strictly follows the structure described above.
    Do not include any introductory or concluding sentences, only the JSON object.
    """

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Attempt to parse the response as JSON
        try:
            recommendation_json = json.loads(response_text)
            return recommendation_json  # Return the parsed JSON if successful
        except json.JSONDecodeError as e:
            return f"Error: Could not parse Gemini response as JSON. Raw response: {response_text}.  JSONDecodeError: {e}"


    except Exception as e:
        return f"An error occurred while generating recommendations: {e}"

# Example Usage (in your streamlit app or another script):
if __name__ == "__main__":
    # Example JSON in the optimized structure
    example_user_data_optimized = {
        "personal": {
            "citizenship": {
                "primary": "USA",
                "dual": False
            },
            "residency": "USA"
        },
        "income": [
            {
                "type": "Freelance/Contract",
                "location": "USA",
                "amount_usd": 80000,
                "taxable_source_country": True
            },
            {
                "type": "Investment",
                "location": "Global",
                "amount_usd": 20000,
                "taxable_source_country": True
            }
        ],
        "assets": [
            {
                "type": "Stocks/Bonds",
                "location": "USA",
                "value_usd": 50000,
                "holding_period": ">5 Years"
            },
            {
                "type": "Cryptocurrency",
                "location": "Global",
                "value_usd": 10000,
                "holding_period": "<1 Year"
            }
        ],
        "tax_goals": {
            "primary_goal": "Minimize Overall Tax Burden",
            "residency_preference": "Location with Territorial Tax",
            "stay_flexibility": "Flexible (< 90 days)"
        },
        "preferences": {
            "regions": ["Europe", "Asia"],
            "visa_concern": "Yes, for Easy Visa Process",
            "digital_nomad_visa": True,
            "cost_of_living": "Very Important",
            "family_visa_needs": False,
            "healthcare_quality": "Nice to Have",
            "language_barrier": "Minor Concern"
        }
    }


    recommendations_json = get_country_recommendations(json.dumps(example_user_data_optimized))

    if isinstance(recommendations_json, dict): # Check if it's a dict (JSON) or error string
        print(json.dumps(recommendations_json, indent=4)) # Pretty print the JSON
    else:
        print(recommendations_json) # Print the error message