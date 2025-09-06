from flask import Flask
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
import psycopg2
import psycopg2.extras

from routes.auth import auth_bp
from routes.products import products_bp
from routes.cart import cart_bp
from routes.purchases import purchases_bp
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Connect to PostgreSQL
conn = psycopg2.connect(app.config['DATABASE_URI'])
cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

app.db_conn = conn
app.db_cursor = cursor

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(cart_bp, url_prefix='/api/cart')
app.register_blueprint(purchases_bp, url_prefix='/api/purchases')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
