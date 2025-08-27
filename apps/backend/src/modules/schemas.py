from __future__ import annotations

"""Pydantic models that represent (a minimal subset of) the expected JSON payload.

We model only the **required** structure that the backend actually needs right
now: personal information, residency intentions and finance.  Everything else
is accepted as arbitrary extra keys so the schema is forward-compatible with
future additions coming from the Next.js frontend.
"""


from pydantic import BaseModel, Field, PositiveFloat, field_validator


class CurrentResidency(BaseModel):
    country: str
    status: str | None = None

    class Config:
        extra = "allow"


class PersonalInformation(BaseModel):
    currentResidency: CurrentResidency
    maritalStatus: str | None = None
    relocationPartner: bool | None = None
    numRelocationDependents: int | None = 0

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
    country: str | None = None
    amount: PositiveFloat
    currency: str = Field(pattern=r"^[A-Z]{3}$", description="ISO-4217 currency code")

    class Config:
        extra = "allow"


class Finance(BaseModel):
    income_situation: str | None = Field(
        None,
        pattern="^(continuing_income|current_and_new_income|seeking_income|gainfully_unemployed|dependent/supported)$",
    )
    incomeSources: list[IncomeSource] = Field(..., min_items=1)

    class Config:
        extra = "allow"


class TaxProfile(BaseModel):
    personalInformation: PersonalInformation
    residencyIntentions: ResidencyIntentions
    finance: Finance

    class Config:
        extra = "allow"

    @field_validator("personalInformation", "residencyIntentions", "finance")
    @classmethod
    def not_null(cls, v):  # noqa: D401
        if v is None:
            raise ValueError("Field must not be null")
        return v


# Section-specific schemas for individual story generation
class SectionRequest(BaseModel):
    """Base schema for individual section story generation requests."""

    section_data: dict
    destination_country: str | None = None  # For currency calculations

    class Config:
        extra = "allow"


class PersonalInformationRequest(BaseModel):
    """Schema for personal information section story generation."""

    personal_information: dict

    class Config:
        extra = "allow"


class EducationRequest(BaseModel):
    """Schema for education section story generation."""

    education: dict
    residency_intentions: dict | None = None

    class Config:
        extra = "allow"


class ResidencyIntentionsRequest(BaseModel):
    """Schema for residency intentions section story generation."""

    residency_intentions: dict

    class Config:
        extra = "allow"


class FinanceRequest(BaseModel):
    """Schema for finance section story generation."""

    finance: dict
    destination_country: str | None = None
    skip_finance_details: bool | None = False

    class Config:
        extra = "allow"


class SocialSecurityRequest(BaseModel):
    """Schema for social security and pensions section story generation."""

    social_security_and_pensions: dict
    destination_country: str | None = None
    skip_finance_details: bool | None = False

    class Config:
        extra = "allow"


class TaxDeductionsRequest(BaseModel):
    """Schema for tax deductions and credits section story generation."""

    tax_deductions_and_credits: dict
    destination_country: str | None = None
    skip_finance_details: bool | None = False

    class Config:
        extra = "allow"


class FutureFinancialPlansRequest(BaseModel):
    """Schema for future financial plans section story generation."""

    future_financial_plans: dict
    destination_country: str | None = None
    skip_finance_details: bool | None = False

    class Config:
        extra = "allow"


class AdditionalInformationRequest(BaseModel):
    """Schema for additional information section story generation."""

    additional_information: dict

    class Config:
        extra = "allow"


class SummaryRequest(BaseModel):
    """Schema for complete summary story generation."""

    profile: dict

    class Config:
        extra = "allow"
