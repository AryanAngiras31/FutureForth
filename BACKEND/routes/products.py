from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

products_bp = Blueprint('products', __name__)

@products_bp.route('', methods=['GET'])
def get_products():
    category = request.args.get('category')
    keyword = request.args.get('keyword')
    cursor = current_app.db_cursor

    query = "SELECT * FROM products WHERE status = 'active'"
    params = []

    if category:
        query += " AND category_id = (SELECT id FROM categories WHERE name = %s)"
        params.append(category)
    if keyword:
        query += " AND title ILIKE %s"
        params.append(f'%{keyword}%')

    cursor.execute(query, params)
    products = cursor.fetchall()
    return jsonify([dict(product) for product in products]), 200

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    cursor = current_app.db_cursor
    cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    if product:
        return jsonify(dict(product)), 200
    return jsonify(message="Product not found"), 404

@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    user_id = get_jwt_identity()
    data = request.json
    title = data.get('title')
    description = data.get('description')
    category_name = data.get('category')
    price = data.get('price')
    image_url = data.get('image_url')

    if not all([title, description, category_name, price, image_url]):
        return jsonify(message="Missing fields"), 400

    cursor = current_app.db_cursor
    conn = current_app.db_conn

    cursor.execute("SELECT id FROM categories WHERE name = %s", (category_name,))
    category = cursor.fetchone()
    if not category:
        return jsonify(message="Invalid category"), 400

    try:
        cursor.execute("""
            INSERT INTO products (title, description, category_id, price, image_url, seller_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (title, description, category['id'], price, image_url, user_id))
        conn.commit()
        return jsonify(message="Product created successfully"), 201

    except Exception as e:
        conn.rollback()
        return jsonify(message=str(e)), 500

@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    user_id = get_jwt_identity()
    data = request.json
    cursor = current_app.db_cursor
    conn = current_app.db_conn

    cursor.execute("SELECT seller_id FROM products WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    if not product:
        return jsonify(message="Product not found"), 404
    if product['seller_id'] != user_id:
        return jsonify(message="Unauthorized"), 403

    fields = []
    values = []
    allowed_fields = ['title', 'description', 'category', 'price', 'image_url', 'status']

    for field in allowed_fields:
        if field in data:
            if field == 'category':
                cursor.execute("SELECT id FROM categories WHERE name = %s", (data[field],))
                category = cursor.fetchone()
                if not category:
                    return jsonify(message="Invalid category"), 400
                fields.append('category_id = %s')
                values.append(category['id'])
            else:
                fields.append(f"{field} = %s")
                values.append(data[field])

    if not fields:
        return jsonify(message="Nothing to update"), 400

    values.append(product_id)
    query = f"UPDATE products SET {', '.join(fields)}, updated_at = CURRENT_TIMESTAMP WHERE id = %s"

    try:
        cursor.execute(query, values)
        conn.commit()
        return jsonify(message="Product updated"), 200
    except Exception as e:
        conn.rollback()
        return jsonify(message=str(e)), 500

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    user_id = get_jwt_identity()
    cursor = current_app.db_cursor
    conn = current_app.db_conn

    cursor.execute("SELECT seller_id FROM products WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    if not product:
        return jsonify(message="Product not found"), 404
    if product['seller_id'] != user_id:
        return jsonify(message="Unauthorized"), 403

    try:
        cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
        conn.commit()
        return jsonify(message="Product deleted"), 200
    except Exception as e:
        conn.rollback()
        return jsonify(message=str(e)), 500
