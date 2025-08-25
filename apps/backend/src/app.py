import argparse
import json
from contextlib import asynccontextmanager

import uvicorn
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.perplexity import get_tax_advice
from api.routes import router as api_router
from config import Config
from modules.prompt_generator import generate_tax_prompt
from modules.validator import validate_tax_data
from services.exchange_rate_service import _latest_snapshot_file, fetch_and_save_latest_rates

# Load environment variables from backend directory only
load_dotenv()  # Load from backend/.env

# ---------------------------------------------------------------------------
# Lifespan context to manage scheduler (replaces deprecated on_event)
# ---------------------------------------------------------------------------

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: D401
    """Start background FX scheduler on app startup and shut it down gracefully."""
    # Startup actions - ensure exchange rates are available
    print("🚀 Initializing exchange rates service...")
    try:
        fetch_and_save_latest_rates(force=True)
        print("✅ Exchange rates initialized successfully")
    except Exception as e:
        print(f"⚠️ Warning: Could not initialize exchange rates: {e}")
        print("   Exchange rates will be fetched on-demand")

    # Start scheduler for periodic updates (Railway containers are ephemeral,
    # so we refresh more frequently to handle container restarts)
    scheduler.add_job(
        fetch_and_save_latest_rates,
        "interval",
        hours=Config.EXCHANGE_UPDATE_INTERVAL_HOURS,
        id="fx-refresh",
        replace_existing=True,
    )
    scheduler.start()
    print(f"📅 Scheduled exchange rate updates every {Config.EXCHANGE_UPDATE_INTERVAL_HOURS} hours")

    yield  # Application runs here

    # Shutdown actions
    print("🛑 Shutting down exchange rates scheduler...")
    scheduler.shutdown()


# Instantiate FastAPI with lifespan handler
app = FastAPI(title="Base Recommender Backend", version="1.0.0", lifespan=lifespan)


# Add CORS middleware to handle preflight requests
def get_allowed_origins():
    """Get allowed CORS origins from environment variable."""
    allowed_origins = Config.ALLOWED_ORIGINS
    if allowed_origins == "*":
        return ["*"]
    return [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint for Railway
@app.get("/health")
async def health_check():
    """Health check endpoint for Railway deployment."""
    try:
        import os
        from datetime import datetime

        # Check if exchange rates directory is accessible
        from services.exchange_rate_service import EXCHANGE_RATES_FOLDER

        rates_dir = str(EXCHANGE_RATES_FOLDER)
        rates_accessible = os.path.exists(rates_dir) and os.access(rates_dir, os.W_OK)

        # Check if we have recent exchange rates
        latest_file = _latest_snapshot_file()
        rates_fresh = latest_file and latest_file.exists()

        # Additional exchange rate debug info
        exchange_debug = {
            "folder_path": rates_dir,
            "folder_exists": os.path.exists(rates_dir),
            "folder_writable": (
                os.access(rates_dir, os.W_OK) if os.path.exists(rates_dir) else False
            ),
            "latest_file": str(latest_file) if latest_file else None,
            "api_key_configured": bool(Config.OPEN_EXCHANGE_API_KEY),
        }

        # Check volume path (for Railway persistent storage)
        volume_path = Config.RAILWAY_VOLUME_MOUNT_PATH
        volume_accessible = True
        try:
            if not os.path.exists(volume_path):
                os.makedirs(volume_path, exist_ok=True)
            volume_accessible = os.access(volume_path, os.W_OK)
        except Exception:
            volume_accessible = False

        status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "environment": {
                "railway_project": Config.RAILWAY_PROJECT_NAME,
                "railway_environment": Config.RAILWAY_ENVIRONMENT_NAME,
                "railway_service": Config.RAILWAY_SERVICE_NAME,
                "railway_domain": Config.RAILWAY_PRIVATE_DOMAIN,
                "is_railway": Config.is_railway(),
                "is_production": Config.is_production(),
            },
            "checks": {
                "exchange_rates_accessible": rates_accessible,
                "exchange_rates_fresh": rates_fresh,
                "volume_accessible": volume_accessible,
                "volume_path": volume_path,
            },
            "exchange_rates_debug": exchange_debug,
        }

        return status

    except Exception as e:
        return {"status": "unhealthy", "error": str(e), "timestamp": datetime.now().isoformat()}


# Prefix all routes with /api/v1 to stay consistent with repo conventions
app.include_router(api_router, prefix="/api/v1")


def run_cli_test(test_file: str):
    """Utility used by `python app.py --test <path>` to exercise the main flow without
    spinning up the web-server. Prints the Perplexity API response to stdout.
    """
    try:
        with open(test_file, encoding="utf-8") as f:
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
    parser.add_argument(
        "--test",
        metavar="JSON_PATH",
        nargs="?",
        const="tax_migration_profile_test.json",
        help="Run the full Perplexity pipeline locally using the specified JSON file. If no path is provided, defaults to 'tax_migration_profile_test.json'.",
    )
    parser.add_argument(
        "--output",
        metavar="JSON_PATH",
        nargs="?",
        const="tax_migration_profile_test.json",
        help="Translate the JSON file into the text prompt that would be sent to Perplexity and print to stdout without performing the API call.",
    )
    parser.add_argument(
        "--no-appendix",
        action="store_true",
        help="Omit the raw JSON appendix from the generated prompt.",
    )
    parser.add_argument(
        "--exchange-rates",
        action="store_true",
        help="Fetch latest exchange rates now, print JSON, and exit.",
    )
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
            with open(args.output, encoding="utf-8") as f:
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
