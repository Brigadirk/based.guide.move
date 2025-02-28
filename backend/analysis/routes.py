from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from backend.database import get_db
from backend.models import User, CountryAnalysis
from backend.auth.utils import get_current_user
import uuid
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class CreateAnalysisRequest(BaseModel):
    country_id: str
    analysis_inputs: Dict[str, Any]

class AnalysisResponse(BaseModel):
    id: str
    country_id: str
    personal_tax_rate: Optional[int]
    corporate_tax_rate: Optional[int]
    visa_eligibility: Optional[bool]
    recommended_visa_type: Optional[str]
    cost_of_living_adjusted: Optional[int]
    analysis_inputs: Dict[str, Any]
    analysis_results: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.post("/{country_id}", response_model=AnalysisResponse)
async def create_analysis(
    country_id: str,
    data: CreateAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user has enough tokens
    if current_user.analysis_tokens <= 0 and not current_user.is_member:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Not enough analysis tokens"
        )
    
    # Check if analysis already exists
    existing_analysis = db.query(CountryAnalysis).filter(
        CountryAnalysis.user_id == current_user.id,
        CountryAnalysis.country_id == country_id
    ).first()
    
    if existing_analysis:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Analysis already exists for this country"
        )
    
    # TODO: Implement actual analysis logic here
    # This would call your tax calculation service
    analysis_results = {
        "summary": "Placeholder for detailed analysis",
        "recommendations": []
    }
    
    # Create new analysis
    analysis = CountryAnalysis(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        country_id=country_id,
        analysis_inputs=data.analysis_inputs,
        analysis_results=analysis_results,
        # These would be calculated by your analysis service
        personal_tax_rate=25,  # placeholder
        corporate_tax_rate=20,  # placeholder
        visa_eligibility=True,  # placeholder
        recommended_visa_type="digital_nomad",  # placeholder
        cost_of_living_adjusted=2500  # placeholder
    )
    
    # Deduct token if user is not a member
    if not current_user.is_member:
        current_user.analysis_tokens -= 1
    
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    return analysis

@router.get("/{country_id}", response_model=AnalysisResponse)
async def get_analysis(
    country_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(CountryAnalysis).filter(
        CountryAnalysis.user_id == current_user.id,
        CountryAnalysis.country_id == country_id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    return analysis

@router.get("/", response_model=list[AnalysisResponse])
async def list_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analyses = db.query(CountryAnalysis).filter(
        CountryAnalysis.user_id == current_user.id
    ).all()
    
    return analyses 