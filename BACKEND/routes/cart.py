from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    cursor = current_app.db_cursor
    cursor.execute("""
        SELECT c.id, p.title, p.price, c.quantity, p.image_url FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = %s
    """, (user_id,))
    items = cursor.fetchall()
    return jsonify([dict(item) for item in items]), 200

@cart_bp.route('', methods=['POST'])
@jwt_required()
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.json
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    if not product_id:
        return jsonify(message="Missing product_id"), 400

    cursor = current_app.db_cursor
    conn = current_app.db_conn

    try:
        cursor.execute("""
            INSERT INTO cart (user_id, product_id, quantity)
            VALUES (%s, %s, %s)
            ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity
        """, (user_id, product_id, quantity))
        conn.commit()
        return jsonify(message="Item added to cart"), 201
    except Exception as e:
        conn.rollback()
        return jsonify(message=str(e)), 500

@cart_bp.route('/<int:cart_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(cart_id):
    user_id = get_jwt_identity()
    cursor = current_app.db_cursor
    conn = current_app.db_conn

    cursor.execute("SELECT user_id FROM cart WHERE id = %s", (cart_id,))
    cart_item = cursor.fetchone()
    if not cart_item:
        return jsonify(message="Cart item not found"), 404
    if cart_item['user_id'] != user_id:
        return jsonify(message="Unauthorized"), 403

    try:
        cursor.execute("DELETE FROM cart WHERE id = %s", (cart_id,))
        conn.commit()
        return jsonify(message="Item removed from cart"), 200
    except Exception as e:
        conn.rollback()
        return jsonify(message=str(e)), 500
