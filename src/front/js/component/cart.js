import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";

const Cart = () => {
    const { store, actions } = useContext(Context);
    
    // Initialize quantities with default values based on the cart items
    const [quantities, setQuantities] = useState(
        store.cart.reduce((acc, item, index) => {
            acc[index] = 1; // Set a default quantity of 1
            return acc;
        }, {})
    );

    // Handle quantity change
    const handleQuantityChange = (index, value) => {
        setQuantities((prevQuantities) => ({
            ...prevQuantities,
            [index]: value,
        }));
    };

    // Ensure quantities are set properly when the cart updates
    useEffect(() => {
        setQuantities((prevQuantities) => {
            return store.cart.reduce((acc, item, index) => {
                if (prevQuantities[index] === undefined) {
                    acc[index] = 1; // Default to 1 if not set yet
                }
                return acc;
            }, prevQuantities);
        });
    }, [store.cart]);

    return (
        <div className="container my-4">
            <div className="row border">
                <div className="col-xs-8">
                    <div className="panel panel-info mt-2">
                        <div className="panel-heading">
                            <div className="panel-title">
                                <div className="row">
                                    <div className="col-6">
                                        <p className="fs-4 fw-bold"><i className="fa-solid fa-cart-shopping"></i>  Shopping Cart</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="panel-body mt-2">
                            {store.cart.length > 0 ? (
                                store.cart.map((item, index) => (
                                    <div className="row" key={index}>
                                        <div className="col-2">
                                            <img className="img-responsive" src="http://placehold.it/100x70" alt="Product"/>
                                        </div>
                                        <div className="col-4">
                                            <h4 className="product-name"><strong>{item.name}</strong></h4>
                                            <h4><small>Product description</small></h4>
                                            <div className="row">
                                                <div className="col-4">
                                                    <p className="product-name fs-4">Product name</p>
                                                </div>
                                                <div className="col-6 row">
                                                    <div className="col-6 text-end">
                                                        <p className="fs-5 text">${item.price} <span className="text-muted">x</span></p>
                                                    </div>
                                                    <div className="col-4">
                                                        <input 
                                                            type="number" 
                                                            className="form-control input-sm" 
                                                            value={quantities[index] || 1}  // Ensure value is always a number
                                                            onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div className="col-2">
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-link btn-xs" 
                                                            onClick={() => actions.removeFromCart(index)}
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <li className="dropdown-item text-muted">Your cart is empty</li>
                            )}
                        </div>

                        <div className="panel-footer mb-2">
                            <div className="row text-center">
                                <div className="col-9">
                                    <h4 className="text-right">
                                        Total <strong>${store.cart.reduce((total, item, index) => total + item.price * (quantities[index] || 1), 0)}</strong>
                                    </h4>
                                </div>
                                <div className="col-3">
                                    <button type="button" className="btn btn-success btn-block">
                                        Checkout
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

export default Cart;
