import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";

const Invoice = () => {
  const { store, actions } = React.useContext(Context);
  const { orders, products, orderToPay } = store;
  const [currentView, setCurrentView] = useState("orders"); 
  const [searchQuery, setSearchQuery] = useState(""); // 
  const [message, setMessage] = useState(null); // State for messages

  // Fetch products and orders on mount
  useEffect(() => {
    actions.getLastOrder();
    actions.getProducts();  
  }, []);

  const placeholderImage =
    "https://res.cloudinary.com/dnmm7omko/image/upload/v1733842727/ubstteb7dmizj50zozse.webp";

  const calculateOrderTotal = (products) => {
    return products?.reduce((sum, product) => sum + (product.price || 0) * (product.quantity || 1), 0).toFixed(2);
  };

  // Filter orders based on search query
  const filteredOrders = orderToPay.filter((order) =>
    order.order_number?.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (!response.ok) throw new Error("Failed to update status");
  
      const updatedOrder = await response.json();
      actions.updateOrderInStore(updatedOrder); // Update the local store (you may need to implement this)
      setMessage({ type: "success", text: "Order status updated successfully." });
    } catch (error) {
      console.error("Error updating order status:", error);
      setMessage({ type: "error", text: "Failed to update order status." });
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-2 text-center">Detalle de Pago</h1>

      {/* Action and Search Section */}
      

      {/* Display message */}
      {message && (
        <div className={`alert alert-${message.type === "success" ? "success" : "danger"} mt-3`} role="alert">
          {message.text}
        </div>
      )}

      {/* Conditionally Render Content */}
      {currentView === "orders" ? (
        <div className="table-responsive mt-3">
          <table className="table table-secondary table-striped">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Orden</th>
                <th>Estado</th>
                <th>Monto</th>
                <th>Unidades</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <React.Fragment key={order.id || index}>
                    <tr>
                      <td>{new Date(order.date).toLocaleDateString() || "N/A"}</td>
                      <td>{order.order_number || "N/A"}</td>
                      <td>
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-secondary dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            {order.status || "N/A"}
                          </button>
                          <ul className="dropdown-menu">
                            {[
                              "Pendiente",
                              "En produccion",
                              "Completada",
                              "Cancelada",
                            ].map((status) => (
                              <li key={status}>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleStatusChange(order.id, status)}
                                >
                                  {status}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                      <td>${calculateOrderTotal(order.products)}</td>
                    </tr>
                    {order.products?.length > 0 ? (
                      order.products.map((product, productIndex) => (
                        <tr key={productIndex}>
                          <td colSpan="1"></td>
                          <td>{product.name || "N/A"}</td>
                          <td>
                            <img
                              src={product.image || placeholderImage}
                              alt={product.name || "Product"}
                              style={{ width: "50px" }}
                            />
                          </td>
                          <td>{`$${product.price || 0}`}</td>
                          <td>{product.quantity || 1}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">No products in this order.</td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-responsive mt-3">
          <h2>Productos en el Menu</h2>
          <table className="table table-secondary table-striped">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Stock</th>
                <th>Precio</th>
                <th>Imagen</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="4">No products found.</td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name || "N/A"}</td>
                    <td>{product.stock !== undefined ? product.stock : "N/A"}</td>
                    <td>{`$${product.price || 0}`}</td>
                    <td>
                      <img
                        src={product.image || placeholderImage}
                        alt={product.name || "Item"}
                        style={{ width: "50px" }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Invoice;
