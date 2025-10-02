import { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { toast } from "react-toastify";
import axios from "axios";
import { FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import CartSidebar from "./CartSidebar";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, setIsAuthenticated, cart, setCart } = useContext(Context);
  const navigate = useNavigate();

  const [cartOpen, setCartOpen] = useState(false);
  // handle logout
  const handleLogout = async () => {
  try {
    await axios.post(
      "https://urvann2.onrender.com/api/v1/user/customer/logout",
      {}, // body is empty
      { withCredentials: true }
    );

    // ✅ Clear auth + cart state
    setIsAuthenticated(false);
    setCart({ items: [] });

    // ✅ Redirect to homepage (or login page)
    navigate("/");

    toast.success("Logged out successfully 🌿");
  } catch (err) {
    toast.error("Failed to log out");
  }
};


  // Fetch full cart
  const fetchCart = async () => {
    try {
      const { data } = await axios.get("https://urvann2.onrender.com/api/v1/cart", {
        withCredentials: true,
      });
      setCart({
        items: (data.cart.items || []).map((i) => ({
          plant: i.plant || {},
          quantity: i.quantity || 0,
          price: i.priceAtTime || 0,
        }))
      });
    } catch (err) {
      console.error("Fetch cart error:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  const handleUpdateItem = async (plantId, quantity) => {
    if (!plantId) return;
    try {
      if (quantity <= 0) {
        await handleRemoveItem(plantId);
        return;
      }
      await axios.put(
        "https://urvann2.onrender.com/api/v1/cart/update",
        { plantId, quantity },
        { withCredentials: true }
      );
      await fetchCart(); // update global cart
    } catch (err) {
      toast.error("Failed to update item");
    }
  };

  const handleRemoveItem = async (plantId) => {
    if (!plantId) return;
    try {
      await axios.delete(
        "https://urvann2.onrender.com/api/v1/cart/remove",
        { data: { plantId }, withCredentials: true }
      );
      await fetchCart(); // update global cart
      toast.success("Item removed 🌿");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    try {
      await axios.delete("https://urvann2.onrender.com/api/v1/cart/clear", { withCredentials: true });
      setCart({ items: [] });
      toast.success("Cart cleared 🌿");
    } catch (err) {
      toast.error("Failed to clear cart");
    }
  };

  const handlePlaceOrder = () => {
    setCartOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo"><Link to="/">Murvann</Link></div>
        <div className="navbar-promo">✨ Free Next Day Delivery on Orders Received by 7 PM ✨</div>
        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/help">Get Help</Link></li>
          {isAuthenticated ? (
    <>
      <li><Link to="/my-orders">My Orders</Link></li>  {/* NEW LINK */}
      <li>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </li>
    </>
  ) : (
    <li><Link to="/login">Login</Link></li>
  )}
          <li className="cart-wrapper">
            <FaShoppingCart size={18} className="cart-icon" onClick={() => setCartOpen(true)} />
            {cart.items.length > 0 && <span className="cart-count">{cart.items.length}</span>}
          </li>
        </ul>
      </nav>

      <CartSidebar
        open={cartOpen}
        setOpen={setCartOpen}
        cartItems={cart.items}
        onClearCart={handleClearCart}
        onUpdateItem={handleUpdateItem}
        onRemoveItem={handleRemoveItem}
        onPlaceOrder={handlePlaceOrder}
      />
    </>
  );
};

export default Navbar;
