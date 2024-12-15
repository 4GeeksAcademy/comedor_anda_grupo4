from flask import request, jsonify, Blueprint
from api.models import db, User, Product, Order, OrderProduct, Reserve
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from api.utils import APIException
from datetime import datetime, timezone
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
import os

cloudinary.config(
    cloud_name="dnmm7omko",
    api_key="412312661645263",
    api_secret=os.getenv("CLOUDINARY_SECRET", ""),
    secure=True
)

api = Blueprint('api', __name__)

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend."
    }
    return jsonify(response_body), 200

@api.route('/login', methods=['POST'])
def login():
    """
    Handle user login and return a JWT token with a redirect route based on user role.
    """
    body = request.get_json()

    # Validate input
    if not body or "email" not in body or "password" not in body:
        return jsonify({"msg": "Missing email or password"}), 400

    email = body.get("email")
    password = body.get("password")

    # Fetch the user from the database
    user = User.query.filter_by(email=email).first()

    if user and user.password == password:  # Password should ideally be hashed
        # Determine the redirect route based on user role
        if user.is_cliente:
            redirect_url = '/menu'
        elif user.is_cocina:
            redirect_url = '/dashboard/cocina'
        elif user.is_admin:
            redirect_url = '/dashboard/cocina'
        else:
            redirect_url = '/'  # Default route for unassigned roles

        # Generate a JWT token using a string for `identity` (e.g., `user.id`)
        access_token = create_access_token(identity=str(user.id))

        # Respond with the token and redirect URL
        return jsonify({"token": access_token, "redirect_url": redirect_url, "user_type" : user.is_cocina}), 200

    # Handle invalid credentials
    return jsonify({"msg": "Invalid email or password"}), 401

@api.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    """
    A protected route that requires a valid JWT token.
    """
    current_user = get_jwt_identity()
    return jsonify({"msg": "Access granted", "user": current_user}), 200

@api.route('/products', methods=['POST'])
def create_product():
    """
    Create a new product.
    """
    body = request.form

    # Validate required fields
    if not body or "name" not in body or "description" not in body or "type" not in body or "stock" not in body or "price" not in body:
        raise APIException("Missing product field", status_code=400)

    name = body.get("name")
    description = body.get("description")
    type = body.get("type")
    stock = body.get("stock")
    price = body.get("price")

    # Log the received stock value for debugging
    print(f"Received stock value: {stock}")

    # Validate stock as a positive integer
    if not stock.isdigit() or int(stock) < 0:
        raise APIException("Invalid stock value", status_code=400)

    stock = int(stock)  # Convert stock to an integer after validation

    # Handle file upload for image
    image = request.files.get("image")
    if not image:
        raise APIException("Image is required", status_code=400)

    try:
        upload_result = cloudinary.uploader.upload(image)
        image_url = upload_result["secure_url"]
    except Exception as e:
        raise APIException(f"Error uploading image: {str(e)}", status_code=500)

    # Create new product
    new_product = Product(
        name=name, 
        description=description,
        type=type,
        stock=stock,
        is_active=True,  # Default to True for new products
        image=image_url,
        price=price
    )
    db.session.add(new_product)
    db.session.commit()

    return jsonify({"msg": "Product created successfully"}), 200

@api.route('/product/toggle_active/<int:product_id>', methods=['PATCH'])
def toggle_product_active(product_id):
    try:
        # Buscar el producto por ID
        product = Product.query.get(product_id)
        if not product:
            raise APIException("Product not found", status_code=404)
        
        # Cambiar el estado de is_active al valor contrario
        product.is_active = not product.is_active
        
        # Guardar los cambios en la base de datos
        db.session.commit()
        
        # Devolver una respuesta indicando el nuevo estado
        return jsonify({"msg": f"Product with ID {product_id} is now {'active' if product.is_active else 'inactive'}"}), 200
    except Exception as e:
        raise APIException(f"Unexpected error: {str(e)}", status_code=500)



@api.route('/products', methods=['GET'])
def get_products():
    """
    Retrieve all products.
    """
    try:
        # Fetch all products from the database
        products = Product.query.all()

        # Handle the case when no products are found
        if not products:
            return jsonify({"message": "No products found"}), 404

        # Serialize the products for the response
        products_serialized = [product.serialize() for product in products]

        # Return the serialized products with a 200 status
        return jsonify({"products": products_serialized}), 200

    except Exception as e:
        # Log the exception for debugging
        print(f"Error in get_products: {e}")
        # Return a 500 error for internal server issues
        return jsonify({"msg": "Internal server error"}), 500


@api.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    """
    Create a new order for the logged-in user and return order details.
    """
    current_user_id = get_jwt_identity()  # This is now the user ID as a string
    user = User.query.get(current_user_id)  # Fetch the user object

    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    body = request.get_json()

    cart = body.get("cart")  # List of cart items
    if not isinstance(cart, list) or len(cart) == 0:
        return jsonify({"msg": "Cart must be a non-empty list"}), 400

    # Validate required fields
    if not all(isinstance(item, dict) and "product_id" in item and "quantity" in item for item in cart):
        return jsonify({"msg": "Each cart item must have product_id and quantity"}), 400

    # Generate a unique order number for the cart
    order_number = f"{user.id}-{int(datetime.now().timestamp() * 1000)}"

    try:
        # Create the order
        order = Order(
            user_id=user.id,
            order_number=order_number
        )
        db.session.add(order)

        # Prepare order details
        items = []
        total_amount = 0.0

        # Add products to the order
        for item in cart:
            product_id = item.get("product_id")
            quantity = item.get("quantity", 1)  # Default quantity to 1 if not provided

            # Validate product and quantity
            product = Product.query.get(product_id)
            if not product:
                return jsonify({"msg": f"Product with ID {product_id} not found"}), 404

            if product.stock < quantity:
                return jsonify({"msg": f"Insufficient stock for product {product_id}"}), 400

            # Deduct stock
            product.stock -= quantity

            # Calculate subtotal
            subtotal = product.price * quantity
            total_amount += subtotal

            # Add product details to the response
            items.append({
                "name": product.name,
                "price": product.price,
                "quantity": quantity,
                "subtotal": subtotal
            })

            # Create order-product relationship
            order_product = OrderProduct(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity
            )
            db.session.add(order_product)

        # Commit the transaction
        db.session.commit()

        return jsonify({
            "msg": "Order created successfully",
            "order_number": order_number,
            "date": datetime.now().isoformat(),
            "items": items,
            "total": total_amount
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Failed to create order: {str(e)}"}), 500


@api.route('/orders/<int:order_id>', methods=['PATCH'])
def update_order_status(order_id):
    data = request.get_json()

    # Validate the incoming data
    if 'status' not in data:
        return jsonify({"error": "Missing 'status' field"}), 400

    try:
        # Fetch the order
        order = Order.query.get(order_id)
        if not order:
            return jsonify({"error": "Order not found"}), 404

        # Update the status
        order.status = data['status']
        db.session.commit()

        return jsonify(order.serialize()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/orders', methods=['GET'])
def get_all_orders():
    """
    Retrieve all orders from all users.
    This endpoint is now accessible to everyone, no authentication required.
    """
    try:
        # Fetch all orders
        orders = Order.query.all()

        # Handle the case when no orders are found
        if not orders:
            return jsonify({"message": "No orders found"}), 404

        # Serialize orders for response
        orders_serialized = [order.serialize() for order in orders]

        # Return the serialized orders with a 200 status
        return jsonify({"orders": orders_serialized}), 200

    except Exception as e:
        # Log the exception for debugging
        print(f"Error in get_all_orders: {e}")
        # Return a 500 error for internal server issues
        return jsonify({"msg": "Internal server error"}), 500
    

@api.route('/reserve', methods=['POST'])
@jwt_required()
def create_reserve():
    """
    Create a new reserve for the logged-in user.
    """
    current_user_id = get_jwt_identity()  # This is now the user ID as a string
    user = User.query.get(current_user_id)  # Fetch the user object

    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    body = request.get_json()
    date = body.get("date")

    try:
        # Create the reserve
        reserve = Reserve(
            user_id=user.id,
            date=date
        )
        db.session.add(reserve)
         # Commit the transaction
        db.session.commit()
        return jsonify({"msg": "Reserve created successfully"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Failed to create reserve: {str(e)}"}), 500

@api.route('/reserve', methods=['GET'])
@jwt_required()
def get_reserve():
    """
    Retrieve reserves for the currently authenticated user.
    """
    try:
        # Get the current user's identity from the JWT
        user_id = get_jwt_identity()
        # Fetch reserves for the current user from the database
        reserves = Reserve.query.filter_by(user_id=user_id).all()
        # Handle the case when no reserves are found for this user
        if not reserves:
            return jsonify({"message": "No reserves found for this user"}), 404
        # Serialize the reserves for the response
        reserve_serialized = [reserve.serialize() for reserve in reserves]
        # Return the serialized reserves with a 200 status
        return jsonify({"Reserve": reserve_serialized}), 200
    except Exception as e:
        # Log the exception for debugging
        print(f"Error in get_reserve: {e}")
        # Return a 500 error for internal server issues
        return jsonify({"msg": "Internal server error"}), 500

# Endpoint to delete a reservation by ID
@api.route('/reserve/<int:id>', methods=['DELETE'])
def delete_reserves(id):
    global reserve
    # Find the reservation with the given ID
    reservation_to_delete = next((r for r in reserves if r["id"] == id), None)
    
    if reservation_to_delete:
        # Remove it from the list
        reserves = [r for r in reserves if r["id"] != id]
        return jsonify({"message": "Reservation deleted successfully", "id": id}), 200
    else:
        # Reservation not found
        return jsonify({"error": "Reservation not found"}), 404

