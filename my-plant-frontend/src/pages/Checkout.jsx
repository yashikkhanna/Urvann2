import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Context } from "../main";
import "./Checkout.css";

export default function Checkout() {
  const { isAuthenticated, cart, setCart } = useContext(Context); // use context cart
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "COD",
  });
  const [loading, setLoading] = useState(false);

  // Fetch cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await axios.get("https://urvann2.onrender.com/api/v1/cart", {
          withCredentials: true,
        });
        setCart(data.cart || { items: [], totalPrice: 0 }); // update global context
      } catch (err) {
        toast.error("Failed to fetch cart");
      }
    };
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, setCart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("You need to be logged in to place an order");
      return;
    }
    if (cart.items.length === 0) {
      toast.error("Cart is empty!");
      return;
    }

    setLoading(true);
    try {
      const addressPayload = {
        fullName: form.fullName,
        phone: form.phone,
        street: form.street,
        landmark: form.landmark,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      };

      await axios.post(
        "https://urvann2.onrender.com/api/v1/orders/new",
        { address: addressPayload, paymentMethod: form.paymentMethod },
        { withCredentials: true }
      );

      toast.success("Order placed successfully 🌿");

      // Clear cart globally after order
      setCart({ items: [], totalPrice: 0 });

      navigate("/"); // redirect to home
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      {/* Cart Summary */}
      <div className="checkout-cart">
        <h3>Your Cart</h3>
        {cart.items.length === 0 ? (
          <p className="empty-cart">Cart is empty</p>
        ) : (
          <>
            <ul className="checkout-cart-items">
              {cart.items.map((item) => (
                <li key={item.plant._id} className="checkout-cart-item">
                  <img
                    src={item.plant.image || "/default-plant.jpg"}
                    alt={item.plant.name}
                  />
                  <div className="checkout-cart-item-info">
                    <strong>{item.plant.name}</strong>
                    <p>
                      ₹{item.priceAtTime} × {item.quantity}
                    </p>
                  </div>
                  <span className="checkout-item-total">
                    ₹{(item.priceAtTime * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="checkout-cart-total">
              <strong>
                Total: ₹
                {cart.items
                  .reduce((acc, i) => acc + i.priceAtTime * i.quantity, 0)
                  .toFixed(2)}
              </strong>
            </div>
          </>
        )}
      </div>

      {/* Checkout Form */}
      <form className="checkout-form" onSubmit={handleSubmit}>
        <h3>Shipping Details</h3>

        <label>
          Full Name:
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Phone:
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Street:
          <input
            type="text"
            name="street"
            value={form.street}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Landmark:
          <input
            type="text"
            name="landmark"
            value={form.landmark}
            onChange={handleChange}
          />
        </label>

        <label>
          City:
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          State:
          <input
            type="text"
            name="state"
            value={form.state}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Pincode:
          <input
            type="text"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Payment Method:
          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Netbanking">Netbanking</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}
