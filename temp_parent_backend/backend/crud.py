from sqlalchemy.orm import Session
from . import models
from sqlalchemy import and_

def get_products(db: Session, title: str = None, category_name: str = None,
                 min_price: float = None, max_price: float = None):
    query = db.query(models.Product)

    if title:
        query = query.filter(models.Product.title.ilike(f"%{title}%"))
    if category_name:
        query = query.join(models.Category).filter(models.Category.name == category_name)
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)

    return query.all()