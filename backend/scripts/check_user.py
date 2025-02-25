from backend.database import SessionLocal
from backend.models import User

def check_user(email: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        print(f"\nUser found:")
        print(f"Email: {user.email}")
        print(f"ID: {user.id}")
        print(f"Is Member: {user.is_member}")
        print(f"Analysis Tokens: {user.analysis_tokens}")
    else:
        print(f"\nNo user found with email: {email}")
    
    db.close()

if __name__ == "__main__":
    check_user("amaro+test@amarokoberle.com") 