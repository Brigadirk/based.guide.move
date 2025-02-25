from backend.database import SessionLocal
from backend.models import Product
import uuid

def seed_products():
    db = SessionLocal()
    
    # Clear existing products
    db.query(Product).delete()
    
    # Create products
    products = [
        Product(
            id=str(uuid.uuid4()),
            name="Member Bundle",
            type="member_bundle",
            price=100,  # $1.00
            token_amount=3,
            is_active=True
        ),
        Product(
            id=str(uuid.uuid4()),
            name="5 Token Pack",
            type="token_pack",
            price=500,  # $5.00
            token_amount=5,
            is_active=True
        ),
        Product(
            id=str(uuid.uuid4()),
            name="10 Token Pack",
            type="token_pack",
            price=800,  # $8.00
            token_amount=10,
            is_active=True
        ),
        Product(
            id=str(uuid.uuid4()),
            name="20 Token Pack",
            type="token_pack",
            price=1200,  # $12.00
            token_amount=20,
            is_active=True
        ),
    ]
    
    for product in products:
        db.add(product)
    
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_products() 