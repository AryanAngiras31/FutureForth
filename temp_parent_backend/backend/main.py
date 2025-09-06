from fastapi import FastAPI, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from . import models, crud
from .database import SessionLocal, engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Product Filter API")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/products")
def read_products(
    title: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    tags: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db)
):
    products = crud.get_products(db, title, category, min_price, max_price, tags)
    return products