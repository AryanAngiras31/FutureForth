from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import psycopg2 # Ensures psycopg2 is imported.

# Check if required environment variables are set to prevent connection errors
if not all(
    (
        os.getenv("DB_USER"),
        os.getenv("DB_PASSWORD"),
        os.getenv("DB_HOST"),
        os.getenv("DB_PORT"),
        os.getenv("DB_NAME"),
    )
):
    print("Warning: Database environment variables are not all set.")

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg2://myuser:mypassword@db:5432/mydb"
)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()