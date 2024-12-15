import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Context } from "../store/appContext";



export const Navbar = () => {
    const { store, actions } = useContext(Context);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    const isLoggedIn = store.token || sessionStorage.getItem("auth_token");

    const navigate = useNavigate();
    

    // Detectar si la pantalla es pequeña
    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 992); // Pantallas < 992px (Bootstrap lg breakpoint)
        };

        handleResize(); // Ejecutar en la primera carga
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    let location = useLocation();
    
        useEffect(() => {
            if (store.user_type === "false" && location.pathname == "/dashboard/cocina" ){
                navigate("/menu");
            }
        }, [store.user_type]);
    

return (
        <nav className="navbar navbar-light px-0 w-100" style={{ backgroundColor: '#4364dd'}}>
            <div className="container-fluid mx-0">
                {/* Logo */}
                <Link to="/">
                    <span className="navbar-brand mb-0 h1">
                        <img
                            src="https://anda.com.uy/wp-content/themes/Divi-child/images/logo-anda.svg"
                            style={{ width: "3rem" }}
                            alt="Logo"
                        />
                    </span>
                </Link>
                                
    
                {/* Dropdown en pantallas pequeñas */}
                {isSmallScreen ? (
                    <div className="dropdown ms-auto">
                        <div className="ml-auto d-flex align-items-center">
                            {/* Cart Dropdown */}
                            <div className={`dropdown me-3 ${!isLoggedIn ? "d-none" : ""}`}>
                                <button
                                    className="btn btn-light dropdown-toggle"
                                    type="button"
                                    id="dropdownMenuButton"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <span className="navbar-toggler-icon"></span>
                                </button>
                                <ul
                                    className="dropdown-menu dropdown-menu-end"
                                    aria-labelledby="dropdownMenuButton"
                                >
                                    {/* Logout como categoría */}
                                    {isLoggedIn && (
                                        <>
                                        <li>
                                            <Link to="/menu">
                                                <button className="btn btn-light w-100">Menu</button>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/reserve">
                                                <button className="btn btn-light w-100">Comedor</button>
                                            </Link>
                                        </li>
                                        <li>
                                            {store.user_type && <Link to="/dashboard/cocina" className="text-decoration-none">
                                                <button className="btn btn-light w-100">Cocina Pedidos</button>
                                            </Link>}
                                        </li>
                                        <li className="dropdown-item">
                                            <button
                                                className="btn btn-danger w-100"
                                                onClick={() => actions.logout()}
                                            >
                                                Log out
                                            </button>
                                        </li>
                                        </>
                                    )}
                                    {/* Opción de Login si no está autenticado */}
                                    {!isLoggedIn && (
                                        <li>
                                            <Link to="/login" className="dropdown-item">
                                                Login
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="d-flex ms-auto align-items-center">
                        
    
                        {/* Logout como botón en pantallas grandes */}
                        {isLoggedIn && (
                            <>
                                <Link to="/menu">
                                    <button className="btn btn-light me-2">Menu</button>
                                </Link>
                                <Link to="/reserve">
                                    <button className="btn btn-light me-2">Comedor</button>
                                </Link>
                                {store.user_type && <Link to="/dashboard/cocina" className="text-decoration-none me-2">
                                                <button className="btn btn-light w-100">Cocina Pedidos</button>
                                            </Link>}          
                                <button
                                    className="btn btn-danger"
                                    onClick={() => actions.logout()}
                                >
                                    Log out
                                </button>
                            </>
                        )}
                        {!isLoggedIn && (
                            <>
                            
                            <Link to="/login">
                                <button className="btn btn-light">Login</button>
                            </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
    