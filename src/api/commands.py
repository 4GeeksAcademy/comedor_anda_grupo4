
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

    name_subj = ['Milanesa', 'Pasta', 'Lasagna', 'Pizza', 'Ensalada', 'Hamburguesa', 'Empanadas', 'Tarta', 'Sushi', 'Wok']
    name_compl = ['de carne', 'de pollo', 'de verdura', 'de jamon y queso', 'de atun', 'de salmon', 'de espinaca', 'de calabaza', 'de berenjena', 'de zapallitos']

    descriptions = [
        f'{random.choice(name_subj)} {random.choice(name_compl)} con guarnición de {random.choice(["papas fritas", "ensalada", "arroz", "puré"])}',
        f'{random.choice(name_subj)} con salsa de {random.choice(["tomate", "queso", "blanca", "roquefort"])} y {random.choice(["queso rallado", "jamón", "champiñones", "aceitunas"])}',
        f'{random.choice(name_subj)} con {random.choice(["salsa blanca", "salsa roja", "salsa de champiñones", "salsa de espinaca"])} y {random.choice(["tomate", "queso", "jamón", "pollo"])}',
        f'{random.choice(name_subj)} de {random.choice(["jamón", "morrón", "queso", "anchoas"])}',
        f'Ensalada de {random.choice(["lechuga", "tomate", "huevo", "zanahoria", "pepino"])}',
        f'Hamburguesa con {random.choice(["queso", "panceta", "huevo", "cebolla caramelizada"])}',
        f'Empanadas de {random.choice(["carne", "pollo", "verdura", "jamón y queso"])}',
        f'Tarta de {random.choice(["jamón y queso", "verdura", "pollo", "calabaza"])}',
        f'Sushi de {random.choice(["salmón", "atún", "langostinos", "vegetales"])}',
        f'Wok de {random.choice(["verduras", "pollo", "carne", "camarones"])}'
    ]
    def insert_random_product():
        name = f'{random.choice(name_subj)} {random.choice(name_compl)}'
        description = random.choice(descriptions)
        price = round(random.uniform(150.0, 500.0), 2)
        image = random.choice(images)
        type = random.choice(product_types)

        if check_name_already_exists(name):
            print(f'Product {name} already exists. Skipping...')
            return False

        new_product = Product(
            type=type,
            name=name,
            description=description,
            stock=random.randint(1, 50),
            image=image,
        )

        db.session.add(new_product)
        db.session.commit()
        return True

    @app.cli.command("populate-products")
    def insert_random_products():
        count = 0
        while count < 10:
            if insert_random_product():
                count += 1
                print(f'Product {count} created.')
            