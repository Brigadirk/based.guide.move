import requests
from config import Config

def get_tax_advice(prompt):
    """
    Get tax advice using the Perplexity API
    """
    url = Config.PERPLEXITY_API_URL
    headers = {
        "Authorization": f"Bearer {Config.PERPLEXITY_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": "sonar-pro",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a professional tax advisor. Provide detailed, accurate tax advice "
                    "based on the information provided. Format your response in a clear, structured manner."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        return {
            "status": "success",
            "data": response.json()
        }
    except requests.exceptions.RequestException as e:
        return {
            "status": "error",
            "message": f"API request failed: {str(e)}"
        }
