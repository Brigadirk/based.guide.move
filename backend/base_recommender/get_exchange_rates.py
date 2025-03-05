import requests

# Your Open Exchange Rates API ID
API_ID = "f118c702ffcc45ec85d49bbebe124c44"

# API endpoint for latest exchange rates
url = f"https://openexchangerates.org/api/latest.json?app_id={API_ID}"

# Make the API request
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    data = response.json()
    usd_rates = data.get("rates", {})
    
    # Print all USD pairs
    print("USD Exchange Rates Today:")
    for currency, rate in usd_rates.items():
        print(f"{currency}: {rate}")
else:
    print(f"Failed to fetch data. Status code: {response.status_code}")
    print(response.text)  # Print error message if any