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