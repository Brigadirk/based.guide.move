import json
from pathlib import Path

# Path to the exchange_rates folder
exchange_rates_folder = Path("./backend/base_recommender/exchange_rates")

# Path to the country_info JSON file
country_info_path = Path("./backend/base_recommender/country_info/country_info.json")

# Load ALL_COUNTRIES_AND_CURRENCIES from the JSON file
if country_info_path.exists():
    with open(country_info_path, "r") as f:
        ALL_COUNTRIES_AND_CURRENCIES = json.load(f)
else:
    raise FileNotFoundError(f"{country_info_path} does not exist.")

# Find the markdown file in the exchange_rates folder
md_files = list(exchange_rates_folder.glob("*.md"))
if not md_files:
    raise FileNotFoundError("No exchange rates markdown file found.")

# Load the exchange rates data from the markdown file
md_file = md_files[0]  # Assuming there's only one markdown file
with open(md_file, "r") as f:
    content = f.read()

# Extract the JSON data from the markdown file
json_start = content.find("```json") + len("```json")
json_end = content.find("```", json_start)
json_data = content[json_start:json_end].strip()

# Parse the JSON data
exchange_rates = json.loads(json_data)
rates = exchange_rates.get("rates", {})

# Update ALL_COUNTRIES_AND_CURRENCIES with "currency_included"
for country, data in ALL_COUNTRIES_AND_CURRENCIES.items():
    currency_shorthand = data.get("currency_shorthand")
    if currency_shorthand in rates:
        data["currency_included"] = "yes"
    else:
        data["currency_included"] = "no"

# Save the updated dictionary back to the JSON file
with open(country_info_path, "w") as f:
    json.dump(ALL_COUNTRIES_AND_CURRENCIES, f, indent=4)

print(f"Updated country info saved to {country_info_path}")

# Compile currency_not_included.json
currency_not_included = {
    country: data for country, data in ALL_COUNTRIES_AND_CURRENCIES.items()
    if data.get("currency_included") == "no"
}

# Compile embedding_not_included.json
embedding_not_included = {
    country: data for country, data in ALL_COUNTRIES_AND_CURRENCIES.items()
    if data.get("embedding_name") == "not-included"
}

# Save currency_not_included.json
currency_not_included_path = Path("./backend/base_recommender/country_info/currency_not_included.json")
currency_not_included_path.parent.mkdir(parents=True, exist_ok=True)
with open(currency_not_included_path, "w") as f:
    json.dump(currency_not_included, f, indent=4)

print(f"Currency not included info saved to {currency_not_included_path}")

# Save embedding_not_included.json
embedding_not_included_path = Path("./backend/base_recommender/country_info/embedding_not_included.json")
embedding_not_included_path.parent.mkdir(parents=True, exist_ok=True)
with open(embedding_not_included_path, "w") as f:
    json.dump(embedding_not_included, f, indent=4)

print(f"Embedding not included info saved to {embedding_not_included_path}")