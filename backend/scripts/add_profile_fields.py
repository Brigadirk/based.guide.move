from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Get database URL from environment
DATABASE_URL = os.getenv('DATABASE_URL')

def add_profile_fields():
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is not set")
        
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as connection:
        # Add nickname and avatar columns to user_profiles table
        connection.execute(text("""
            ALTER TABLE user_profiles
            ADD COLUMN IF NOT EXISTS nickname VARCHAR(255),
            ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);
        """))
        
        connection.commit()
        print("Successfully added nickname and avatar columns to user_profiles table")

if __name__ == "__main__":
    add_profile_fields() 