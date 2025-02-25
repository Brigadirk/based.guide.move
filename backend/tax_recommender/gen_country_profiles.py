import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
import re  # For cleaning filenames

# Load environment variables from .env file
load_dotenv()

# Get the API key from the environment variables
api_key = os.getenv("GOOGLE_API_KEY")

if api_key is None:
    raise ValueError("GOOGLE_API_KEY not found in .env file")

# Configure the Gemini API
genai.configure(api_key=api_key)

# Set up the model
model = genai.GenerativeModel('gemini-pro')

def create_country_profile(country_name):
    """
    Creates a country profile in JSON format using Google Gemini API, with robust JSON parsing.

    Args:
        country_name (str): The name of the country to create a profile for.

    Returns:
        dict: A dictionary representing the country profile in JSON format,
              or None if there was an error.
    """
    country_profile_template = {
  "country": "Afghanistan",
  "overview": {
    "tax_residency_rules": "Determined by 183-day rule or permanent establishment.",
    "tax_year": "Solar year (March 21 - March 20).",
    "currency": "Afghani (AFN)",
    "tax_authority": "Ministry of Finance",
    "tax_filing_frequency": "Annually for individuals and businesses.",
    "currency_exchange_rules": "No restrictions on currency conversion."
  },
  "tax_rates": {
    "personal_income_tax": {
      "rate": [
        {
          "bracket": "0 - 12,000 AFN",
          "rate": "0%"
        },
        {
          "bracket": "12,001 - 50,000 AFN",
          "rate": "10%"
        },
        {
          "bracket": "50,001 - 100,000 AFN",
          "rate": "20%"
        },
        {
          "bracket": "100,001+ AFN",
          "rate": "30%"
        }
      ],
      "foreign_income_taxed": False,
      "exemptions": "First 12,000 AFN of income is tax-free.",
      "social_security": "5% of salary (shared between employer and employee)."
    },
    "corporate_tax": {
      "rate": "20% on net profits.",
      "small_business_rate": "10% for businesses with revenue under 1 million AFN.",
      "foreign_income_taxed": False,
      "withholding_taxes": {
        "dividends": "10%",
        "interest": "10%",
        "royalties": "15%"
      },
      "deductions": "R&D expenses, depreciation."
    },
    "capital_gains_tax": {
      "rate": [
        {
          "asset_type": "Stocks",
          "short_term_rate": "20% (held less than 1 year).",
          "long_term_rate": "10% (held more than 1 year)."
        },
        {
          "asset_type": "Real Estate",
          "short_term_rate": "15% (held less than 2 years).",
          "long_term_rate": "5% (held more than 2 years)."
        },
        {
          "asset_type": "Collectibles/NFTs",
          "short_term_rate": "25% (held less than 1 year).",
          "long_term_rate": "15% (held more than 1 year)."
        }
      ],
      "exemptions": "Gains from the sale of primary residence are exempt."
    },
    "vat_gst": {
      "rate": "10% on most goods and services.",
      "reduced_rate": "5% on basic food items.",
      "exemptions": "Healthcare, education."
    },
    "property_tax": {
      "rate": "1.5% of assessed value.",
      "exemptions": "Primary residence."
    },
    "inheritance_tax": {
      "rate": "10% on inherited assets.",
      "exemptions": "Spouse, children."
    },
    "wealth_tax": {
      "rate": "1% on net worth above 10 million AFN.",
      "exemptions": "Primary residence."
    }
  },
  "digital_nomad_visa": {
    "available": False,
    "requirements": "N/A",
    "tax_benefits": "N/A",
    "duration": "N/A"
  },
  "special_economic_zones": [
    {
      "name": "Kabul Industrial Park",
      "location": "Kabul",
      "tax_incentives": "0% corporate tax for the first 5 years, duty-free imports.",
      "business_types": "Manufacturing, logistics.",
      "setup_requirements": "Minimum investment of $100,000."
    }
  ],
  "double_taxation_agreements": [
    {
      "country": "Pakistan",
      "description": "Avoids double taxation on income and capital gains."
    },
    {
      "country": "India",
      "description": "Avoids double taxation on income and dividends."
    }
  ],
  "crypto_and_nft_taxation": {
    "crypto_tax": {
      "income_tax_rate": "20% on crypto income.",
      "capital_gains_rate": "10% on crypto capital gains.",
      "mining_tax": "Taxed as income."
    },
    "nft_tax": {
      "income_tax_rate": "20% on NFT income.",
      "capital_gains_rate": "15% on NFT capital gains."
    }
  },
  "additional_notes": {
    "political_risks": "Tax enforcement may be inconsistent due to political instability.",
    "economic_stability": "High inflation and currency volatility may impact tax calculations.",
    "legal_system": "Tax disputes may face delays due to an underdeveloped legal system.",
    "ease_of_doing_business": "Ranked 173rd in the World Bank's Ease of Doing Business Index."
  }
}

    prompt_introduction = f"You are an expert in international taxation. Provide information about {country_name} formatted as JSON exactly according to the following structure. If information is not available, use 'Information not available' as the value. Be concise and ONLY provide VALID JSON, without any extra text before or after the JSON. Ensure the JSON is parsable by a standard JSON parser."
    prompt_structure = json.dumps(country_profile_template, indent=4) # Indent for readability in prompt

    full_prompt = f"""{prompt_introduction}

    JSON Structure:
    ```json
    {prompt_structure}
    ```

    Now, fill in the JSON structure for {country_name}:
    """

    try:
        response = model.generate_content(full_prompt)
        response_text = response.text.strip()

        try:
            # Attempt to find the JSON block -  look for first '{' and last '}'
            json_start_index = response_text.find('{')
            json_end_index = response_text.rfind('}') # rfind to get the last '}'
            if json_start_index != -1 and json_end_index != -1 and json_start_index < json_end_index:
                # Extract the JSON-like part
                json_string = response_text[json_start_index:json_end_index+1]
            else:
                json_string = response_text # If {} not found, try parsing the whole thing (might be just JSON)

            country_data = json.loads(json_string) # Try parsing the extracted or full response

            # Basic validation: Check if it's a dict and has the 'country' key
            if isinstance(country_data, dict) and country_data.get('country') == country_name:
                 return country_data
            else:
                print(f"Warning: Invalid JSON structure received for {country_name} (after cleanup). Response might not conform to the template.")
                print(f"Problematic Response: {response_text}") # Print the problematic response for debugging
                return None # Or return a partially filled dictionary if you can recover some data

        except json.JSONDecodeError as e:
            print(f"Error decoding JSON for {country_name}: {e}")
            print(f"Problematic Response: {response_text}") # Print the problematic response for debugging
            return None

    except Exception as e:
        print(f"Error generating content for {country_name}: {e}")
        return None

def main():
    countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Côte d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia, Federated States of", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ] # Comprehensive list of countries

    # Create a directory to store country profiles if it doesn't exist
    output_dir = "country_profiles_robust" # Changed output directory name
    os.makedirs(output_dir, exist_ok=True)

    for country in countries:
        # Sanitize filename to remove spaces and special characters
        filename = re.sub(r'[^a-zA-Z0-9]', '_', country) + ".json"
        filepath = os.path.join(output_dir, filename)

        # Check if the file already exists
        if os.path.exists(filepath):
            print(f"Profile for {country} already exists. Skipping...")
            continue

        print(f"Generating profile for: {country}")
        profile = create_country_profile(country)
        if profile:
            with open(filepath, "w") as f:
                json.dump(profile, f, indent=4)
            print(f"Profile for {country} saved to {filepath}")
        else:
            print(f"Failed to generate profile for: {country}")

    print(f"Country profiles generated and saved to '{output_dir}' directory.")


if __name__ == "__main__":
    main()