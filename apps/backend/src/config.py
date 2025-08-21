import os


class Config:
    # Railway Environment Information
    RAILWAY_PROJECT_NAME = os.getenv('RAILWAY_PROJECT_NAME', 'basedguide')
    RAILWAY_ENVIRONMENT_NAME = os.getenv('RAILWAY_ENVIRONMENT_NAME', 'production')
    RAILWAY_SERVICE_NAME = os.getenv('RAILWAY_SERVICE_NAME', 'backend')
    RAILWAY_PROJECT_ID = os.getenv('RAILWAY_PROJECT_ID', '')
    RAILWAY_ENVIRONMENT_ID = os.getenv('RAILWAY_ENVIRONMENT_ID', '')
    RAILWAY_SERVICE_ID = os.getenv('RAILWAY_SERVICE_ID', '')
    RAILWAY_PRIVATE_DOMAIN = os.getenv('RAILWAY_PRIVATE_DOMAIN', '')

    # Application Configuration
    SECRET_KEY = os.getenv('SECRET_KEY')
    PORT = int(os.getenv('PORT', 5001))
    HOST = os.getenv('HOST', '0.0.0.0')
    ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')

    # API Keys
    PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY', '').strip()
    OPEN_EXCHANGE_API_KEY = os.getenv('OPEN_EXCHANGE_API_KEY')

    # Perplexity Configuration
    PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"
    PERPLEXITY_MODEL = os.getenv('PERPLEXITY_MODEL', 'sonar-deep-research')
    PERPLEXITY_FALLBACK_MODEL = os.getenv('PERPLEXITY_FALLBACK_MODEL', 'sonar')
    PERPLEXITY_TEMPERATURE = float(os.getenv('PERPLEXITY_TEMPERATURE', '0.2'))
    PERPLEXITY_TOP_P = float(os.getenv('PERPLEXITY_TOP_P', '1'))

    # Exchange Rates Configuration
    EXCHANGE_UPDATE_INTERVAL_HOURS = int(os.getenv('EXCHANGE_UPDATE_INTERVAL_HOURS', 24))

    # CORS Configuration
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000')

    # Railway Volume Path for persistent storage
    RAILWAY_VOLUME_MOUNT_PATH = os.getenv('RAILWAY_VOLUME_MOUNT_PATH', '/app/data')

    # Database Configuration (for future use)
    DATABASE_URL = os.getenv('DATABASE_URL', '')

    @classmethod
    def is_production(cls):
        """Check if running in production environment."""
        return cls.ENVIRONMENT.lower() == 'production' or cls.RAILWAY_ENVIRONMENT_NAME.lower() == 'production'

    @classmethod
    def is_railway(cls):
        """Check if running on Railway."""
        return bool(cls.RAILWAY_PROJECT_ID)

    @classmethod
    def get_service_url(cls):
        """Get the service URL based on environment."""
        if cls.RAILWAY_PRIVATE_DOMAIN:
            return f"https://{cls.RAILWAY_PRIVATE_DOMAIN}"
        return f"http://localhost:{cls.PORT}"
