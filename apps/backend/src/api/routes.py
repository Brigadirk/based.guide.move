import json
import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from api.auth import verify_api_key
from api.perplexity import get_tax_advice
from modules.currency_utils import country_to_currency
from modules.prompt_generator import generate_tax_prompt
from modules.schemas import (
    AdditionalInformationRequest,
    EducationRequest,
    FinanceRequest,
    FutureFinancialPlansRequest,
    PersonalInformationRequest,
    ResidencyIntentionsRequest,
    SocialSecurityRequest,
    SummaryRequest,
    TaxDeductionsRequest,
)
from modules.story_generator import (
    make_additional_information_story,
    make_education_story,
    make_finance_story,
    make_future_financial_plans_story,
    make_personal_story,
    make_residency_intentions_story,
    make_social_security_story,
    make_story,
    make_tax_deductions_story,
)
from modules.validator import validate_tax_data
from services.exchange_rate_service import (
    EXCHANGE_RATES_FOLDER,
    _get_exchange_rates_folder,
    _latest_snapshot_file,
    fetch_and_save_latest_rates,
    get_latest_rates,
)

# Instantiate the router (replaces Flask Blueprint)
router = APIRouter()


@router.post("/tax-advice")
def tax_advice(data: dict, api_key: str = Depends(verify_api_key)):
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
def custom_prompt(payload: dict, api_key: str = Depends(verify_api_key)):
    """Send an arbitrary prompt directly to the Perplexity API."""

    if not payload:
        raise HTTPException(status_code=400, detail="No data provided")

    if "system_prompt" not in payload or "user_prompt" not in payload:
        raise HTTPException(
            status_code=400,
            detail="Missing required fields. Provide 'system_prompt' and 'user_prompt'.",
        )

    response = get_tax_advice(payload)
    return response


@router.get("/ping")
def ping(api_key: str = Depends(verify_api_key)):
    """Health-check endpoint."""
    return {"status": "success", "message": "API is running"}


@router.get("/health")
def api_health(api_key: str = Depends(verify_api_key)):
    """API health check endpoint accessible through API proxy."""
    try:
        rates_dir = str(_get_exchange_rates_folder())
        rates_accessible = os.path.exists(rates_dir) and os.access(rates_dir, os.W_OK)
        latest_file = _latest_snapshot_file()
        rates_fresh = latest_file and latest_file.exists()

        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "api": {
                "accessible": True,
                "authentication": "required",
            },
            "exchange_rates": {
                "accessible": rates_accessible,
                "fresh": rates_fresh,
            },
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e), "timestamp": datetime.now().isoformat()}


# Section-specific story generation endpoints
@router.post("/section/personal-information")
def get_personal_information_story(
    request: PersonalInformationRequest, api_key: str = Depends(verify_api_key)
):
    """Generate a story for the personal information section."""
    try:
        story = make_personal_story(request.personal_information)
        return {"status": "success", "section": "personal_information", "story": story}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating personal information story: {str(e)}"
        )


@router.post("/section/education")
def get_education_story(request: EducationRequest, api_key: str = Depends(verify_api_key)):
    """Generate a story for the education section."""
    try:
        # Pass residency intentions to include language proficiency context in education story
        story = make_education_story(request.education, request.residency_intentions)
        return {"status": "success", "section": "education", "story": story}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating education story: {str(e)}")


@router.post("/section/residency-intentions")
def get_residency_intentions_story(
    request: ResidencyIntentionsRequest, api_key: str = Depends(verify_api_key)
):
    """Generate a story for the residency intentions section."""
    try:
        story = make_residency_intentions_story(request.residency_intentions)
        return {"status": "success", "section": "residency_intentions", "story": story}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating residency intentions story: {str(e)}"
        )


@router.post("/section/finance")
def get_finance_story(request: FinanceRequest, api_key: str = Depends(verify_api_key)):
    """Generate a story for the finance section."""
    try:
        dest_currency = "USD"
        if request.destination_country:
            dest_currency = country_to_currency(request.destination_country)

        # Debug logging for finance data structure
        print(f"DEBUG: Finance data type: {type(request.finance)}")
        print(
            f"DEBUG: Finance data keys: {list(request.finance.keys()) if isinstance(request.finance, dict) else 'Not a dict'}"
        )
        print(f"DEBUG: Full finance data: {request.finance}")

        if isinstance(request.finance, dict):
            # Check income sources specifically (handle both naming conventions)
            income_sources = request.finance.get(
                "incomeSources", request.finance.get("income_sources", [])
            )
            print(f"DEBUG: Income sources count: {len(income_sources)}")
            for i, source in enumerate(income_sources):
                print(f"DEBUG: Income source {i}: {source}")

            # Check income situation
            income_situation = request.finance.get(
                "income_situation", request.finance.get("incomeSituation")
            )
            print(f"DEBUG: Income situation: {income_situation}")

            if "capitalGains" in request.finance:
                cg = request.finance["capitalGains"]
                print(f"DEBUG: capitalGains type: {type(cg)}, value: {cg}")

        story = make_finance_story(request.finance, dest_currency, request.skip_finance_details)
        return {"status": "success", "section": "finance", "story": story}
    except Exception as e:
        import traceback

        error_details = (
            f"Error generating finance story: {str(e)}\nTraceback: {traceback.format_exc()}"
        )
        print(f"ERROR: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error generating finance story: {str(e)}")


@router.post("/section/social-security-pensions")
def get_social_security_story(
    request: SocialSecurityRequest, api_key: str = Depends(verify_api_key)
):
    """Generate a story for the social security and pensions section."""
    try:
        dest_currency = "USD"
        if request.destination_country:
            dest_currency = country_to_currency(request.destination_country)

        story = make_social_security_story(
            request.social_security_and_pensions, dest_currency, request.skip_finance_details
        )
        return {"status": "success", "section": "social_security_and_pensions", "story": story}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating social security story: {str(e)}"
        )


@router.post("/section/tax-deductions-credits")
def get_tax_deductions_story(request: TaxDeductionsRequest, api_key: str = Depends(verify_api_key)):
    """Generate a story for the tax deductions and credits section."""
    try:
        dest_currency = "USD"
        if request.destination_country:
            dest_currency = country_to_currency(request.destination_country)

        story = make_tax_deductions_story(
            request.tax_deductions_and_credits, dest_currency, request.skip_finance_details
        )
        return {"status": "success", "section": "tax_deductions_and_credits", "story": story}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating tax deductions story: {str(e)}"
        )


@router.post("/section/future-financial-plans")
def get_future_financial_plans_story(
    request: FutureFinancialPlansRequest, api_key: str = Depends(verify_api_key)
):
    """Generate a story for the future financial plans section."""
    try:
        dest_currency = "USD"
        if request.destination_country:
            dest_currency = country_to_currency(request.destination_country)

        story = make_future_financial_plans_story(
            request.future_financial_plans, dest_currency, request.skip_finance_details
        )
        return {"status": "success", "section": "future_financial_plans", "story": story}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating future financial plans story: {str(e)}"
        )


@router.post("/section/additional-information")
def get_additional_information_story(
    request: AdditionalInformationRequest, api_key: str = Depends(verify_api_key)
):
    """Generate a story for the additional information section."""
    try:
        story = make_additional_information_story(request.additional_information)
        return {"status": "success", "section": "additional_information", "story": story}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating additional information story: {str(e)}"
        )


@router.post("/section/summary")
def get_summary_story(request: SummaryRequest, api_key: str = Depends(verify_api_key)):
    """Generate a complete summary story from the entire profile."""
    try:
        story = make_story(request.profile)
        return {"status": "success", "section": "summary", "story": story}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary story: {str(e)}")


@router.post("/generate-full-story")
def generate_full_story(request: SummaryRequest, api_key: str = Depends(verify_api_key)):
    """Generate the complete profile story for Perplexity AI analysis."""
    try:
        story = make_story(request.profile)
        return {"status": "success", "section": "full_story", "story": story}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating full story: {str(e)}")


@router.post("/perplexity-analysis")
def perplexity_analysis(payload: dict, api_key: str = Depends(verify_api_key)):
    """Send a prompt to Perplexity AI for comprehensive analysis."""
    try:
        if not payload:
            raise HTTPException(status_code=400, detail="No data provided")

        if "prompt" not in payload or "model" not in payload:
            raise HTTPException(
                status_code=400, detail="Missing required fields. Provide 'prompt' and 'model'."
            )

        # Import prompt functions
        from api.prompt import get_enhanced_perplexity_config

        # Create the request format expected by the Perplexity API
        config = get_enhanced_perplexity_config()

        # The frontend now sends the full prompt generated by our backend
        # We need to use a simple system prompt and send the full prompt as user content
        perplexity_request = {
            "system_prompt": "You are an expert immigration lawyer and tax advisor. Provide comprehensive, accurate advice based on the detailed analysis request.",
            "user_prompt": payload["prompt"],
            "model": payload.get("model", config["model"]),
            "temperature": config["temperature"],
            "top_p": config["top_p"],
        }

        response = get_tax_advice(perplexity_request)

        # Extract the result from the Perplexity API response
        if isinstance(response, dict) and response.get("status") == "success":
            data = response.get("data", {})
            choices = data.get("choices", [])
            if choices and len(choices) > 0:
                result = choices[0].get("message", {}).get("content", "No content received")
            else:
                result = "No response received from the AI"
        elif isinstance(response, dict) and response.get("status") == "error":
            raise HTTPException(status_code=500, detail=response.get("message", "API error"))
        else:
            result = str(response)

        return {"status": "success", "result": result}

    except Exception as e:
        import traceback

        error_details = (
            f"Error in Perplexity analysis: {str(e)}\nTraceback: {traceback.format_exc()}"
        )
        print(f"ERROR: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error in Perplexity analysis: {str(e)}")


@router.post("/generate-prompt")
def generate_prompt(payload: dict, api_key: str = Depends(verify_api_key)):
    """Generate a Perplexity prompt using the new prompt templates."""
    try:
        from api.prompt import build_enhanced_prompt

        profile_story = payload.get("profile_story", "")
        destination_country = payload.get("destination_country", "Unknown")
        include_raw_data = payload.get("include_raw_data", True)
        raw_data = payload.get("raw_data", "")

        if not profile_story:
            raise HTTPException(status_code=400, detail="profile_story is required")

        prompt = build_enhanced_prompt(
            profile_story, destination_country, include_raw_data, raw_data
        )

        return {"status": "success", "prompt": prompt}

    except Exception as e:
        import traceback

        error_details = f"Error generating prompt: {str(e)}\nTraceback: {traceback.format_exc()}"
        print(f"ERROR: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error generating prompt: {str(e)}")


@router.get("/exchange-rates")
def get_exchange_rates(api_key: str = Depends(verify_api_key)):
    """Get the latest exchange rates (USD base)."""
    try:
        # First, try to ensure we have rates available
        try:
            rates = get_latest_rates()
        except RuntimeError as e:
            if "no snapshot available" in str(e):
                # Try to create rates on demand
                print("No exchange rates found, attempting to create...")
                fetch_and_save_latest_rates(force=True)
                rates = get_latest_rates()
            else:
                raise e

        latest_file = _latest_snapshot_file()

        # Get metadata about the snapshot
        snapshot_info = {
            "last_updated": None,
            "file_age_hours": None,
            "total_currencies": len(rates),
        }

        if latest_file and latest_file.exists():
            # Get file creation time
            file_time = os.path.getctime(latest_file)
            snapshot_info["last_updated"] = datetime.fromtimestamp(file_time).isoformat()

            # Calculate age in hours
            current_time = datetime.now().timestamp()
            age_seconds = current_time - file_time
            snapshot_info["file_age_hours"] = round(age_seconds / 3600, 2)

        return {
            "status": "success",
            "base_currency": "USD",
            "rates": rates,
            "metadata": snapshot_info,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve exchange rates: {str(e)}")


@router.post("/exchange-rates/refresh")
def refresh_exchange_rates(api_key: str = Depends(verify_api_key)):
    """Force refresh exchange rates from API."""
    from services.exchange_rate_service import fetch_and_save_latest_rates

    try:
        fetch_and_save_latest_rates(force=True)
        return {"status": "success", "message": "Exchange rates refreshed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh exchange rates: {str(e)}")


@router.get("/exchange-rates/files")
def list_exchange_rate_files(api_key: str = Depends(verify_api_key)):
    """List exchange rate snapshot files in the configured folder.

    Returns filenames, sizes (bytes), and created timestamps. Useful for debugging volumes in production.
    """
    try:
        folder_path = str(EXCHANGE_RATES_FOLDER)
        files = []
        for p in EXCHANGE_RATES_FOLDER.glob("*.json"):
            try:
                files.append(
                    {
                        "name": p.name,
                        "size_bytes": os.path.getsize(p),
                        "created": datetime.fromtimestamp(os.path.getctime(p)).isoformat(),
                    }
                )
            except Exception:
                # Skip unreadable files
                continue

        files.sort(key=lambda f: f["created"], reverse=True)

        return {
            "status": "success",
            "folder": folder_path,
            "writable": os.access(folder_path, os.W_OK),
            "count": len(files),
            "files": files,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list exchange rate files: {str(e)}")


@router.get("/exchange-rates/file/latest")
def get_latest_exchange_rate_file(api_key: str = Depends(verify_api_key)):
    """Return the contents of the latest exchange rate snapshot JSON."""
    try:
        latest = _latest_snapshot_file()
        if not latest or not latest.exists():
            raise HTTPException(status_code=404, detail="No snapshot file found")

        with open(latest, encoding="utf-8") as f:
            data = json.load(f)  # type: ignore[name-defined]

        return {
            "status": "success",
            "file": latest.name,
            "path": str(latest),
            "data": data,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to read latest exchange rate file: {str(e)}"
        )
