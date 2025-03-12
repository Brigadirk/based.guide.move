from pydantic_settings import BaseSettings
import os
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"  # JWT encoding algorithm
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    STRIPE_MEMBERSHIP_PRICE_ID: str

    class Config:
        env_file = [".env", "backend/.env"]
        env_file_encoding = "utf-8"
        extra = "allow"  # Allow extra fields in environment variables

# Print current directory and env file existence for debugging
print("Current directory:", os.getcwd())
print("Env file exists:", os.path.exists(".env") or os.path.exists("backend/.env"))
print("Environment variables:")
settings = Settings()
print("DATABASE_URL:", settings.DATABASE_URL)
print("SECRET_KEY:", settings.SECRET_KEY)
print("STRIPE_SECRET_KEY:", settings.STRIPE_SECRET_KEY)
print("STRIPE_WEBHOOK_SECRET:", settings.STRIPE_WEBHOOK_SECRET)
print("STRIPE_MEMBERSHIP_PRICE_ID:", settings.STRIPE_MEMBERSHIP_PRICE_ID)

@lru_cache()
def get_settings():
    return Settings() 