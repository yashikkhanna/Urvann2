// import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useContext, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Context } from "./main";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
const App = () => {
  const { setIsAuthenticated, setUser } = useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "https://urvann2.onrender.com/api/v1/user/customer/me",
          { withCredentials: true }
        );
        setIsAuthenticated(true);
        setUser(response.data.user);
      } catch (error) {
        setIsAuthenticated(false);
        setUser({});
        toast.error("Failed to fetch user. Please log in.");
      }
    };
    fetchUser();
  }, []);

  return (
    <>
    <Router>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout/>} />
          <Route path="/my-orders" element={<MyOrders />} />
        </Routes>
        <ToastContainer position="top-center" />
      </Router>
    </>
  );
}

export default App;
