from __future__ import annotations

"""Pydantic models that represent (a minimal subset of) the expected JSON payload.

We model only the **required** structure that the backend actually needs right
now: personal information, residency intentions and finance.  Everything else
is accepted as arbitrary extra keys so the schema is forward-compatible with
future additions coming from the Next.js frontend.
"""

from typing import Dict, List, Optional

from pydantic import BaseModel, Field, PositiveFloat, field_validator


class CurrentResidency(BaseModel):
    country: str
    status: Optional[str] = None

    class Config:
        extra = "allow"


class PersonalInformation(BaseModel):
    currentResidency: CurrentResidency
    maritalStatus: Optional[str] = None
    relocationPartner: Optional[bool] = None
    numRelocationDependents: Optional[int] = 0

    class Config:
        extra = "allow"


class DestinationCountry(BaseModel):
    country: str

    class Config:
        extra = "allow"


class ResidencyIntentions(BaseModel):
    destinationCountry: DestinationCountry

    class Config:
        extra = "allow"


class IncomeSource(BaseModel):
    category: str
    country: Optional[str] = None
    amount: PositiveFloat
    currency: str = Field(pattern=r"^[A-Z]{3}$", description="ISO-4217 currency code")

    class Config:
        extra = "allow"


class Finance(BaseModel):
    income_situation: Optional[str] = Field(None, pattern="^(continuing_income|current_and_new_income|seeking_income|gainfully_unemployed|dependent/supported)$")
    incomeSources: List[IncomeSource] = Field(..., min_items=1)

    class Config:
        extra = "allow"


class TaxProfile(BaseModel):
    personalInformation: PersonalInformation
    residencyIntentions: ResidencyIntentions
    finance: Finance

    class Config:
        extra = "allow"

    @field_validator("personalInformation", "residencyIntentions", "finance")
    def not_null(cls, v):  # noqa: D401
        if v is None:
            raise ValueError("Field must not be null")
        return v


# Section-specific schemas for individual story generation
class SectionRequest(BaseModel):
    """Base schema for individual section story generation requests."""
    section_data: Dict
    destination_country: Optional[str] = None  # For currency calculations
    
    class Config:
        extra = "allow"


class PersonalInformationRequest(BaseModel):
    """Schema for personal information section story generation."""
    personal_information: Dict
    
    class Config:
        extra = "allow"


class EducationRequest(BaseModel):
    """Schema for education section story generation."""
    education: Dict
    
    class Config:
        extra = "allow"


class ResidencyIntentionsRequest(BaseModel):
    """Schema for residency intentions section story generation."""
    residency_intentions: Dict
    
    class Config:
        extra = "allow"


class FinanceRequest(BaseModel):
    """Schema for finance section story generation."""
    finance: Dict
    destination_country: Optional[str] = None
    
    class Config:
        extra = "allow"


class SocialSecurityRequest(BaseModel):
    """Schema for social security and pensions section story generation."""
    social_security_and_pensions: Dict
    destination_country: Optional[str] = None
    skip_finance_details: Optional[bool] = False
    
    class Config:
        extra = "allow"


class TaxDeductionsRequest(BaseModel):
    """Schema for tax deductions and credits section story generation."""
    tax_deductions_and_credits: Dict
    destination_country: Optional[str] = None
    skip_finance_details: Optional[bool] = False
    
    class Config:
        extra = "allow"


class FutureFinancialPlansRequest(BaseModel):
    """Schema for future financial plans section story generation."""
    future_financial_plans: Dict
    destination_country: Optional[str] = None
    skip_finance_details: Optional[bool] = False
    
    class Config:
        extra = "allow"


class AdditionalInformationRequest(BaseModel):
    """Schema for additional information section story generation."""
    additional_information: Dict
    
    class Config:
        extra = "allow"


class SummaryRequest(BaseModel):
    """Schema for complete summary story generation."""
    profile: Dict
    
    class Config:
        extra = "allow" 