from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Payment
from backend.stripe.config import (
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    MEMBERSHIP_PRICE_ID,
    PAYMENT_SUCCESS_URL,
    PAYMENT_CANCEL_URL
)
import stripe
from typing import Optional
import json
from pydantic import BaseModel
import secrets
import string
from backend.auth.utils import get_password_hash

router = APIRouter()
stripe.api_key = STRIPE_SECRET_KEY

@router.post("/create-checkout-session")
async def create_checkout_session(
    email: str,
    temp_user_id: str,
    db: Session = Depends(get_db)
):
    try:
        # Create a new checkout session
        checkout_session = stripe.checkout.Session.create(
            customer_email=email,
            client_reference_id=temp_user_id,
            payment_method_types=['card'],
            line_items=[{
                'price': MEMBERSHIP_PRICE_ID,
                'quantity': 1,
            }],
            mode='payment',
            success_url=PAYMENT_SUCCESS_URL + f"?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=PAYMENT_CANCEL_URL,
            metadata={
                'temp_user_id': temp_user_id
            }
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    try:
        # Get the webhook data
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Handle the event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            
            # Get the temporary user ID from metadata
            temp_user_id = session.get('metadata', {}).get('temp_user_id')
            if not temp_user_id:
                raise HTTPException(status_code=400, detail="No temp_user_id found")
            
            # Get the customer ID and payment intent
            customer_id = session.get('customer')
            payment_intent = session.get('payment_intent')
            
            # Update the user record
            user = db.query(User).filter(User.id == temp_user_id).first()
            if user:
                user.stripe_customer_id = customer_id
                user.is_member = True
                
                # Create payment record
                payment = Payment(
                    user_id=user.id,
                    stripe_payment_id=payment_intent,
                    amount=session.get('amount_total'),
                    currency=session.get('currency'),
                    status='succeeded',
                    payment_method='card'
                )
                db.add(payment)
                db.commit()
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/subscription-status/{user_id}")
async def get_subscription_status(
    user_id: str,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.subscription_id:
        return {"status": "no_subscription"}
    
    try:
        subscription = stripe.Subscription.retrieve(user.subscription_id)
        return {"status": subscription.status}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

class VerifySessionRequest(BaseModel):
    session_id: str

def generate_temp_password(length=12):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

@router.post("/verify-session")
async def verify_session(
    data: VerifySessionRequest,
    db: Session = Depends(get_db)
):
    try:
        print(f"Verifying session: {data.session_id}")
        # Retrieve the session from Stripe
        session = stripe.checkout.Session.retrieve(data.session_id)
        print(f"Retrieved session from Stripe: {session}")
        
        # Get the temporary user ID from metadata
        temp_user_id = session.get('metadata', {}).get('temp_user_id')
        print(f"Temp user ID from metadata: {temp_user_id}")
        if not temp_user_id:
            raise HTTPException(status_code=400, detail="No temp_user_id found")
        
        # Get the user
        user = db.query(User).filter(User.id == temp_user_id).first()
        print(f"Found user: {user.email if user else None}")
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Set user as member
        user.is_member = True
        db.commit()
        
        # Return user email
        return {"email": user.email}
    except Exception as e:
        print(f"Error in verify-session: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e)) 