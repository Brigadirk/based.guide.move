from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    email_verified = Column(Boolean, default=False)
    sessions = relationship("Session", back_populates="user")
    is_member = Column(Boolean, default=False)
    analysis_tokens = Column(Integer, default=0)
    country_analyses = relationship("CountryAnalysis", back_populates="user")

class Session(Base):
    __tablename__ = 'sessions'

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'))
    token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="sessions")

class Product(Base):
    __tablename__ = 'products'
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'member_bundle' or 'token_pack'
    price = Column(Integer, nullable=False)  # in cents
    token_amount = Column(Integer)  # null for member bundle
    is_active = Column(Boolean, default=True)

class Purchase(Base):
    __tablename__ = 'purchases'
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'))
    product_id = Column(String, ForeignKey('products.id'))
    created_at = Column(DateTime, default=datetime.utcnow)

class CountryAnalysis(Base):
    __tablename__ = 'country_analyses'
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'))
    country_id = Column(String, nullable=False)  # e.g., 'pt', 'ch', 'sv'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Store the analysis results
    personal_tax_rate = Column(Integer)  # Calculated personal tax rate
    corporate_tax_rate = Column(Integer)  # Calculated corporate tax rate if applicable
    visa_eligibility = Column(Boolean)  # Whether user is eligible for visa
    recommended_visa_type = Column(String)  # e.g., 'digital_nomad', 'permanent_resident'
    cost_of_living_adjusted = Column(Integer)  # Adjusted cost of living based on user preferences
    
    # Store the user's input data that was used for the analysis
    analysis_inputs = Column(JSON)  # Store all user inputs used for the analysis
    
    # Store the detailed analysis results
    analysis_results = Column(JSON)  # Store detailed breakdown and recommendations
    
    # Relationships
    user = relationship("User", back_populates="country_analyses")

class CountryProfile(Base):
    __tablename__ = 'country_profiles'

    id = Column(String, primary_key=True)  # e.g., 'pt', 'ch', 'sv'
    name = Column(String, nullable=False)  # e.g., 'Portugal', 'Switzerland'
    based_score = Column(Integer)
    visa_accessibility = Column(Integer)
    population = Column(Integer)
    gdp_per_capita = Column(Float)
    major_cities = Column(JSON)  # Array of city objects
    living_cost = Column(Integer)
    tax_description = Column(String)
    living_cost_description = Column(String)
    quality_of_life_description = Column(String)
    
    # Climate data
    avg_temperature = Column(Float)  # Average yearly temperature in Celsius
    min_temperature = Column(Float)  # Average minimum temperature
    max_temperature = Column(Float)  # Average maximum temperature
    climate_type = Column(String)    # e.g., 'Tropical', 'Mediterranean', 'Continental'
    
    # Overview data
    tax_residency_rules = Column(String)
    tax_year = Column(String)
    currency = Column(String)
    tax_authority = Column(String)
    tax_filing_frequency = Column(String)
    currency_exchange_rules = Column(String)
    
    # Tax rates data
    personal_income_tax = Column(JSON)  # Object containing rate array, foreign_income_taxed, etc.
    corporate_tax = Column(JSON)  # Object containing rates and withholding taxes
    vat_gst = Column(JSON)  # Object containing rates and exemptions
    
    # Digital nomad visa data
    digital_nomad_visa = Column(JSON)  # Object containing visa details
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 