import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";

export const Home = () => {
    const { store, actions } = useContext(Context); // Access store and actions from Flux context

    useEffect(() => {
        actions.getProducts(); // Fetch products on component mount
    }, []);

    return (
        <div className="text-center d-flex justify-content-center flex-wrap flex-column align-items-center"
            style={{
            backgroundImage: 'url("https://anda.com.uy/wp-content/uploads/2024/08/institucional-banner.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            height: "100vh", // Full viewport height
            width: "100vw", // Full viewport width
            margin: "0",
            padding: "0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxSizing: "border-box", // Include padding in dimensions
            overflow: "hidden", // Prevent scroll
        }}
        >
            <h1 className="text-center mb-4 text-white fw-bold">Bienvenidos a la app de gestion del comedor!</h1>
            <p style={{ backgroundColor: '#4364dd', padding: '10px', borderRadius: '5px', width: '40%', }}>
                <img src="https://anda.com.uy/wp-content/themes/Divi-child/images/logo-anda.svg" alt="Logo" />
            </p>

        </div>
    );
};
