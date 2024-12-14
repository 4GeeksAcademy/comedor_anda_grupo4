const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            token: sessionStorage.getItem("auth_token") || null,
            user_type: sessionStorage.getItem("user_type") || null,
            error: null,
            products: [],
            cart: [],
            orders: [],
            order_data: [],
            reserve: [],
        },
        actions: {
            // Utility function to make API calls with common headers
            apiCall: async (url, options = {}) => {
                const token = getStore().token;
                const headers = {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` }),
                };

                const response = await fetch(url, { ...options, headers });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.msg || "Unknown error");
                }
                return response.json();
            },

            // Consolidate cart items to remove duplicates and sum quantities
            consolidateCart: (cart) => {
                return cart.reduce((acc, item) => {
                    const existing = acc.find(i => i.product_id === item.product_id);
                    if (existing) {
                        existing.quantity += item.quantity;
                    } else {
                        acc.push({ ...item });
                    }
                    return acc;
                }, []);
            },

            // Login action
            login: async (email, password) => {
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        setStore({ error: errorData.msg });
                        return { success: false };
                    }
            
                    const data = await response.json();
            
                    // Store the token and user type in sessionStorage
                    sessionStorage.setItem("auth_token", data.token);
                    sessionStorage.setItem("user_type", data.user_type);
            
                    // Update the store with token and user_type
                    setStore({
                        token: data.token,
                        user_type: data.user_type,
                        error: null, // Clear any existing error
                    });
            
                    console.log("Session storage updated and state set.");
                   
            
                    // Return success and the URL to redirect to
                    return { success: true, redirectUrl: data.redirect_url };
                } catch (error) {
                    console.error("Login error:", error);
                    setStore({ error: "Network error. Please try again." });
                    return { success: false };
                }
            },
            

            logout: () => {
                sessionStorage.removeItem("auth_token");
                sessionStorage.removeItem("user_type");
                setStore({
                    token: null,
                    user_type: null,
                    cart: [],
                    orders: [],
                    products: [],
                    error: null,
                });
                console.log("User logged out.");
            },

            // Fetch orders
            getOrders: async () => {
                try {
                    const data = await getActions().apiCall(process.env.BACKEND_URL + "/api/orders");
                    if (data && Array.isArray(data.orders)) {
                        setStore({ orders: data.orders });
                        console.log("Fetched products:", data);
                    } else {
                        console.error("Unexpected response format:", data);
                        setStore({ orders: [] });
                    }
                } catch (error) {
                    console.error("Error fetching orders:", error);
                    setStore({ orders: [] });
                }
            },
             // Fetch orders
            getOrders: async () => {
                try {
                    const data = await getActions().apiCall(process.env.BACKEND_URL + "/api/orders");
                    if (data && Array.isArray(data.orders)) {
                        setStore({ orders: data.orders });
                        console.log("Fetched products:", data);
                    } else {
                        console.error("Unexpected response format:", data);
                        setStore({ orders: [] });
                    }
                } catch (error) {
                    console.error("Error fetching orders:", error);
                    setStore({ orders: [] });
                }
            },

            addReserve: async (reservas) => {
                const token=getStore().token
                try {
                    const response = await fetch(process.env.BACKEND_URL + "api/reserve", {
                        method: "POST",
                        headers: { "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                         },
                        body:JSON.stringify(reservas)
                    });
                    // if (data && Array.isArray(data.reserve)) {
                    //     setStore({ reserve: data.reserve });
                    //     console.log("Fetched products:", data);
                    // } else {
                    //     console.error("Unexpected response format:", data);
                    //     setStore({ reserve: [] });
                    // }
                    console.log(response)
                } catch (error) {
                    console.error("Error fetching reserve:", error);
                    setStore({ reserve: [] });
                }
            },

            // Publish a new product
            publishProduct: async (formData) => {
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/products", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${getStore().token}`,
                        },
                        body: formData,
                      
                    });

                    if (!response.ok) {
                        const data = await response.json();
                        return { success: false, message: data.message || "Failed to publish product." };
                    }

                    return { success: true, message: "Product created successfully." };
                } catch (error) {
                    console.error("Error during API call:", error);
                    return { success: false, message: "An error occurred while creating the product." };
                }
            },

            toggleProductActive: async (productId) => {
                const store = getStore(); // Obtiene el store actual
                try {
                    // Realiza una solicitud PATCH al endpoint
                    const response = await fetch(`${process.env.BACKEND_URL}/api/product/toggle_active/${productId}`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
            
                    // Verifica si la solicitud fue exitosa
                    if (response.ok) {
                        const data = await response.json();
                        console.log(data.msg);
            
                        // Actualiza el estado del producto en la lista
                        const updatedProducts = store.products.map((product) => {
                            if (product.id === productId) {
                                return { ...product, is_active: !product.is_active }; // Invierte is_active
                            }
                            return product;
                        });
                        setStore({ products: updatedProducts });
            
                        return true; // Indica éxito
                    } else {
                        const errorText = await response.text(); // Maneja errores del servidor
                        console.error(`Error: ${errorText}`);
                        return false; // Indica fallo
                    }
                } catch (error) {
                    console.error("Error while toggling product active status:", error);
                    return false; // Indica fallo
                }
            },
            
            setOrder: async () => {
                const store = getStore();
                const actions = getActions();
            
                const consolidatedCart = actions.consolidateCart(store.cart);
            
                try {
                    const token = store.token;
                    if (!token) {
                        console.error("Token not found. Please log in.");
                        return { success: false, message: "User token not available." };
                    }
            
                    const response = await fetch(`${process.env.BACKEND_URL}/api/orders`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({ cart: consolidatedCart }),
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error("API Error:", errorData);
                        return { success: false, message: errorData.msg || "Failed to create order." };
                    }
            
                    const data = await response.json();
                    console.log("Order created successfully:", data);
            
                    // Save the detailed order data in the store
                    setStore({ order_data: data, cart: [] });
                    localStorage.removeItem("cart");
            
                    return { success: true, message: "Order created successfully.", order: data };
                } catch (error) {
                    console.error("Error during API call:", error);
                    return { success: false, message: "An error occurred while creating the order." };
                }
            },
            updateOrderInStore: (updatedOrder) => {
                const store = getStore();
                const updatedOrders = store.orders.map((order) =>
                    order.id === updatedOrder.id ? updatedOrder : order
                );
                setStore({ orders: updatedOrders });
            },

            getProducts: async () => {
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/products");
                    if (!response.ok) throw new Error("Failed to fetch products");

                    const data = await response.json();
                    if (Array.isArray(data.products)) {
                        setStore({ products: data.products });
                    } else {
                        console.error("Unexpected response format for products:", data);
                        setStore({ products: [] });
                    }
                } catch (error) {
                    console.error("Error fetching products:", error);
                }
            },

            addToCart: (product) => {
                const store = getStore();
                const existingItem = store.cart.find(item => item.product_id === product.id);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    store.cart.push({
                        product_id: product.id,
                        quantity: 1,
                        name: product.name,
                        price: product.price,
                    });
                }
                const updatedCart = [...store.cart];
                setStore({ cart: updatedCart });
                localStorage.setItem("cart", JSON.stringify(updatedCart));
                console.log("Cart updated:", updatedCart);
            },
            // Función para actualizar el carrito
            setCart: updatedCart => {
                setStore({ cart: updatedCart });
            },

            initializeCart: () => {
                const savedCart = localStorage.getItem("cart");
                if (savedCart) {
                    setStore({ cart: JSON.parse(savedCart) });
                }
            },

            removeFromCart: (index) => {
                const store = getStore();
                const updatedCart = store.cart.filter((_, i) => i !== index);
                setStore({ cart: updatedCart });
                localStorage.setItem("cart", JSON.stringify(updatedCart));
            },
            getMessage: async () => {
                try {
                    const data = await getActions().apiCall(process.env.BACKEND_URL + "/api/hello");
                    setStore({ message: data.message });
                    return data;
                } catch (error) {
                    console.error("Error loading message from backend", error);
                }
            },
        },
    };
};

export default getState;
