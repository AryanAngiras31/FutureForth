import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secure-flask-secret-key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secure-jwt-secret-key')
    DATABASE_URI = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/ecofinds')