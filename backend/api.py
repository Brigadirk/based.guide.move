from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.auth.routes import router as auth_router
from backend.stripe.routes import router as stripe_router
from backend.products.routes import router as products_router
from backend.analysis.routes import router as analysis_router
from backend.countries.routes import router as countries_router
from backend.database import engine
from backend.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Based Guide API")

# Configure CORS middleware to handle preflight requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(stripe_router, prefix="/stripe", tags=["stripe"])
app.include_router(products_router, prefix="/products", tags=["products"])
app.include_router(analysis_router, prefix="/analysis", tags=["analysis"])
app.include_router(countries_router, prefix="/countries", tags=["countries"])

@app.get("/")
async def root():
    return {"message": "Welcome to based.guide API"} 