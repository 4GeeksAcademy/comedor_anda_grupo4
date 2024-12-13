import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/cart.css"

const ProductCO = ({ onPayClick }) => {
    const { store, actions } = useContext(Context);

    const handlePaymentClick = async () => {
        await actions.setOrder();
        await actions.getLastOrder();
        // Llamar a la función pasada desde Checkout
        onPayClick();
    };

    const handleQuantityChange = (index, value) => {
        const updatedCart = store.cart.map((item, idx) => {
            if (idx === index) {
                return { ...item, quantity: Math.max(1, value) };
            }
            return item;
        });

        actions.setCart(updatedCart);
    };

    // Calcular el total basándose en store.cart
    const calculateTotal = () => {
        return store.cart.reduce((total, item) => total + item.price * (item.quantity || 1), 0);
    };

    return (
        
        <div className="container my-4" style={{ maxWidth: "400px", margin: "0 auto" }}>
            <div className="row border">
                <div className="col-12">
                    <div className="panel panel-info mt-2">
                        <div className="panel-heading">
                            <div className="panel-title text-center">
                                <p className="fs-5 fw-bold">
                                    <i className="fa-solid fa-cart-shopping"></i> Shopping Cart
                                </p>
                            </div>
                        </div>

                        <div className="panel-body mt-2">
                            {store.cart.length > 0 ? (
                                store.cart.map((item, index) => (
                                    <div
                                        className="d-flex align-items-center border-bottom py-2"
                                        key={index}
                                        style={{ fontSize: "0.9rem" }}
                                    >
                                        {/* Imagen del producto */}
                                        <div className="flex-shrink-0" style={{ width: "60px" }}>
                                            <img
                                                className="img-fluid"
                                                src={item.image || "https://via.placeholder.com/150x100"}
                                                alt="Product"
                                                style={{ width: "60px", height: "40px", objectFit: "cover" }}
                                            />
                                        </div>

                                        {/* Nombre y precio del producto */}
                                        <div className="flex-grow-1 ms-2">
                                            <h6 className="mb-1 text-truncate">{item.name}</h6>
                                            <p className="mb-0 text-muted">${item.price}</p>
                                        </div>

                                        {/* Selector de cantidad bloqueado */}
                                        <div className="d-flex align-items-center">
                                            <input
                                                type="number"
                                                className="form-control form-control-sm text-center mx-1"
                                                value={item.quantity || 1}
                                                readOnly
                                            />
                                        </div>

                                        {/* Botón eliminar */}
                                        <button
                                            type="button"
                                            className="btn btn-link btn-sm text-danger"
                                            onClick={() => actions.removeFromCart(index)}
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted text-center">Your cart is empty</p>
                            )}
                        </div>

                        {/* Footer del carrito */}
                        <div className="panel-footer mt-3">
                            <div className="row align-items-center">
                                <div className="col-6 text-start">
                                    <h5 style={{ fontSize: "1rem" }}>
                                        Total: <strong>${calculateTotal()}</strong>
                                    </h5>
                                </div>

                                <div className="col-6 text-end">
                                    <button
                                        type="button"
                                        className="btn btn-success mb-2"
                                        onClick={handlePaymentClick}
                                        
                                    >
                                        Pagar en Efectivo
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-success mb-2"
                                        onClick={handlePaymentClick}
                                        
                                    >
                                        Mercado Pago
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCO;

