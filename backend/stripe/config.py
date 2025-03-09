import os
from backend.config import get_settings

settings = get_settings()

STRIPE_SECRET_KEY = settings.STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY', 'your_test_publishable_key')
STRIPE_WEBHOOK_SECRET = settings.STRIPE_WEBHOOK_SECRET

# Price ID for the membership subscription
MEMBERSHIP_PRICE_ID = settings.STRIPE_MEMBERSHIP_PRICE_ID

# Frontend URLs
PAYMENT_SUCCESS_URL = f"{settings.FRONTEND_URL}/payment/success"
PAYMENT_CANCEL_URL = f"{settings.FRONTEND_URL}/payment/cancel" 