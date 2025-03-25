import json

class Exchange:
    def __init__(self, exchange_rates, user, target):
        self.exchange_rates = exchange_rates
        self.user = user
        self.target = target

    def user_to_target(amount):
        pass

    def target_to_user(amount):
        pass

if __name__ == "__main__":
    exchange_rates_folder = Path("./backend/base_recommender/exchange_rates")
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

    userCurrency = "EUR"
    targetCurrency = "SEK"