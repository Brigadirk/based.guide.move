from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional, Annotated, List
from backend.database import get_db
from backend.models import User, Session as UserSession, CountryAnalysis
from backend.auth.utils import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_user
)
import uuid
from pydantic import BaseModel, EmailStr, constr
from datetime import datetime

router = APIRouter()

# Add models for response validation
class CountryAnalysisResponse(BaseModel):
    country_id: str
    personal_tax_rate: Optional[int]
    corporate_tax_rate: Optional[int]
    visa_eligibility: Optional[bool]
    recommended_visa_type: Optional[str]
    cost_of_living_adjusted: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: str
    email: str
    is_member: bool
    analysis_tokens: int
    analyzed_countries: List[CountryAnalysisResponse]

    class Config:
        from_attributes = True

# Add a model for request validation
class RegisterRequest(BaseModel):
    email: EmailStr
    password: Annotated[str, constr(min_length=8)]
    first_name: str | None = None
    last_name: str | None = None

@router.post("/register")
async def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    print("Received registration data:", data.dict())
    
    # Check if user exists
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Password strength validation (you might want to add more rules)
    if not any(c.isupper() for c in data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter"
        )
    if not any(c.islower() for c in data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter"
        )
    if not any(c.isdigit() for c in data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one number"
        )

    try:
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            email=data.email,
            password_hash=get_password_hash(data.password),
            first_name=data.first_name,
            last_name=data.last_name
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create access token
        access_token = create_access_token(data={"sub": user.id})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        print(f"Error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Get user's analyses
    analyses = db.query(CountryAnalysis).filter(CountryAnalysis.user_id == user.id).all()
    
    access_token = create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user.id,
            email=user.email,
            is_member=user.is_member,
            analysis_tokens=user.analysis_tokens,
            analyzed_countries=analyses
        )
    }

@router.get("/me")
async def get_current_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get user's analyses
    analyses = db.query(CountryAnalysis).filter(CountryAnalysis.user_id == current_user.id).all()
    
    return {
        "user": UserResponse(
            id=current_user.id,
            email=current_user.email,
            is_member=current_user.is_member,
            analysis_tokens=current_user.analysis_tokens,
            analyzed_countries=analyses
        )
    } 