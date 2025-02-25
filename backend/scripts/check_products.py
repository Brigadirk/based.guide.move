from backend.database import SessionLocal
from backend.models import Product

def check_products():
    db = SessionLocal()
    products = db.query(Product).all()
    
    print(f"\nFound {len(products)} products:")
    for p in products:
        print(f"\nProduct: {p.name}")
        print(f"Type: {p.type}")
        print(f"Price: ${p.price/100:.2f}")
        print(f"Tokens: {p.token_amount}")
    
    db.close()

if __name__ == "__main__":
    check_products() 