from flask import Blueprint, request, jsonify
from modules.validator import validate_tax_data
from modules.prompt_generator import generate_tax_prompt
from api.perplexity import get_tax_advice

api_bp = Blueprint('api', __name__)

@api_bp.route('/tax-advice', methods=['POST'])
def tax_advice():
    # Get JSON data from request
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Validate the JSON data
    validation_result = validate_tax_data(data)
    if not validation_result['valid']:
        return jsonify({"error": validation_result['message']}), 400
    
    # Generate prompt from the JSON data
    prompt = generate_tax_prompt(data)
    
    # Get tax advice using Perplexity API
    advice_response = get_tax_advice(prompt)
    
    # Return the response
    return jsonify(advice_response), 200

@api_bp.route('/custom-prompt', methods=['POST'])
def custom_prompt():
    """
    Endpoint that allows sending any custom prompt to the Perplexity API
    """
    # Get JSON data from request
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Check if the required fields are present
    if 'system_prompt' not in data or 'user_prompt' not in data:
        return jsonify({
            "error": "Missing required fields. Please provide 'system_prompt' and 'user_prompt'"
        }), 400
    
    # Extract the prompts
    prompt_data = {
        "system_prompt": data.get("system_prompt"),
        "user_prompt": data.get("user_prompt")
    }
    
    # Get response using Perplexity API
    response = get_tax_advice(prompt_data)
    
    # Return the response
    return jsonify(response), 200

@api_bp.route('/ping', methods=['GET'])
def ping():
    """
    Simple test endpoint to verify the API is running
    """
    return jsonify({
        "status": "success",
        "message": "API is running",
        "timestamp": "Tuesday, April 15, 2025, 4:45 PM -05"
    }), 200