from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer
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