from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import Product, User, Purchase
from backend.auth.utils import get_current_user
import uuid
from pydantic import BaseModel

router = APIRouter()

class ProductResponse(BaseModel):
    id: str
    name: str
    type: str
    price: int
    bananaAmount: int | None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        # Convert token_amount to bananaAmount in the response
        data = {
            "id": obj.id,
            "name": obj.name,
            "type": obj.type,
            "price": obj.price,
            "bananaAmount": obj.token_amount
        }
        return cls(**data)

@router.get("/available", response_model=List[ProductResponse])
async def get_available_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns available products based on user's membership status:
    - Non-members can only see the member bundle
    - Members can only see banana packs
    """
    query = db.query(Product).filter(Product.is_active == True)
    
    if current_user.is_member:
        products = query.filter(Product.type == 'banana_pack').all()
    else:
        products = query.filter(Product.type == 'member_bundle').all()
    
    return [ProductResponse.from_orm(product) for product in products]

class PurchaseRequest(BaseModel):
    product_id: str

@router.post("/purchase")
async def purchase_product(
    purchase_req: PurchaseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == purchase_req.product_id,
        Product.is_active == True
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Validate purchase eligibility
    if product.type == 'member_bundle' and current_user.is_member:
        raise HTTPException(
            status_code=400,
            detail="You are already a member"
        )
    
    # Record purchase
    purchase = Purchase(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        product_id=product.id
    )
    db.add(purchase)
    
    # Update user based on purchase type
    if product.type == 'member_bundle':
        current_user.is_member = True
        current_user.analysis_tokens += product.token_amount
    else:
        current_user.analysis_tokens += product.token_amount
    
    db.commit()
    
    return {
        "success": True,
        "new_token_balance": current_user.analysis_tokens,
        "is_member": current_user.is_member
    } 