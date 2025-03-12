from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional, Annotated, List, Dict, Any
from backend.database import get_db
from backend.models import User, Session as UserSession, CountryAnalysis, UserProfile
from backend.auth.utils import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_user
)
import uuid
from pydantic import BaseModel, EmailStr, constr, Field
from datetime import datetime
import stripe
from backend.stripe.config import (
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    MEMBERSHIP_PRICE_ID,
    PAYMENT_SUCCESS_URL,
    PAYMENT_CANCEL_URL
)

# Initialize Stripe with our secret key
stripe.api_key = STRIPE_SECRET_KEY

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

# Profile-related Pydantic models
class Nationality(BaseModel):
    country: str

class CurrentResidency(BaseModel):
    country: str
    status: str

class PersonalInformation(BaseModel):
    dateOfBirth: Optional[str] = None
    nationalities: List[Nationality] = Field(default_factory=list)
    maritalStatus: Optional[str] = None
    currentResidency: Optional[CurrentResidency] = None

class IncomeSource(BaseModel):
    type: str
    details: Dict[str, Any] = Field(default_factory=dict)
    amount: float
    currency: str

class Asset(BaseModel):
    type: str
    location: Optional[str] = None
    value: float
    currency: str

class Liability(BaseModel):
    type: str
    amount: float
    currency: str

class FinancialInformation(BaseModel):
    incomeSources: List[IncomeSource] = Field(default_factory=list)
    assets: List[Asset] = Field(default_factory=list)
    liabilities: List[Liability] = Field(default_factory=list)

class ResidencyIntentions(BaseModel):
    moveType: Optional[str] = None
    intendedCountry: Optional[str] = None
    durationOfStay: Optional[str] = None
    preferredMaximumStayRequirement: Optional[str] = None
    notes: Optional[str] = None

class Dependent(BaseModel):
    name: str
    relationship: str
    age: int

class Profile(BaseModel):
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    personalInformation: Optional[PersonalInformation] = None
    financialInformation: Optional[FinancialInformation] = None
    residencyIntentions: Optional[ResidencyIntentions] = None
    dependents: List[Dependent] = Field(default_factory=list)
    specialCircumstances: Optional[str] = None
    partner: Optional[Dict[str, Any]] = None

class ProfileResponse(BaseModel):
    id: str
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    personalInformation: Optional[PersonalInformation] = None
    financialInformation: Optional[FinancialInformation] = None
    residencyIntentions: Optional[ResidencyIntentions] = None
    dependents: List[Dependent] = Field(default_factory=list)
    specialCircumstances: Optional[str] = None
    partner: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# Add a model for request validation
class RegisterRequest(BaseModel):
    email: EmailStr

class UserResponse(BaseModel):
    id: str
    email: str
    is_member: bool
    analysis_tokens: int
    analyzed_countries: List[CountryAnalysisResponse] = Field(default_factory=list)
    profiles: List[ProfileResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True

# Add a model for set password request
class SetPasswordRequest(BaseModel):
    email: EmailStr
    password: Annotated[str, constr(min_length=8)]

def transform_profile(profile: UserProfile) -> Dict[str, Any]:
    """Transform database model to API response format"""
    return {
        'id': profile.id,
        'nickname': profile.nickname,
        'avatar': profile.avatar,
        'personalInformation': {
            'dateOfBirth': profile.date_of_birth,
            'nationalities': profile.nationalities,
            'maritalStatus': profile.marital_status,
            'currentResidency': profile.current_residency
        } if profile.date_of_birth or profile.nationalities or profile.marital_status or profile.current_residency else None,
        'financialInformation': {
            'incomeSources': profile.income_sources,
            'assets': profile.assets,
            'liabilities': profile.liabilities
        } if profile.income_sources or profile.assets or profile.liabilities else None,
        'residencyIntentions': {
            'moveType': profile.move_type,
            'intendedCountry': profile.intended_country,
            'durationOfStay': profile.duration_of_stay,
            'preferredMaximumStayRequirement': profile.preferred_maximum_stay_requirement,
            'notes': profile.residency_notes
        } if profile.move_type or profile.intended_country or profile.duration_of_stay else None,
        'dependents': profile.dependents or [],
        'specialCircumstances': profile.special_circumstances,
        'partner': profile.partner_info
    }

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

    try:
        # Create temporary user without password
        temp_user = User(
            id=str(uuid.uuid4()),
            email=data.email,
            is_member=False,  # Will be set to True after successful payment
            email_verified=False  # Using the correct field name
        )
        db.add(temp_user)
        db.commit()
        db.refresh(temp_user)
        
        # Create Stripe checkout session using the latest API
        session = stripe.checkout.Session.create(
            customer_email=data.email,
            client_reference_id=temp_user.id,
            payment_method_types=['card'],
            line_items=[{
                'price': MEMBERSHIP_PRICE_ID,
                'quantity': 1,
            }],
            mode='payment',
            success_url=PAYMENT_SUCCESS_URL + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=PAYMENT_CANCEL_URL,
            metadata={
                'temp_user_id': temp_user.id
            }
        )
        
        return {
            "checkout_url": session.url,
            "temp_user_id": temp_user.id
        }
    except Exception as e:
        print(f"Error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/set-password")
async def set_password(
    data: SetPasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Set the password
    user.hashed_password = get_password_hash(data.password)
    db.commit()

    return {"message": "Password set successfully"}

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password not set"
        )

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Create a new session
    session = UserSession(
        id=str(uuid.uuid4()),
        user_id=user.id,
        expires_at=datetime.utcnow()  # This will be updated by the token creation
    )
    db.add(session)
    db.commit()

    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "session": session.id}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "is_member": user.is_member
        }
    }

@router.post("/profiles")
async def create_profile(
    profile_data: Profile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create new profile
    new_profile = UserProfile(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        nickname=profile_data.nickname,
        avatar=profile_data.avatar,
        # Personal Information
        date_of_birth=profile_data.personalInformation.dateOfBirth if profile_data.personalInformation else None,
        nationalities=profile_data.personalInformation.nationalities if profile_data.personalInformation else None,
        marital_status=profile_data.personalInformation.maritalStatus if profile_data.personalInformation else None,
        current_residency=profile_data.personalInformation.currentResidency.dict() if profile_data.personalInformation and profile_data.personalInformation.currentResidency else None,
        # Financial Information
        income_sources=[source.dict() for source in profile_data.financialInformation.incomeSources] if profile_data.financialInformation else None,
        assets=[asset.dict() for asset in profile_data.financialInformation.assets] if profile_data.financialInformation else None,
        liabilities=[liability.dict() for liability in profile_data.financialInformation.liabilities] if profile_data.financialInformation else None,
        # Residency Intentions
        move_type=profile_data.residencyIntentions.moveType if profile_data.residencyIntentions else None,
        intended_country=profile_data.residencyIntentions.intendedCountry if profile_data.residencyIntentions else None,
        duration_of_stay=profile_data.residencyIntentions.durationOfStay if profile_data.residencyIntentions else None,
        preferred_maximum_stay_requirement=profile_data.residencyIntentions.preferredMaximumStayRequirement if profile_data.residencyIntentions else None,
        residency_notes=profile_data.residencyIntentions.notes if profile_data.residencyIntentions else None,
        # Other fields
        dependents=[dependent.dict() for dependent in profile_data.dependents] if profile_data.dependents else None,
        special_circumstances=profile_data.specialCircumstances,
        partner_info=profile_data.partner
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return transform_profile(new_profile)

@router.put("/profiles/{profile_id}")
async def update_profile(
    profile_id: str,
    profile_data: Profile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get the specific profile
    profile = db.query(UserProfile).filter(
        UserProfile.id == profile_id,
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    # Update profile fields
    profile.nickname = profile_data.nickname
    profile.avatar = profile_data.avatar

    # Update Personal Information
    if profile_data.personalInformation:
        profile.date_of_birth = profile_data.personalInformation.dateOfBirth
        profile.nationalities = profile_data.personalInformation.nationalities
        profile.marital_status = profile_data.personalInformation.maritalStatus
        profile.current_residency = profile_data.personalInformation.currentResidency.dict() if profile_data.personalInformation.currentResidency else None
    else:
        profile.date_of_birth = None
        profile.nationalities = None
        profile.marital_status = None
        profile.current_residency = None

    # Update Financial Information
    if profile_data.financialInformation:
        profile.income_sources = [source.dict() for source in profile_data.financialInformation.incomeSources]
        profile.assets = [asset.dict() for asset in profile_data.financialInformation.assets]
        profile.liabilities = [liability.dict() for liability in profile_data.financialInformation.liabilities]
    else:
        profile.income_sources = None
        profile.assets = None
        profile.liabilities = None

    # Update Residency Intentions
    if profile_data.residencyIntentions:
        profile.move_type = profile_data.residencyIntentions.moveType
        profile.intended_country = profile_data.residencyIntentions.intendedCountry
        profile.duration_of_stay = profile_data.residencyIntentions.durationOfStay
        profile.preferred_maximum_stay_requirement = profile_data.residencyIntentions.preferredMaximumStayRequirement
        profile.residency_notes = profile_data.residencyIntentions.notes
    else:
        profile.move_type = None
        profile.intended_country = None
        profile.duration_of_stay = None
        profile.preferred_maximum_stay_requirement = None
        profile.residency_notes = None

    # Update other fields
    profile.dependents = [dependent.dict() for dependent in profile_data.dependents] if profile_data.dependents else None
    profile.special_circumstances = profile_data.specialCircumstances
    profile.partner_info = profile_data.partner

    db.commit()
    db.refresh(profile)

    return transform_profile(profile)

@router.delete("/profiles/{profile_id}")
async def delete_profile(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get the specific profile
    profile = db.query(UserProfile).filter(
        UserProfile.id == profile_id,
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    # Delete the profile
    db.delete(profile)
    db.commit()

    return {"message": "Profile deleted successfully"}

@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get user's analyses
    analyses = db.query(CountryAnalysis).filter(
        CountryAnalysis.user_id == current_user.id
    ).all()

    # Get user's profiles
    profiles = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).all()

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        is_member=current_user.is_member,
        analysis_tokens=current_user.analysis_tokens,
        analyzed_countries=[CountryAnalysisResponse.from_orm(a) for a in analyses],
        profiles=[ProfileResponse.from_orm(p) for p in profiles]
    ) 