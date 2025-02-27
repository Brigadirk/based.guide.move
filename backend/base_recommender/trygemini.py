import google.generativeai as genai
import os
from dotenv import load_dotenv

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

# Generate content
response = model.generate_content("Write a short poem about a cat.")

# Print the response
print(response.text)

# Example of streaming responses.
response_stream = model.generate_content("Tell me a long story", stream=True)

for chunk in response_stream:
    print(chunk.text, end="")