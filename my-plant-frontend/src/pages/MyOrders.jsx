import { useState, useEffect, useContext } from "react";
import { Context } from "../main";
import axios from "axios";
import { toast } from "react-toastify";
import "./MyOrders.css";

export default function MyOrders() {
  const { isAuthenticated } = useContext(Context);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/v1/orders/my-orders", {
          withCredentials: true,
        });
        setOrders(data.orders);
      } catch (err) {
        toast.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setCancelConfirm("");
  };

  const closeOrderDetails = () => setSelectedOrder(null);

  const handleCancelOrder = async () => {
    if (cancelConfirm !== "confirm") {
      toast.error("Type 'confirm' to cancel the order");
      return;
    }

    try {
      await axios.put(
        `http://localhost:4000/api/v1/orders/${selectedOrder._id}/cancel`,
        {},
        { withCredentials: true }
      );
      toast.success("Order cancelled successfully 🌿");
      setOrders(orders.map(o => o._id === selectedOrder._id ? { ...o, status: "Cancelled" } : o));
      closeOrderDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  };

  if (!isAuthenticated) return <p>Please login to view your orders.</p>;

  return (
    <div className="my-orders-container">
      <h2>My Orders</h2>
      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <ul className="orders-list">
          {orders.map((order, index) => (
            <li key={order._id} className="order-item" onClick={() => openOrderDetails(order)}>
              <div><strong>#{index + 1}</strong></div>
              <div><strong>Order Placed:</strong> {new Date(order.createdAt).toLocaleString()}</div>
              <div><strong>Status:</strong> {order.status}</div>
              <div><strong>Total:</strong> ₹{order.totalPrice.toFixed(2)}</div>
            </li>
          ))}
        </ul>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={closeOrderDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Order Details</h3>
            <p><strong>Order Placed:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
            <p><strong>Total:</strong> ₹{selectedOrder.totalPrice.toFixed(2)}</p>
            <p><strong>Shipping Address:</strong></p>
            <div className="address">
              {selectedOrder.address.fullName}, {selectedOrder.address.street}, {selectedOrder.address.landmark && `${selectedOrder.address.landmark},`} {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}
            </div>
            <h4>Items</h4>
            <ul className="order-items">
              {selectedOrder.items.map(item => (
                <li key={item.plant._id} className="order-item-detail">
                  <img src={item.plant.image || "/default-plant.jpg"} alt={item.plant.name} />
                  <div>
                    <strong>{item.plant.name}</strong>
                    <p>₹{item.priceAtTime} × {item.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>

            {selectedOrder.status !== "Cancelled" && selectedOrder.status !== "Delivered" && (
              <div className="cancel-section">
                <input
                  type="text"
                  placeholder="Type 'confirm' to cancel"
                  value={cancelConfirm}
                  onChange={(e) => setCancelConfirm(e.target.value)}
                />
                <button onClick={handleCancelOrder}>Cancel Order</button>
              </div>
            )}

            <button className="close-btn" onClick={closeOrderDetails}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
