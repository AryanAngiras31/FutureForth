from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

purchases_bp = Blueprint('purchases', __name__)


@purchases_bp.route('', methods=['POST'])
@jwt_required()
def complete_purchase():
    user_id = get_jwt_identity()
    data = request.json
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    if not product_id:
        return jsonify(message="Missing product_id"), 400

    cursor = current_app.db_cursor
    conn = current_app.db_conn

    cursor.execute("SELECT price, status FROM products WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    if not product:
        return jsonify(message="Product not found"), 404
    if product['status'] != 'active':
        return jsonify(message="Product not available"), 400

    amount = product['price'] * quantity

    try:
        cursor.execute("""
            INSERT INTO purchases (user_id, product_id, amount, quantity, purchase_date)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, product_id, amount, quantity, datetime.utcnow()))

        cursor.execute("UPDATE products SET status = 'sold' WHERE id = %s", (product_id,))
        cursor.execute("DELETE FROM cart WHERE user_id = %s AND product_id = %s", (user_id, product_id))

        conn.commit()
        return jsonify(message="Purchase completed"), 201
    except Exception as e:
        conn.rollback()
        return jsonify(message=str(e)), 500

@purchases_bp.route('', methods=['GET'])
@jwt_required()
def get_purchase_history():
    user_id = get_jwt_identity()
    cursor = current_app.db_cursor
    cursor.execute("""
        SELECT p.id, pr.title, p.amount, p.quantity, p.purchase_date FROM purchases p
        JOIN products pr ON p.product_id = pr.id
        WHERE p.user_id = %s ORDER BY p.purchase_date DESC
    """, (user_id,))
    purchases = cursor.fetchall()
    return jsonify([dict(purchase) for purchase in purchases]), 200
