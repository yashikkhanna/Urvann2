import "./CartSidebar.css";

export default function CartSidebar({
  open,
  setOpen,
  cartItems,
  onClearCart,
  onPlaceOrder,
  onUpdateItem,
  onRemoveItem,
}) {
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
    0
  );

  return (
    <>
      {open && <div className="cart-overlay" onClick={() => setOpen(false)}></div>}

      <div className={`cart-sidebar ${open ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setOpen(false)}>
          ✖
        </button>

        <div className="cart-content">
          <h2>Your Cart</h2>

          {cartItems.length === 0 ? (
            <p className="empty-cart">Your cart is empty</p>
          ) : (
            <>
              <ul className="cart-items">
                {cartItems.map((item) => (
                  <li key={item.plant._id} className="cart-item">
                    <img
                      src={item.plant.image || "/default-plant.jpg"}
                      alt={item.plant.name || "Plant"}
                      className="cart-item-img"
                    />
                    <div>
                      <strong>{item.plant.name || "Unknown Plant"}</strong>
                      <p>₹{item.price} × {item.quantity}</p>

                      <div className="quantity-controls">
                        <button onClick={() => onUpdateItem(item.plant._id, item.quantity - 1)}>
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => onUpdateItem(item.plant._id, item.quantity + 1)}>
                          +
                        </button>
                      </div>

                      <button
                        className="remove-item"
                        onClick={() => onRemoveItem(item.plant._id)}
                      >
                        Remove
                      </button>
                    </div>

                    <p className="item-total">
                      ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="cart-subtotal">
                <span>Subtotal:</span>
                <strong>₹{subtotal.toFixed(2)}</strong>
              </div>

              <div className="cart-actions">
                <button className="clear-btn" onClick={onClearCart}>
                  Clear Cart
                </button>
                <button className="order-btn" onClick={onPlaceOrder}>
                  Place Order
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
