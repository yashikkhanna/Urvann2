import { useContext, useEffect, useState } from "react";
import SidebarToggle from "../components/SidebarToggle";
import FilterForm from "../components/FilterForm";
import axios from "axios";
import { Context } from "../main";
import "./Home.css";

const Home = () => {
  const { cart, setCart } = useContext(Context);
  const [plants, setPlants] = useState([]);
  const [filters, setFilters] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchPlants = async (appliedFilters = {}) => {
    try {
      let query = "";
      const keys = Object.keys(appliedFilters);
      if (keys.length > 0) {
        const params = new URLSearchParams(appliedFilters).toString();
        query = `?${params}`;
      }
      const { data } = await axios.get(
        `http://localhost:4000/api/v1/plant/getPlants${query}`,
        { withCredentials: true }
      );
      setPlants(data.plants || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToCart = async (plantId) => {
    try {
      await axios.post(
        "http://localhost:4000/api/v1/cart/add",
        { plantId, quantity: 1 },
        { withCredentials: true }
      );
      // fetch updated cart
      const { data } = await axios.get("http://localhost:4000/api/v1/cart", { withCredentials: true });
      setCart({
        items: (data.cart.items || []).map((i) => ({
          plant: i.plant || {},
          quantity: i.quantity || 0,
          price: i.priceAtTime || 0,
        }))
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateQuantity = async (plantId, quantity) => {
    try {
      if (quantity <= 0) {
        await axios.delete("http://localhost:4000/api/v1/cart/remove", {
          data: { plantId },
          withCredentials: true,
        });
      } else {
        await axios.put(
          "http://localhost:4000/api/v1/cart/update",
          { plantId, quantity },
          { withCredentials: true }
        );
      }
      const { data } = await axios.get("http://localhost:4000/api/v1/cart", { withCredentials: true });
      setCart({
        items: (data.cart.items || []).map((i) => ({
          plant: i.plant || {},
          quantity: i.quantity || 0,
          price: i.priceAtTime || 0,
        }))
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getCartQuantity = (plantId) => {
    const item = cart.items.find((i) => i.plant._id === plantId);
    return item ? item.quantity : 0;
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  return (
    <div className="home-container">
      <SidebarToggle onToggle={(open) => setSidebarOpen(open)}>
        <FilterForm onApply={(f) => { setFilters(f); fetchPlants(f); }} />
      </SidebarToggle>

      <div className={`plant-grid ${sidebarOpen ? "shifted" : ""}`}>
        {plants.length > 0 ? plants.map((plant) => {
          const quantity = getCartQuantity(plant._id);
          return (
            <div className="plant-card" key={plant._id}>
              <img src={plant.image || "/default-plant.jpg"} alt={plant.name} className="plant-img" />
              <h3>{plant.name}</h3>
              <p className="price">₹{plant.price}</p>
              {!plant.inStock && <p className="stock">Out of Stock ❌</p>}
              <p className="category">Categories: {plant.categories?.join(", ")}</p>
              {plant.description && <p className="description">{plant.description}</p>}

              {quantity > 0 ? (
                <div className="cart-quantity">
                  <button onClick={() => handleUpdateQuantity(plant._id, quantity - 1)}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => handleUpdateQuantity(plant._id, quantity + 1)}>+</button>
                </div>
              ) : (
                <button className="add-to-cart" disabled={!plant.inStock} onClick={() => handleAddToCart(plant._id)}>
                  Add to Cart
                </button>
              )}
            </div>
          )
        }) : (<p className="no-plants">No plants available</p>)}
      </div>
    </div>
  )
}

export default Home;
