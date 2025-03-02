from backend.database import SessionLocal
from backend.models import Product, Purchase
import uuid

def seed_products():
    db = SessionLocal()
    
    try:
        # Update existing products instead of deleting them
        # This preserves purchase history while updating names and types
        
        # Update member bundle
        member_bundle = db.query(Product).filter_by(type='member_bundle').first()
        if member_bundle:
            member_bundle.name = "Member Bundle"
            member_bundle.price = 100
            member_bundle.token_amount = 3
            member_bundle.is_active = True
        else:
            member_bundle = Product(
                id=str(uuid.uuid4()),
                name="Member Bundle",
                type="member_bundle",
                price=100,
                token_amount=3,
                is_active=True
            )
            db.add(member_bundle)

        # Update or create banana packs
        packs = [
            {"amount": 5, "price": 500},
            {"amount": 10, "price": 800},
            {"amount": 20, "price": 1200},
        ]
        
        for pack in packs:
            existing_pack = db.query(Product).filter(
                Product.token_amount == pack["amount"],
                Product.type.in_(['token_pack', 'banana_pack'])
            ).first()
            
            if existing_pack:
                existing_pack.name = f"{pack['amount']} Bananas 🍌"
                existing_pack.type = "banana_pack"
                existing_pack.price = pack["price"]
                existing_pack.is_active = True  # Make sure existing packs are active
            else:
                new_pack = Product(
                    id=str(uuid.uuid4()),
                    name=f"{pack['amount']} Bananas 🍌",
                    type="banana_pack",
                    price=pack["price"],
                    token_amount=pack["amount"],
                    is_active=True
                )
                db.add(new_pack)
        
        # Instead of deactivating other products, let's just make sure our banana packs are active
        db.query(Product).filter(
            Product.type == 'banana_pack'
        ).update({"is_active": True})
        
        db.commit()
        print("Successfully updated products!")
        
    except Exception as e:
        print(f"Error updating products: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_products() 