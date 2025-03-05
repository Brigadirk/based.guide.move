from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ProfileBase(BaseModel):
    nickname: str
    avatar: Optional[str] = None
    date_of_birth: Optional[str] = None
    nationalities: List[Dict[str, Any]] = []
    marital_status: Optional[str] = None
    current_residency: Optional[Dict[str, str]] = None
    income_sources: List[Dict[str, Any]] = []
    assets: List[Dict[str, Any]] = []
    liabilities: List[Dict[str, Any]] = []
    dependents: List[Dict[str, Any]] = []
    special_circumstances: Optional[str] = None
    partner_info: Optional[Dict[str, Any]] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    nickname: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 