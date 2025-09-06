from sqlalchemy.orm import Session
from . import models
from sqlalchemy import and_

def get_products(db: Session, title: str = None, category: str = None,
                 min_price: float = None, max_price: float = None,
                 tags: list[str] = None):
    query = db.query(models.Product)

    if title:
        query = query.filter(models.Product.title.ilike(f"%{title}%"))
    if category:
        query = query.filter(models.Product.category == category)
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
    if tags:
        query = query.filter(models.Product.tags.overlap(tags))  # Postgres ARRAY support

    return query.all()