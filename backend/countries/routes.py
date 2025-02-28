from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Dict, Any, Optional
from backend.database import get_db
from backend.models import CountryProfile
from pydantic import BaseModel

router = APIRouter()

class CountryResponse(BaseModel):
    id: str
    name: str
    taxScore: int
    visaAccessibility: int
    population: int
    gdpPerCapita: float
    majorCities: List[Dict[str, Any]]
    livingCost: int
    taxDescription: str
    livingCostDescription: str
    qualityOfLifeDescription: str
    taxHighlights: Dict[str, str]
    avgTemperature: Optional[float] = None
    climateType: Optional[str] = None

    class Config:
        from_attributes = True

class CountryDetailsResponse(CountryResponse):
    overview: Dict[str, str]
    tax_rates: Dict[str, Any]
    digital_nomad_visa: Dict[str, Any] | None

    class Config:
        from_attributes = True

def transform_country_data(country: CountryProfile) -> Dict[str, Any]:
    """Transform database model to API response format"""
    try:
        # Get the highest and lowest tax rates
        tax_rates = country.personal_income_tax.get('rate', [])
        max_income_tax_rate = max(
            float(rate['rate'].replace('%', ''))
            for rate in tax_rates
            if rate['rate'].replace('%', '').replace('.', '').isdigit()
        ) if tax_rates else 0
        min_income_tax_rate = min(
            float(rate['rate'].replace('%', ''))
            for rate in tax_rates
            if rate['rate'].replace('%', '').replace('.', '').isdigit()
        ) if tax_rates else 0

        return {
            'id': country.id,
            'name': country.name,
            'taxScore': country.based_score,
            'visaAccessibility': country.visa_accessibility,
            'population': country.population,
            'gdpPerCapita': country.gdp_per_capita,
            'majorCities': country.major_cities,
            'livingCost': country.living_cost,
            'taxDescription': country.tax_description,
            'livingCostDescription': country.living_cost_description,
            'qualityOfLifeDescription': country.quality_of_life_description,
            'avgTemperature': country.avg_temperature,
            'climateType': country.climate_type,
            'taxHighlights': {
                'personalIncomeTax': f"{min_income_tax_rate}% - {max_income_tax_rate}%",
                'corporateTax': country.corporate_tax.get('rate', 'Varies'),
                'vatRate': country.vat_gst.get('rate', 'Varies')
            }
        }
    except Exception as e:
        print(f"Error transforming data for {country.id}: {str(e)}")
        return {
            'id': country.id,
            'name': country.name,
            'taxScore': 75,
            'visaAccessibility': 50,
            'population': 0,
            'gdpPerCapita': 0,
            'majorCities': [],
            'livingCost': 2500,
            'taxDescription': 'Information currently being updated.',
            'livingCostDescription': 'Cost of living information currently being updated.',
            'qualityOfLifeDescription': 'Quality of life information currently being updated.',
            'avgTemperature': 20,
            'climateType': 'Unknown',
            'taxHighlights': {
                'personalIncomeTax': 'Varies',
                'corporateTax': 'Varies',
                'vatRate': 'Varies'
            }
        }

@router.get("", response_model=List[CountryResponse])
async def get_countries(
    search: Optional[str] = None,
    min_tax_score: Optional[int] = None,
    max_tax_score: Optional[int] = None,
    min_visa_accessibility: Optional[int] = None,
    max_visa_accessibility: Optional[int] = None,
    min_living_cost: Optional[int] = None,
    max_living_cost: Optional[int] = None,
    min_gdp: Optional[float] = None,
    max_gdp: Optional[float] = None,
    min_temperature: Optional[float] = None,
    max_temperature: Optional[float] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "desc",
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    query = db.query(CountryProfile)
    
    # Apply filters
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(or_(
            CountryProfile.name.ilike(search_term),
            CountryProfile.climate_type.ilike(search_term)
        ))
    
    if min_tax_score is not None:
        query = query.filter(CountryProfile.based_score >= min_tax_score)
    if max_tax_score is not None:
        query = query.filter(CountryProfile.based_score <= max_tax_score)
        
    if min_visa_accessibility is not None:
        query = query.filter(CountryProfile.visa_accessibility >= min_visa_accessibility)
    if max_visa_accessibility is not None:
        query = query.filter(CountryProfile.visa_accessibility <= max_visa_accessibility)
        
    if min_living_cost is not None:
        query = query.filter(CountryProfile.living_cost >= min_living_cost)
    if max_living_cost is not None:
        query = query.filter(CountryProfile.living_cost <= max_living_cost)
        
    if min_gdp is not None:
        query = query.filter(CountryProfile.gdp_per_capita >= min_gdp)
    if max_gdp is not None:
        query = query.filter(CountryProfile.gdp_per_capita <= max_gdp)
        
    if min_temperature is not None:
        query = query.filter(CountryProfile.avg_temperature >= min_temperature)
    if max_temperature is not None:
        query = query.filter(CountryProfile.avg_temperature <= max_temperature)
    
    # Apply sorting
    if sort_by:
        sort_column = {
            "based": CountryProfile.based_score,
            "visa": CountryProfile.visa_accessibility,
            "costs": CountryProfile.living_cost,
            "temp": CountryProfile.avg_temperature,
            "taxes": CountryProfile.based_score,  # We use based_score for taxes
            "gdp": CountryProfile.gdp_per_capita
        }.get(sort_by)
        
        if sort_column:
            if sort_order == "asc":
                query = query.order_by(sort_column.asc())
            else:
                query = query.order_by(sort_column.desc())
    
    countries = query.all()
    return [transform_country_data(country) for country in countries]

@router.get("/{country_id}", response_model=CountryDetailsResponse)
async def get_country(country_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    country = db.query(CountryProfile).filter(CountryProfile.id == country_id).first()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    
    base_country = transform_country_data(country)
    
    return {
        **base_country,
        'overview': {
            'tax_residency_rules': country.tax_residency_rules,
            'tax_year': country.tax_year,
            'currency': country.currency,
            'tax_authority': country.tax_authority,
            'tax_filing_frequency': country.tax_filing_frequency,
            'currency_exchange_rules': country.currency_exchange_rules
        },
        'tax_rates': {
            'personal_income_tax': {
                **country.personal_income_tax,
                'foreign_income_taxed': str(country.personal_income_tax.get('foreign_income_taxed', '')).lower() in ('true', 'yes')
            },
            'corporate_tax': {
                **country.corporate_tax,
                'foreign_income_taxed': str(country.corporate_tax.get('foreign_income_taxed', '')).lower() in ('true', 'yes')
            },
            'vat_gst': country.vat_gst
        },
        'digital_nomad_visa': country.digital_nomad_visa and {
            **country.digital_nomad_visa,
            'available': str(country.digital_nomad_visa.get('available', '')).lower() in ('true', 'yes')
        }
    } 