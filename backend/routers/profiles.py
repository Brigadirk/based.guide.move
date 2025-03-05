from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import User, UserProfile
from backend.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from backend.dependencies import get_current_user

router = APIRouter()

@router.post("/profiles", response_model=ProfileResponse)
def create_profile(
    profile: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new profile for the current user"""
    db_profile = UserProfile(
        user_id=current_user.id,
        nickname=profile.nickname,
        avatar=profile.avatar,
        date_of_birth=profile.date_of_birth,
        nationalities=profile.nationalities,
        marital_status=profile.marital_status,
        current_residency=profile.current_residency,
        income_sources=profile.income_sources,
        assets=profile.assets,
        liabilities=profile.liabilities,
        dependents=profile.dependents,
        special_circumstances=profile.special_circumstances,
        partner_info=profile.partner_info
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.get("/profiles", response_model=List[ProfileResponse])
def get_profiles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all profiles for the current user"""
    return db.query(UserProfile).filter(UserProfile.user_id == current_user.id).all()

@router.get("/profiles/{profile_id}", response_model=ProfileResponse)
def get_profile(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific profile by ID"""
    profile = db.query(UserProfile).filter(
        UserProfile.id == profile_id,
        UserProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/profiles/{profile_id}", response_model=ProfileResponse)
def update_profile(
    profile_id: str,
    profile_update: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a specific profile"""
    db_profile = db.query(UserProfile).filter(
        UserProfile.id == profile_id,
        UserProfile.user_id == current_user.id
    ).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Update profile fields
    for field, value in profile_update.dict(exclude_unset=True).items():
        setattr(db_profile, field, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.delete("/profiles/{profile_id}")
def delete_profile(
    profile_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific profile"""
    db_profile = db.query(UserProfile).filter(
        UserProfile.id == profile_id,
        UserProfile.user_id == current_user.id
    ).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    db.delete(db_profile)
    db.commit()
    return {"message": "Profile deleted successfully"} 