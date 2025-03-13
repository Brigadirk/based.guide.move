"""
Script to migrate user data from the old system to Supabase.
"""
import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User, Profile  # Import your existing models

# Load environment variables
load_dotenv()

# Supabase setup
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# Database setup
engine = create_engine(os.getenv("DATABASE_URL"))
Session = sessionmaker(bind=engine)

async def migrate_users():
    """Migrate users from PostgreSQL to Supabase."""
    session = Session()
    try:
        # Get all users from the current database
        users = session.query(User).all()
        
        for user in users:
            try:
                # Create user in Supabase
                supabase_user = supabase.auth.admin.create_user({
                    "email": user.email,
                    "password": "TEMP_PASSWORD_" + os.urandom(8).hex(),  # Temporary password
                    "email_confirm": True,  # Mark email as confirmed
                    "user_metadata": {
                        "analysisTokens": user.analysis_tokens,
                        "selectedProfile": user.selected_profile.to_dict() if user.selected_profile else None,
                    }
                })

                print(f"Migrated user: {user.email}")

                # Send password reset email
                supabase.auth.admin.send_password_reset_email(user.email)
                print(f"Sent password reset email to: {user.email}")

            except Exception as e:
                print(f"Error migrating user {user.email}: {str(e)}")
                continue

    except Exception as e:
        print(f"Migration failed: {str(e)}")
    finally:
        session.close()

if __name__ == "__main__":
    print("Starting migration to Supabase...")
    asyncio.run(migrate_users())
    print("Migration completed!") 