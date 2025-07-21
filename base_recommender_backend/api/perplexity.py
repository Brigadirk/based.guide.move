import requests
from config import Config
from typing import Union, Dict, Any

def get_tax_advice(prompt: Union[str, Dict[str, Any]]):
    """Call the Perplexity API.

    The helper is flexible: it accepts either a **single string** (which will be sent as a
    user message with a default system prompt) **or** a *dict* with the explicit keys
    `system_prompt` and `user_prompt` allowing the caller to fully customise the
    conversation context.
    """
    url = Config.PERPLEXITY_API_URL
    headers = {
        "Authorization": f"Bearer {Config.PERPLEXITY_API_KEY}",
        "Content-Type": "application/json",
    }
    
    # Build the messages array depending on the prompt type
    if isinstance(prompt, dict):
        system_prompt = prompt.get("system_prompt", "You are an AI assistant.")
        user_prompt = prompt.get("user_prompt", "")
        # Allow callers to override Perplexity generation parameters
        model_name = prompt.get("model", Config.PERPLEXITY_MODEL)
        temperature = prompt.get("temperature", Config.PERPLEXITY_TEMPERATURE)
        top_p = prompt.get("top_p", Config.PERPLEXITY_TOP_P)
    else:
        # Default system prompt for tax advice
        system_prompt = (
            "You are a professional tax advisor. Provide detailed, accurate tax advice "
            "based on the information provided. Format your response in a clear, structured manner."
        )
        user_prompt = prompt
        model_name = Config.PERPLEXITY_MODEL
        temperature = Config.PERPLEXITY_TEMPERATURE
        top_p = Config.PERPLEXITY_TOP_P

    payload = {
        "model": model_name,
        "temperature": temperature,
        "top_p": top_p,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }

    def _post(_payload):
        resp = requests.post(url, headers=headers, json=_payload)
        # capture JSON even on errors to inspect message
        return resp

    # First attempt with the desired model
    response = _post(payload)

    # If model not found, automatically fall back to the deep-research model
    if response.status_code == 400 and "model" in response.text.lower():
        # Change model and retry once
        if model_name != Config.PERPLEXITY_FALLBACK_MODEL:
            payload["model"] = Config.PERPLEXITY_FALLBACK_MODEL
            response = _post(payload)

    try:
        response.raise_for_status()
    except requests.exceptions.RequestException as exc:
        return {"status": "error", "message": f"API request failed: {exc}"}

    return {
        "status": "success",
        "data": response.json(),
    }
