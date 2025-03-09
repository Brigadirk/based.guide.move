from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer, JSON, Float, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    email_verified = Column(Boolean, default=False)
    sessions = relationship("Session", back_populates="user")
    is_member = Column(Boolean, default=False)
    analysis_tokens = Column(Integer, default=3)
    country_analyses = relationship("CountryAnalysis", back_populates="user")
    profiles = relationship("UserProfile", back_populates="user")
    stripe_customer_id = Column(String, unique=True, nullable=True)
    subscription_id = Column(String, unique=True, nullable=True)
    subscription_status = Column(String, nullable=True)  # active, canceled, past_due, etc.
    payments = relationship("Payment", back_populates="user")

class Session(Base):
    __tablename__ = 'sessions'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id'))
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="sessions")

class Product(Base):
    __tablename__ = 'products'
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'member_bundle' or 'banana_pack'
    price = Column(Integer, nullable=False)  # in cents
    token_amount = Column(Integer)  # renamed to banana_amount in API responses
    is_active = Column(Boolean, default=True)
    purchases = relationship("Purchase", back_populates="product", cascade="all, delete-orphan")

class Purchase(Base):
    __tablename__ = 'purchases'
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'))
    product_id = Column(String, ForeignKey('products.id', ondelete='CASCADE'))
    created_at = Column(DateTime, default=datetime.utcnow)
    product = relationship("Product", back_populates="purchases")

class CountryAnalysis(Base):
    __tablename__ = 'country_analyses'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id'))
    country_id = Column(String, nullable=False)  # e.g., 'pt', 'ch', 'sv'
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Store the analysis results
    personal_tax_rate = Column(Integer, nullable=True)  # Calculated personal tax rate
    corporate_tax_rate = Column(Integer, nullable=True)  # Calculated corporate tax rate if applicable
    visa_eligibility = Column(Boolean, nullable=True)  # Whether user is eligible for visa
    recommended_visa_type = Column(String, nullable=True)  # e.g., 'digital_nomad', 'permanent_resident'
    cost_of_living_adjusted = Column(Integer, nullable=True)  # Adjusted cost of living based on user preferences
    
    # Store the user's input data that was used for the analysis
    analysis_inputs = Column(JSON, nullable=True)  # Store all user inputs used for the analysis
    
    # Store the detailed analysis results
    analysis_results = Column(JSON, nullable=True)  # Store detailed breakdown and recommendations
    
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

class UserProfile(Base):
    __tablename__ = 'user_profiles'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id'))
    nickname = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Personal Information
    date_of_birth = Column(String, nullable=True)
    nationalities = Column(JSON, default=list)  # Array of country objects
    marital_status = Column(String, nullable=True)  # "Single", "Married", "Divorced"
    current_residency = Column(JSON, nullable=True)  # { country: string, status: string }

    # Financial Information
    income_sources = Column(JSON, default=list)  # Array of income source objects
    assets = Column(JSON, default=list)  # Array of asset objects
    liabilities = Column(JSON, default=list)  # Array of liability objects

    # Residency Intentions
    move_type = Column(String)  # "Permanent" or "Digital Nomad"
    intended_country = Column(String)
    duration_of_stay = Column(String)  # "6 months", "1 year", "Indefinite"
    preferred_maximum_stay_requirement = Column(String)  # "1 month", "3 months", "No requirement"
    residency_notes = Column(String)

    # Dependents
    dependents = Column(JSON, default=list)  # Array of dependent objects
    special_circumstances = Column(String, nullable=True)

    # Partner Information (Optional)
    partner_info = Column(JSON, nullable=True)  # Complete partner profile object

    # Relationships
    user = relationship("User", back_populates="profiles")

class Payment(Base):
    __tablename__ = 'payments'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id'))
    stripe_payment_id = Column(String, unique=True)
    amount = Column(Integer)  # Amount in cents
    currency = Column(String)
    status = Column(String)  # succeeded, pending, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    payment_method = Column(String)  # card, bank_transfer, etc.
    user = relationship("User", back_populates="payments") 