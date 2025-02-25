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
        
        connection.commit()

if __name__ == "__main__":
    print("Updating user schema...")
    update_schema()
    print("Schema update complete!") 