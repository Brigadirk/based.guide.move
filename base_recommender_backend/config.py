import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')
    PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"
