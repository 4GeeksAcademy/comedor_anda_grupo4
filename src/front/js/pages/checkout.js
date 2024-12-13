import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import ProductCO from "../component/productCO";
import "../../styles/home.css";
import Invoice from "../component/invoice";

export const CheckOut = () => {
    const { store, actions } = useContext(Context);

    useEffect(() => {
        actions.getProducts();
        actions.getLastOrder();
    }, []);

    // Categorías de productos
    const categories = [
        { type: "Menu Ejecutivo", title: "Menu Ejecutivo", color: "primary" },
        { type: "Minutas", title: "Minutas", color: "success" },
        { type: "Bebidas", title: "Bebidas", color: "info" },
    ];

    return (
                <div className="container mx-5">
                    <ProductCO />
                    <Invoice />
                </div>
    );
};

export default CheckOut;