
import click
from api.models import db, User, Product
import random
"""
In this file, you can add as many commands as you want using the @app.cli.command decorator
Flask commands are usefull to run cronjobs or tasks outside of the API but sill in integration 
with youy database, for example: Import the price of bitcoin every night as 12am
"""
def setup_commands(app):
    
    """ 
    This is an example command "insert-test-users" that you can run from the command line
    by typing: $ flask insert-test-users 5
    Note: 5 is the number of users to add
    """
    @app.cli.command("insert-test-users") # name of our command
    @click.argument("count") # argument of out command
    def insert_test_users(count):
        print("Creating test users")
        for x in range(1, int(count) + 1):
            user = User()
            user.email = "test_user" + str(x) + "@test.com"
            user.password = "123456"
            user.is_active = True
            user.is_cliente = True
            user.is_cocina = False
            user.is_admin = False
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")

        print("All test users created")

    @app.cli.command("insert-test-data")
    def insert_test_data():
        pass

    def check_name_already_exists(name):
        return Product.query.filter_by(name=name).first() is not None

    images = [
        "https://res.cloudinary.com/dd0wschpy/image/upload/v1733522394/dectada-pasta_tfy9x6.webp",
        "https://res.cloudinary.com/dd0wschpy/image/upload/v1733522394/milanesa_de_carne_11894_orig_mgs2gi.jpg",
        "https://res.cloudinary.com/dd0wschpy/image/upload/v1733522394/20231120-WEB-Lasanga-6422_ebwupb.webp",
        "https://res.cloudinary.com/dd0wschpy/image/upload/v1733522393/65a016f48ab83_n25azc.jpg"
    ]

    product_types = ['Ejecutivo', 'Bebidas', 'Minutas']

    # Nombres predefinidos para productos
    product_templates = [
        ("Milanesa", ["de carne", "de pollo", "napolitana", "a la suiza"]),
        ("Pasta", ["con salsa blanca", "a la bolognesa", "con pesto", "a la carbonara"]),
        ("Pizza", ["muzzarella", "napolitana", "de jamón y morrones", "fugazzeta"]),
        ("Hamburguesa", ["completa", "con queso y bacon", "doble carne", "vegana"]),
        ("Ensalada", ["César", "rusa", "mixta", "de quinoa"]),
    ]

    # Descripciones coherentes
    def generate_description(name, type, details):
        descriptions = [
            f"{name} {details} con guarnición de {random.choice(['papas fritas', 'ensalada', 'puré', 'arroz'])}.",
            f"{name} {details} acompañada de una bebida a elección.",
            f"{name} {details}, ideal para disfrutar con amigos.",
            f"{name} {details} preparada con ingredientes frescos y seleccionados."
        ]
        return random.choice(descriptions)


    def insert_random_product():
        # Seleccionar un producto base
        product_base = random.choice(product_templates)
        name_base = product_base[0]
        detail = random.choice(product_base[1])
        name = f"{name_base} {detail}"

        if check_name_already_exists(name):
            print(f'Product "{name}" already exists. Skipping...')
            return False

        description = generate_description(name, "food", detail)
        image = random.choice(images)
        type = random.choice(product_types)
        
        new_product = Product(
            type=type,
            name=name,
            description=description,
            stock=random.randint(10, 100),  # Stock más realista
            image=image,
        )

        db.session.add(new_product)
        db.session.commit()
        print(f'Product "{name}" added successfully.')
        return True

    @app.cli.command("populate-products")
    def insert_random_products():
        count = 0
        total_products = 10
        while count < total_products:
            if insert_random_product():
                count += 1
                print(f'Product {count}/{total_products} created.')
            