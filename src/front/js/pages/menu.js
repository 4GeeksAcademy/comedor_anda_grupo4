import React, { useContext, useEffect } from "react";
import Card from "../component/card";
import { Context } from "../store/appContext";
import Cart from "../component/cart";

export const Menu = () => {
    const { store, actions } = useContext(Context);

    useEffect(() => {
        actions.getProducts();
    }, []);

    // Categorías de productos
    const categories = [
        { type: "Menu Ejecutivo", title: "Menu Ejecutivo", color: "primary" },
        { type: "Minutas", title: "Minutas", color: "success" },
        { type: "Bebidas", title: "Bebidas", color: "info" },
    ];

    return (
        <div className="container-fluid my-5">
            <div className="row">
                {/* Sección de Productos */}
                <div className="col-lg-8">
                    {categories.map((category, idx) => {
                        const filteredProducts = store.products.filter(
                            (product) => product.type === category.type
                        );

                        return (
                            <div className="mb-5" key={idx}>
                                <div className={`card shadow-sm bg-${category.color} text-white mb-4`}>
                                    <div className="card-body text-center">
                                        <h2 className="card-title m-0">{category.title}</h2>
                                    </div>
                                </div>
                                <div className="row g-4">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product, index) => (
                                            <div className="col-sm-6 col-md-4" key={index}>
                                                <div
                                                    className="card shadow-sm h-100 border-0"
                                                    style={{
                                                        transition: "transform 0.3s",
                                                    }}
                                                    onMouseEnter={(e) =>
                                                        (e.currentTarget.style.transform = "scale(1.05)")
                                                    }
                                                    onMouseLeave={(e) =>
                                                        (e.currentTarget.style.transform = "scale(1)")
                                                    }
                                                >
                                                    <Card item={product} />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted text-center">
                                            No products available for this category
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Sección del Carrito */}
                <div className="col-lg-4">
                    <Cart />
                </div>
            </div>
        </div>
    );
};

export default Menu;
