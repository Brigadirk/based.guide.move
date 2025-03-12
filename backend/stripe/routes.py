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
        body = await request.body()
        sig_header = request.headers.get("stripe-signature")

        try:
            event = stripe.Webhook.construct_event(
                body,
                sig_header,
                STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            raise HTTPException(status_code=400, detail="Invalid signature")

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            temp_user_id = session["metadata"]["temp_user_id"]

            # Update user's membership status
            user = db.query(User).filter(User.id == temp_user_id).first()
            if user:
                user.is_member = True
                user.analysis_tokens = 5  # Give them 5 tokens to start with

                # Create payment record
                payment = Payment(
                    id=session["id"],
                    user_id=user.id,
                    amount=session["amount_total"],
                    currency=session["currency"],
                    status=session["payment_status"]
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "is_member": user.is_member,
        "analysis_tokens": user.analysis_tokens
    }

class VerifySessionRequest(BaseModel):
    session_id: str

def generate_temp_password(length=12):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for i in range(length))

@router.post("/verify-session")
async def verify_session(
    data: VerifySessionRequest,
    db: Session = Depends(get_db)
):
    try:
        # Retrieve the session from Stripe
        session = stripe.checkout.Session.retrieve(data.session_id)
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        if session.payment_status != "paid":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment not completed"
            )
        
        # Get the user from our database
        user = db.query(User).filter(User.id == session.metadata["temp_user_id"]).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update user status if not already done by webhook
        if not user.is_member:
            user.is_member = True
            user.analysis_tokens = 5  # Give them 5 tokens to start with
            db.commit()
        
        return {
            "status": "success",
            "user": {
                "id": user.id,
                "email": user.email,
                "is_member": user.is_member,
                "analysis_tokens": user.analysis_tokens
            }
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 