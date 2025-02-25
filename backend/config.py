from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

# Load .env file
print("Current working directory:", os.getcwd())
env_path = os.path.join(os.getcwd(), 'backend', '.env')
print("Looking for .env file at:", env_path)
load_dotenv(env_path)

# Debug: Print environment variables
print("DATABASE_URL:", os.getenv("DATABASE_URL"))
print("SECRET_KEY:", os.getenv("SECRET_KEY"))

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings() 