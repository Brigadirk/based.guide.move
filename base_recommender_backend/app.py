from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import argparse
import json
import uvicorn
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from config import Config
from contextlib import asynccontextmanager

from api.routes import router as api_router
from modules.validator import validate_tax_data
from modules.prompt_generator import generate_tax_prompt
from api.perplexity import get_tax_advice
from exchange_rate_fetcher.exchange_rate_service import fetch_and_save_latest_rates
from exchange_rate_fetcher.exchange_rate_service import _latest_snapshot_file

# Load environment variables early
load_dotenv()

# ---------------------------------------------------------------------------
# Lifespan context to manage scheduler (replaces deprecated on_event)
# ---------------------------------------------------------------------------

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: D401
    """Start background FX scheduler on app startup and shut it down gracefully."""
    # Startup actions
    fetch_and_save_latest_rates()
    scheduler.add_job(
        fetch_and_save_latest_rates,
        "interval",
        hours=Config.EXCHANGE_UPDATE_INTERVAL_HOURS,
        id="fx-refresh",
        replace_existing=True,
    )
    scheduler.start()

    yield  # Application runs here

    # Shutdown actions
    scheduler.shutdown()

# Instantiate FastAPI with lifespan handler
app = FastAPI(title="Base Recommender Backend", version="1.0.0", lifespan=lifespan)

# Add CORS middleware to handle preflight requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prefix all routes with /api/v1 to stay consistent with repo conventions
app.include_router(api_router, prefix="/api/v1")

def run_cli_test(test_file: str):
    """Utility used by `python app.py --test <path>` to exercise the main flow without
    spinning up the web-server. Prints the Perplexity API response to stdout.
    """
    try:
        with open(test_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as exc:
        print(f"[ERROR] Unable to load the JSON file '{test_file}': {exc}")
        return

    # Validate
    validation_result = validate_tax_data(data)
    if not validation_result["valid"]:
        print(f"[ERROR] Validation failed: {validation_result['message']}")
        return

    prompt = generate_tax_prompt(data, include_appendix=False)
    advice_response = get_tax_advice(prompt)
    print(json.dumps(advice_response, indent=2, ensure_ascii=False))

# Helper to refresh FX rates if snapshot older than 24h
def ensure_rates_fresh():
    try:
        fetch_and_save_latest_rates(force=False)
    except Exception as exc:
        print(f"[WARN] Could not refresh FX rates: {exc}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the Base Recommender backend.")
    parser.add_argument("--test", metavar="JSON_PATH", nargs="?", const="tax_migration_profile_test.json", help="Run the full Perplexity pipeline locally using the specified JSON file. If no path is provided, defaults to 'tax_migration_profile_test.json'.")
    parser.add_argument("--output", metavar="JSON_PATH", nargs="?", const="tax_migration_profile_test.json", help="Translate the JSON file into the text prompt that would be sent to Perplexity and print to stdout without performing the API call.")
    parser.add_argument("--no-appendix", action="store_true", help="Omit the raw JSON appendix from the generated prompt.")
    parser.add_argument("--exchange-rates", action="store_true", help="Fetch latest exchange rates now, print JSON, and exit.")
    parser.add_argument("--host", default="0.0.0.0", help="Host interface for uvicorn.")
    parser.add_argument("--port", type=int, default=5001, help="Port for uvicorn.")
    args = parser.parse_args()

    if args.exchange_rates:
        # Force fetch latest rates and print them
        try:
            fetch_and_save_latest_rates(force=True)
        except Exception as exc:
            print(f"[ERROR] Failed to fetch new exchange rates: {exc}")
        finally:
            latest = _latest_snapshot_file()
            if latest and latest.exists():
                print(latest.read_text())
                raise SystemExit(0)
            else:
                print("No exchange rates snapshot available.")
                raise SystemExit(1)

    elif args.output:
        # Simply render the prompt and print it.
        try:
            with open(args.output, "r", encoding="utf-8") as f:
                data_json = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as exc:
            print(f"[ERROR] Unable to load the JSON file '{args.output}': {exc}")
            raise SystemExit(1)

        validation = validate_tax_data(data_json)
        if not validation["valid"]:
            print(f"[ERROR] Validation failed: {validation['message']}")
            raise SystemExit(1)

        prompt_text = generate_tax_prompt(data_json, include_appendix=not args.no_appendix)
        print(prompt_text)
        raise SystemExit(0)

    elif args.test:
        ensure_rates_fresh()
        run_cli_test(args.test)
    else:
        uvicorn.run("app:app", host=args.host, port=args.port, reload=True)

