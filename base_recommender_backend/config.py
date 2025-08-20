import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY', '').strip()
    PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"
    # Model & generation params (can be overridden via environment variables)
    PERPLEXITY_MODEL = os.getenv('PERPLEXITY_MODEL', 'sonar-deep-research')
    PERPLEXITY_FALLBACK_MODEL = os.getenv('PERPLEXITY_FALLBACK_MODEL', 'sonar')
    PERPLEXITY_TEMPERATURE = float(os.getenv('PERPLEXITY_TEMPERATURE', '0.2'))
    PERPLEXITY_TOP_P = float(os.getenv('PERPLEXITY_TOP_P', '1'))
    OPEN_EXCHANGE_API_KEY = os.getenv('OPEN_EXCHANGE_API_KEY')
    # Frequency (in hours) after which fresh exchange rates should be fetched
    EXCHANGE_UPDATE_INTERVAL_HOURS = int(os.getenv('EXCHANGE_UPDATE_INTERVAL_HOURS', 24))
