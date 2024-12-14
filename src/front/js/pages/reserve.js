import React from "react";
import Dining from "../component/dining";

const Reserve = () => {
    return (
        <div className="d-flex justify-content-center pt-4">
            <div>
                <h1 className="container fluid bg-primary text-white text-center">Reserva comedor</h1>
                <Dining></Dining>
            </div>
        </div>
    )
};

export default Reserve