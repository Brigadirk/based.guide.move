from fastapi import APIRouter, HTTPException
from modules.validator import validate_tax_data
from modules.prompt_generator import generate_tax_prompt
from api.perplexity import get_tax_advice

# Instantiate the router (replaces Flask Blueprint)
router = APIRouter()

@router.post("/tax-advice")
def tax_advice(data: dict):
    """Generate tax advice by transforming the incoming JSON and forwarding a prompt to the Perplexity API."""

    if not data:
        raise HTTPException(status_code=400, detail="No data provided")

    validation_result = validate_tax_data(data)
    if not validation_result["valid"]:
        raise HTTPException(status_code=400, detail=validation_result["message"])

    prompt = generate_tax_prompt(data)
    advice_response = get_tax_advice(prompt)
    return advice_response

@router.post("/custom-prompt")
def custom_prompt(payload: dict):
    """Send an arbitrary prompt directly to the Perplexity API."""

    if not payload:
        raise HTTPException(status_code=400, detail="No data provided")

    if "system_prompt" not in payload or "user_prompt" not in payload:
        raise HTTPException(status_code=400, detail="Missing required fields. Provide 'system_prompt' and 'user_prompt'.")

    response = get_tax_advice(payload)
    return response

@router.get("/ping")
def ping():
    """Health-check endpoint."""
    return {
        "status": "success",
        "message": "API is running"
    }