from sqlalchemy import Column, Integer, String, Float, ARRAY
from .database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    category = Column(String, index=True)
    price = Column(Float, index=True)
    tags = Column(ARRAY(String), default=[])  # Requires PostgreSQL