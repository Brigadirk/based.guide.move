from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import CountryProfile
from backend.config import settings
import os

# Climate data by country
CLIMATE_DATA = {
    'netherlands': {
        'avg_temperature': 10.5,
        'min_temperature': 3,
        'max_temperature': 17.5,
        'climate_type': 'Maritime Temperate'
    },
    'switzerland': {
        'avg_temperature': 9.3,
        'min_temperature': -1,
        'max_temperature': 20,
        'climate_type': 'Alpine'
    },
    'portugal': {
        'avg_temperature': 15.5,
        'min_temperature': 8,
        'max_temperature': 23,
        'climate_type': 'Mediterranean'
    },
    'spain': {
        'avg_temperature': 14.3,
        'min_temperature': 6,
        'max_temperature': 25,
        'climate_type': 'Mediterranean'
    },
    'united': {  # United States
        'avg_temperature': 12.9,
        'min_temperature': -1,
        'max_temperature': 28,
        'climate_type': 'Varied (Continental to Subtropical)'
    },
    'el': {  # El Salvador
        'avg_temperature': 24.8,
        'min_temperature': 18,
        'max_temperature': 32,
        'climate_type': 'Tropical'
    }
}

# Economic data adjustments if needed
ECONOMIC_ADJUSTMENTS = {
    'netherlands': {
        'based_score': 75,
        'visa_accessibility': 70,
        'living_cost': 3000,
        'gdp_per_capita': 57620
    },
    'switzerland': {
        'based_score': 85,
        'visa_accessibility': 60,
        'living_cost': 3500,
        'gdp_per_capita': 93720
    },
    'portugal': {
        'based_score': 78,
        'visa_accessibility': 85,
        'living_cost': 2000,
        'gdp_per_capita': 24540
    },
    'spain': {
        'based_score': 72,
        'visa_accessibility': 75,
        'living_cost': 2200,
        'gdp_per_capita': 30115
    },
    'united': {  # United States
        'based_score': 70,
        'visa_accessibility': 65,
        'living_cost': 2800,
        'gdp_per_capita': 75180
    },
    'el': {  # El Salvador
        'based_score': 82,
        'visa_accessibility': 68,
        'living_cost': 1500,
        'gdp_per_capita': 4187
    }
}

def update_country_data():
    # Create database engine and session
    print(f"Current working directory: {os.getcwd()}")
    print(f"Database URL: {settings.DATABASE_URL}")
    
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Update each country
        for country_id in CLIMATE_DATA.keys():
            print(f"\nProcessing country_id: {country_id}")
            country = db.query(CountryProfile).filter(CountryProfile.id == country_id).first()
            if country:
                print(f"Found country: {country.name}")
                print("Current values:")
                print(f"  avg_temperature: {country.avg_temperature}")
                print(f"  climate_type: {country.climate_type}")
                
                # Update climate data
                climate = CLIMATE_DATA[country_id]
                country.avg_temperature = climate['avg_temperature']
                country.min_temperature = climate['min_temperature']
                country.max_temperature = climate['max_temperature']
                country.climate_type = climate['climate_type']
                
                print("New values:")
                print(f"  avg_temperature: {country.avg_temperature}")
                print(f"  climate_type: {country.climate_type}")
                
                # Update economic data if needed
                if country_id in ECONOMIC_ADJUSTMENTS:
                    print("Updating economic data...")
                    econ = ECONOMIC_ADJUSTMENTS[country_id]
                    country.based_score = econ['based_score']
                    country.visa_accessibility = econ['visa_accessibility']
                    country.living_cost = econ['living_cost']
                    country.gdp_per_capita = econ['gdp_per_capita']
            else:
                print(f"Country {country_id} not found in database")
        
        print("\nCommitting changes...")
        db.commit()
        print("Successfully updated country data")
        
    except Exception as e:
        print(f"Error updating country data: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_country_data() 