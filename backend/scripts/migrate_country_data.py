import json
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import Base, CountryProfile
from backend.config import settings

def migrate_country_data():
    # Create database engine and session
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Get the path to the JSON files
        data_dir = Path(__file__).parent.parent.parent / 'frontend' / 'data' / 'countries'
        
        # Process each JSON file
        for file in data_dir.glob('*.json'):
            country_id = file.stem.lower()
            if '_' in country_id:
                country_id = country_id.split('_')[0]
                
            print(f"Processing {file.name}...")
            
            # Read JSON data
            with open(file) as f:
                data = json.load(f)
            
            # Get living cost description
            living_cost = data.get('living_cost', 2500)
            try:
                highest_bracket = data.get('tax_rates', {}).get('personal_income_tax', {}).get('rate', [{}])[-1].get('bracket', 'N/A')
                living_cost_description = f"Living costs vary by region. The highest tax bracket starts at {highest_bracket}, indicating a {'high' if living_cost > 3000 else 'moderate' if living_cost > 2000 else 'low'} cost of living."
            except (KeyError, IndexError):
                living_cost_description = "Living costs information currently being updated."
            
            # Get quality of life description
            additional_notes = data.get('additional_notes', {})
            quality_of_life_description = f"{additional_notes.get('economic_stability', '')} {additional_notes.get('legal_system', '')}".strip() or 'Information not available.'
            
            # Create CountryProfile object
            country = CountryProfile(
                id=country_id,
                name=data.get('country', country_id.upper()),
                based_score=data.get('based_score', 75),
                visa_accessibility=data.get('visa_accessibility', 50),
                population=data.get('population', 0),
                gdp_per_capita=data.get('gdp_per_capita', 0),
                major_cities=data.get('major_cities', []),
                living_cost=living_cost,
                tax_description=data.get('overview', {}).get('tax_residency_rules', 'Tax residency rules currently being updated.'),
                living_cost_description=living_cost_description,
                quality_of_life_description=quality_of_life_description,
                
                # Overview data
                tax_residency_rules=data.get('overview', {}).get('tax_residency_rules'),
                tax_year=data.get('overview', {}).get('tax_year'),
                currency=data.get('overview', {}).get('currency'),
                tax_authority=data.get('overview', {}).get('tax_authority'),
                tax_filing_frequency=data.get('overview', {}).get('tax_filing_frequency'),
                currency_exchange_rules=data.get('overview', {}).get('currency_exchange_rules'),
                
                # Tax rates data
                personal_income_tax=data.get('tax_rates', {}).get('personal_income_tax', {}),
                corporate_tax=data.get('tax_rates', {}).get('corporate_tax', {}),
                vat_gst=data.get('tax_rates', {}).get('vat_gst', {}),
                
                # Digital nomad visa data
                digital_nomad_visa=data.get('digital_nomad_visa')
            )
            
            # Add to database
            existing = db.query(CountryProfile).filter(CountryProfile.id == country_id).first()
            if existing:
                print(f"Updating existing country {country_id}...")
                for key, value in country.__dict__.items():
                    if not key.startswith('_'):
                        setattr(existing, key, value)
            else:
                print(f"Adding new country {country_id}...")
                db.add(country)
        
        # Commit changes
        db.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate_country_data() 