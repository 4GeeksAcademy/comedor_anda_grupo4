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

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        """
        Serialize the user object without exposing sensitive information.
        """
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
    stock = db.Column(db.Integer, unique=False, nullable=False)  # Must be positive
    image = db.Column(db.String(1500), unique=False, nullable=False)
    
    def __repr__(self):
        return f'<Product {self.name}>'

    def __init__(self, type, name, description, stock, image, is_active=True):
        self.type = type
        self.name = name
        self.description = description
        self.is_active = is_active
        self.stock = stock
        self.image = image

    def serialize(self):
        return {
            "id": self.id,
            "type": self.type,
            "name": self.name,
            "description": self.description,
            "stock": self.stock,
            "is_active": self.is_active,
            "image": self.image
        }