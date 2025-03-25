import requests
from dotenv import load_dotenv
import os

# Replace with your actual Perplexity API key
load_dotenv()

API_KEY = os.getenv("PERPLEXITY_API_KEY")

# Define the endpoint and headers
url = "https://api.perplexity.ai/chat/completions"
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

# Define the payload
payload = {
    "model": "sonar-pro",
    "messages": [
        {
            "role": "system",
            "content": (
                "You are an artificial intelligence assistant and you need to "
                "engage in a helpful, detailed, polite conversation with a user."
            ),
        },
        {
            "role": "user",
            "content": "What are all current tariffs put in place by Trump?",
        },
    ],
}

# Make the request
response = requests.post(url, headers=headers, json=payload)

# Print the response
if response.status_code == 200:
    print(response.json())
else:
    print(f"Error: {response.status_code}, {response.text}")
