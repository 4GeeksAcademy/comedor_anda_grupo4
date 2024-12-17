from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False, default=True)
    is_cliente = db.Column(db.Boolean(), unique=False, nullable=False, default=True)
    is_cocina = db.Column(db.Boolean(), unique=False, nullable=False, default=False)
    is_admin = db.Column(db.Boolean(), unique=False, nullable=False, default=False)

    # Relationship to orders
    orders = db.relationship("Order", backref="user", lazy=True)

     # Relationship to reserve
    reserve = db.relationship("Reserve", backref="user", lazy=True)

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "is_active": self.is_active,
            "is_cliente": self.is_cliente,
            "is_cocina": self.is_cocina,
            "is_admin": self.is_admin,
        }

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), unique=False, nullable=False)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.String(500), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False, default=True)
    stock = db.Column(db.Integer, unique=False, nullable=False)
    image = db.Column(db.String(1500), unique=False, nullable=False)
    price = db.Column(db.Integer, unique=False, nullable=False, default=0)

    # Relationship to orders
    orders = db.relationship("OrderProduct", backref="ordered_product", lazy=True)

    def __init__(self, type, name, description, stock, image, is_active=True):
        self.type = type
        self.name = name
        self.description = description
        self.is_active = is_active
        self.stock = stock
        self.image = image

    def __repr__(self):
        return f'<Product {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "type": self.type,
            "name": self.name,
            "description": self.description,
            "stock": self.stock,
            "is_active": self.is_active,
            "image": self.image,
            "price": self.price
        }

class OrderProduct(db.Model):
    __tablename__ = 'order_product'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    # Relationship to Product
    product = db.relationship('Product', backref='order_products', lazy=True)

    def __repr__(self):
        return f'<OrderProduct Order {self.order_id} - Product {self.product_id} - Quantity {self.quantity}>'

    def serialize(self):
        return {
            "product_id": self.product_id,
            "quantity": self.quantity,
            "name": self.product.name,  # Product name
            "description": self.product.description,  # Product description
            "price": self.product.price,  # Product price
            "image": self.product.image,  # Product image URL
            "type": self.product.type,  # Product type
        }


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(50), nullable=False, default="Pending")
    order_number = db.Column(db.String(100), nullable=False)
    products = db.relationship('OrderProduct', backref='order', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Order {self.id} - User {self.user_id} - OrderNumber {self.order_number}>'

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "products": [product.serialize() for product in self.products],
            "date": self.date.isoformat(),
            "status": self.status,
            "order_number": self.order_number,
        }
    
class Reserve(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f'<Reserve {self.id} - User {self.user_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "date": self.date.isoformat(),
        }