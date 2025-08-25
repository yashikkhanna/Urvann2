import { useState, useContext } from "react";
import { Context } from "../main";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import "./styles/Login.css";

const Login = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:4000/api/v1/user/login",
        { email, password, role: "Customer" },
        { withCredentials: true }
      );
      toast.success("Logged in successfully 🌿");
      setIsAuthenticated(true);
      navigateTo("/");
    } catch (e) {
      toast.error(e.response?.data?.message || "Login failed");
    }
  };

  if (isAuthenticated) return <Navigate to="/" />;

  return (
    <div className="login-page">
      <div className="login-form">
        <h2>Welcome Back!</h2>
        <p className="login-subtitle">Login to explore beautiful plants 🌱</p>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
        <div className="register-link">
          <p>
            Not Registered? <Link to="/register">Register Now</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
