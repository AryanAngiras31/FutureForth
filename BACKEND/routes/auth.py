from flask import Blueprint, request, jsonify, current_app
from flask_bcrypt import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import psycopg2.errors

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    if not email or not username or not password:
        return jsonify(message="Missing fields"), 400

    pw_hash = generate_password_hash(password).decode('utf-8')

    cursor = current_app.db_cursor
    conn = current_app.db_conn

    try:
        cursor.execute(
            "INSERT INTO users (email, username, password_hash) VALUES (%s, %s, %s)",
            (email, username, pw_hash)
        )
        conn.commit()
        return jsonify(message="User registered successfully"), 201

    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return jsonify(message="User already exists"), 409

    except Exception as e:
        conn.rollback()
        return jsonify(message=str(e)), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify(message="Missing email or password"), 400

    cursor = current_app.db_cursor

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if user and check_password_hash(user['password_hash'], password):
        # Create token with string identity
        user_identity = str(user['id'])
        access_token = create_access_token(identity=user_identity)
        return jsonify(access_token=access_token), 200

    return jsonify(message="Invalid credentials"), 401

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    try:
        user_id = get_jwt_identity()
        cursor = current_app.db_cursor

        cursor.execute("SELECT email, username, first_name, last_name, phone, bio, location FROM users WHERE id = %s", (int(user_id),))
        user = cursor.fetchone()
        if user:
            return jsonify(dict(user)), 200

        return jsonify(message="User not found"), 404
    except Exception as e:
        return jsonify(message=str(e)), 500
