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
    password: Annotated[str, constr(min_length=8)]
    first_name: str | None = None
    last_name: str | None = None

class UserResponse(BaseModel):
    id: str
    email: str
    is_member: bool
    analysis_tokens: int
    analyzed_countries: List[CountryAnalysisResponse] = Field(default_factory=list)
    profiles: List[ProfileResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True

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
    try:
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user or not verify_password(form_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Get user's analyses
        analyses = db.query(CountryAnalysis).filter(CountryAnalysis.user_id == user.id).all()
        
        # Get all user's profiles
        profiles = db.query(UserProfile).filter(UserProfile.user_id == user.id).all()
        
        # Convert profiles to ProfileResponse if they exist
        profile_responses = [ProfileResponse.model_validate(profile) for profile in profiles] if profiles else []
        
        access_token = create_access_token(data={"sub": user.id})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=user.id,
                email=user.email,
                is_member=user.is_member,
                analysis_tokens=user.analysis_tokens,
                analyzed_countries=analyses,
                profiles=profile_responses
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request"
        )

@router.post("/profiles")
async def create_profile(
    profile_data: Profile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print("Received profile data:", profile_data.model_dump())
    try:
        # Convert camelCase to snake_case for database
        profile_dict = {
            "nickname": profile_data.nickname,
            "avatar": profile_data.avatar
        }
        
        if profile_data.personalInformation:
            profile_dict.update({
                "date_of_birth": profile_data.personalInformation.dateOfBirth,
                "nationalities": [n.model_dump() for n in profile_data.personalInformation.nationalities],
                "marital_status": profile_data.personalInformation.maritalStatus,
                "current_residency": profile_data.personalInformation.currentResidency.model_dump() if profile_data.personalInformation.currentResidency else None,
            })
            
        if profile_data.financialInformation:
            profile_dict.update({
                "income_sources": [s.model_dump() for s in profile_data.financialInformation.incomeSources],
                "assets": [a.model_dump() for a in profile_data.financialInformation.assets],
                "liabilities": [l.model_dump() for l in profile_data.financialInformation.liabilities],
            })
            
        if profile_data.residencyIntentions:
            profile_dict.update({
                "move_type": profile_data.residencyIntentions.moveType,
                "intended_country": profile_data.residencyIntentions.intendedCountry,
                "duration_of_stay": profile_data.residencyIntentions.durationOfStay,
                "preferred_maximum_stay_requirement": profile_data.residencyIntentions.preferredMaximumStayRequirement,
                "residency_notes": profile_data.residencyIntentions.notes,
            })
            
        profile_dict.update({
            "dependents": [d.model_dump() for d in profile_data.dependents] if profile_data.dependents else [],
            "special_circumstances": profile_data.specialCircumstances,
            "partner_info": profile_data.partner
        })
        
    except Exception as e:
        print("Validation error details:", str(e))
        raise HTTPException(status_code=422, detail=str(e))

    # Create new profile
    profile = UserProfile(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        **profile_dict
    )
    db.add(profile)

    try:
        db.commit()
        db.refresh(profile)
    except Exception as e:
        print("Error saving profile:", str(e))
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    # Get user's analyses for the response
    analyses = db.query(CountryAnalysis).filter(CountryAnalysis.user_id == current_user.id).all()
    
    # Get all user's profiles
    profiles = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).all()
    profile_responses = [transform_profile(p) for p in profiles]

    return {
        "user": UserResponse(
            id=current_user.id,
            email=current_user.email,
            is_member=current_user.is_member,
            analysis_tokens=current_user.analysis_tokens,
            analyzed_countries=analyses,
            profiles=profile_responses
        )
    }

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

    try:
        # Convert camelCase to snake_case for database
        profile_dict = {
            "nickname": profile_data.nickname,
            "avatar": profile_data.avatar
        }
        
        if profile_data.personalInformation:
            profile_dict.update({
                "date_of_birth": profile_data.personalInformation.dateOfBirth,
                "nationalities": [n.model_dump() for n in profile_data.personalInformation.nationalities],
                "marital_status": profile_data.personalInformation.maritalStatus,
                "current_residency": profile_data.personalInformation.currentResidency.model_dump() if profile_data.personalInformation.currentResidency else None,
            })
            
        if profile_data.financialInformation:
            profile_dict.update({
                "income_sources": [s.model_dump() for s in profile_data.financialInformation.incomeSources],
                "assets": [a.model_dump() for a in profile_data.financialInformation.assets],
                "liabilities": [l.model_dump() for l in profile_data.financialInformation.liabilities],
            })
            
        if profile_data.residencyIntentions:
            profile_dict.update({
                "move_type": profile_data.residencyIntentions.moveType,
                "intended_country": profile_data.residencyIntentions.intendedCountry,
                "duration_of_stay": profile_data.residencyIntentions.durationOfStay,
                "preferred_maximum_stay_requirement": profile_data.residencyIntentions.preferredMaximumStayRequirement,
                "residency_notes": profile_data.residencyIntentions.notes,
            })
            
        profile_dict.update({
            "dependents": [d.model_dump() for d in profile_data.dependents] if profile_data.dependents else [],
            "special_circumstances": profile_data.specialCircumstances,
            "partner_info": profile_data.partner
        })

        # Update profile fields
        for key, value in profile_dict.items():
            setattr(profile, key, value)

        db.commit()
        db.refresh(profile)
    except Exception as e:
        print("Error updating profile:", str(e))
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    # Get user's analyses for the response
    analyses = db.query(CountryAnalysis).filter(CountryAnalysis.user_id == current_user.id).all()
    
    # Get all user's profiles
    profiles = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).all()
    profile_responses = [transform_profile(p) for p in profiles]

    return {
        "user": UserResponse(
            id=current_user.id,
            email=current_user.email,
            is_member=current_user.is_member,
            analysis_tokens=current_user.analysis_tokens,
            analyzed_countries=analyses,
            profiles=profile_responses
        )
    }

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

    try:
        db.delete(profile)
        db.commit()
    except Exception as e:
        print("Error deleting profile:", str(e))
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    # Get user's analyses for the response
    analyses = db.query(CountryAnalysis).filter(CountryAnalysis.user_id == current_user.id).all()
    
    # Get remaining profiles
    profiles = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).all()
    profile_responses = [transform_profile(p) for p in profiles]

    return {
        "user": UserResponse(
            id=current_user.id,
            email=current_user.email,
            is_member=current_user.is_member,
            analysis_tokens=current_user.analysis_tokens,
            analyzed_countries=analyses,
            profiles=profile_responses
        )
    }

@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get user's analyses
    analyses = db.query(CountryAnalysis).filter(CountryAnalysis.user_id == current_user.id).all()
    
    # Get all user's profiles
    profiles = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).all()
    
    # Convert profiles to ProfileResponse if they exist
    profile_responses = [transform_profile(p) for p in profiles] if profiles else []
    
    return {
        "user": UserResponse(
            id=current_user.id,
            email=current_user.email,
            is_member=current_user.is_member,
            analysis_tokens=current_user.analysis_tokens,
            analyzed_countries=analyses,
            profiles=profile_responses
        )
    } 