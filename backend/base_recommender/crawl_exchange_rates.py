import os
import requests
import json
import time
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Constants
API_ID = os.getenv("OPEN_EXCHANGE_API_KEY")
EXCHANGE_RATES_FOLDER = "./backend/base_recommender/exchange_rates"
API_URL = f"https://openexchangerates.org/api/latest.json?app_id={API_ID}"

# Ensure the exchange_rates folder exists
Path(EXCHANGE_RATES_FOLDER).mkdir(exist_ok=True)

def get_latest_exchange_rates():
    """Fetch the latest exchange rates from the API."""
    response = requests.get(API_URL)
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f"Failed to fetch data. Status code: {response.status_code}")
        print(response.text)
        return None

def save_exchange_rates(data):
    """Save the exchange rates as a Markdown file with the JSON embedded within a code block."""
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    file_path = Path(EXCHANGE_RATES_FOLDER) / f"{timestamp}.md"

    print(data)
    
    # Create the Markdown content with the JSON data in a code block
    markdown_content = f"""# Exchange Rates as of {timestamp} ```json \n {json.dumps(data, indent=4)} ```
        """

    with open(file_path, "w") as f:
        f.write(markdown_content)
        print(f"Exchange rates saved to {file_path}")

def get_last_retrieval_time():
    """Get the timestamp of the most recent exchange rates file."""
    files = list(Path(EXCHANGE_RATES_FOLDER).glob("*.md"))
    if not files:
        return None
    latest_file = max(files, key=os.path.getctime)
    return os.path.getctime(latest_file)

def should_fetch_new_rates():
    """Check if it has been more than 24 hours since the last retrieval."""
    last_retrieval_time = get_last_retrieval_time()
    if not last_retrieval_time:
        return True # No previous file exists, fetch new rates
    current_time = time.time()
    return (current_time - last_retrieval_time) > 24 * 60 * 60

def main():
    """Main function to fetch and save exchange rates if 24 hours have passed."""
    if should_fetch_new_rates():
        print("Fetching new exchange rates...")
        data = get_latest_exchange_rates()
    if data:
        save_exchange_rates(data)
    else:
        print("Exchange rates were retrieved less than 24 hours ago. Skipping fetch.")

if __name__ == "__main__":
    main()