from flask import Flask, request, jsonify
import json

app = Flask(__name__)

# Mock data for country profiles
country_profiles = {
    "USA": {
        "name": "United States of America",
        "flag_svg": "https://flagcdn.com/us.svg",
        "short_description": "A country in North America with a diverse culture and economy.",
        "base_score": 85
    },
    "Canada": {
        "name": "Canada",
        "flag_svg": "https://flagcdn.com/ca.svg",
        "short_description": "A country in North America known for its natural beauty and friendly people.",
        "base_score": 90
    },
    "Germany": {
        "name": "Germany",
        "flag_svg": "https://flagcdn.com/de.svg",
        "short_description": "A country in Europe known for its rich history and strong economy.",
        "base_score": 88
    }
}

# Helper function to validate JSON input
def is_valid_json(data):
    try:
        json.loads(data)
        return True
    except ValueError:
        return False

# Endpoint 1: Tax Recommender
@app.route('/tax-recommender', methods=['POST'])
def tax_recommender():
    # Get parameters from the request
    v1 = request.args.get('v1')
    v2 = request.args.get('v2')
    json_data = request.data

    # Verify JSON input
    if not is_valid_json(json_data):
        return jsonify({"error": "Invalid JSON input"}), 400

    # Placeholder for future JSON validation logic
    # For now, just pass the JSON through
    validated_data = json.loads(json_data)

    # Placeholder for tax recommendation logic
    recommendation = f"Tax recommendation for v1={v1}, v2={v2} with data: {validated_data}"

    return jsonify({"recommendation": recommendation}), 200

# Endpoint 2: Country Profile
@app.route('/country-profile', methods=['GET'])
def country_profile():
    country_name = request.args.get('name')

    if not country_name:
        return jsonify({"error": "Country name is required"}), 400

    country_name = country_name.capitalize()
    if country_name not in country_profiles:
        return jsonify({"error": "Country not found"}), 404

    return jsonify(country_profiles[country_name]), 200

# Endpoint 3: Country Grid
@app.route('/country-grid', methods=['GET'])
def country_grid():
    condensed_profiles = []
    for country, profile in country_profiles.items():
        condensed_profiles.append({
            "name": profile["name"],
            "flag_svg": profile["flag_svg"],
            "short_description": profile["short_description"],
            "base_score": profile["base_score"]
        })

    return jsonify(condensed_profiles), 200

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)