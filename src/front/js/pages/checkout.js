import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import ProductCO from "../component/productCO";
import "../../styles/home.css";
import Invoice from "../component/invoice";

export const CheckOut = () => {
    const { store, actions } = useContext(Context);

    // Estado para controlar la renderización de Invoice
    const [showInvoice, setShowInvoice] = useState(false);

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
        {/* Pasar setShowInvoice como prop a ProductCO */}
        <ProductCO onPayClick={() => setShowInvoice(true)} />
        {/* Renderizar Invoice solo si showInvoice es true */}
        {showInvoice && <Invoice />}
    </div>
    );
};

export default CheckOut;