from backend.database import engine
from sqlalchemy import text

def update_schema():
    with engine.connect() as connection:
        # Add is_member column
        connection.execute(text("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_member BOOLEAN DEFAULT FALSE;
        """))
        
        # Add analysis_tokens column
        connection.execute(text("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS analysis_tokens INTEGER DEFAULT 0;
        """))
        
        # Create country_analyses table
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS country_analyses (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255) REFERENCES users(id),
                country_id VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                personal_tax_rate INTEGER,
                corporate_tax_rate INTEGER,
                visa_eligibility BOOLEAN,
                recommended_visa_type VARCHAR(255),
                cost_of_living_adjusted INTEGER,
                analysis_inputs JSONB,
                analysis_results JSONB
            );
        """))
        
        connection.commit()

if __name__ == "__main__":
    print("Updating user schema...")
    update_schema()
    print("Schema update complete!") 