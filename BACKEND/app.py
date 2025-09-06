from flask import Flask
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import psycopg2
import psycopg2.extras

from routes.auth import auth_bp
from routes.products import products_bp
from routes.cart import cart_bp
from routes.purchases import purchases_bp
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for all routes
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# JWT configuration
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # For development only
app.config['JWT_IDENTITY_CLAIM'] = 'sub'

# Custom JWT identity loader
@jwt.user_identity_loader
def user_identity_lookup(user):
    return str(user)

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return identity

# Connect to PostgreSQL with retry mechanism
def connect_to_database():
    max_retries = 5
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            conn = psycopg2.connect(app.config['DATABASE_URI'])
            cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            print(f"Database connected successfully on attempt {attempt + 1}")
            return conn, cursor
        except psycopg2.OperationalError as e:
            print(f"Database connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay} seconds...")
                import time
                time.sleep(retry_delay)
            else:
                print("Max retries reached. Database connection failed.")
                raise e

conn, cursor = connect_to_database()
app.db_conn = conn
app.db_cursor = cursor

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(cart_bp, url_prefix='/api/cart')
app.register_blueprint(purchases_bp, url_prefix='/api/purchases')

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
