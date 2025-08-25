import { useState, useContext } from "react";
import { Context } from "../main";   // ✅ import context
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./styles/Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(Context); // ✅ use context

  const [step, setStep] = useState("form");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "Customer",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        "https://urvann-pfz7.onrender.com//api/v1/user/register",
        formData,
        { withCredentials: true }
      );
      setMessage(data.message);
      setStep("otp");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        "https://urvann-pfz7.onrender.com//api/v1/user/verify-otp",
        { email: formData.email, otp },
        { withCredentials: true }
      );
      setMessage(data.message);
      setIsAuthenticated(true);   // ✅ now user becomes logged in
      navigate("/");
    } catch (error) {
      setMessage(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const { data } = await axios.post(
        "https://urvann-pfz7.onrender.com//api/v1/user/resend-otp",
        { email: formData.email },
        { withCredentials: true }
      );
      setMessage(data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="register-page">
      <div className="register-form">
        <h2>{step === "form" ? "Create Account" : "Verify OTP"}</h2>
        <p className="register-subtitle">
          {step === "form"
            ? "Fill in your details to get started."
            : "Enter the OTP sent to your email."}
        </p>

        {step === "form" && (
          <form onSubmit={handleRegister}>
            <input type="text" name="firstName" placeholder="First Name"
              value={formData.firstName} onChange={handleChange} required />
            <input type="text" name="lastName" placeholder="Last Name"
              value={formData.lastName} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email"
              value={formData.email} onChange={handleChange} required />
            <input type="text" name="phone" placeholder="Phone Number"
              value={formData.phone} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password"
              value={formData.password} onChange={handleChange} required />
            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <input type="text" placeholder="Enter OTP"
              value={otp} onChange={(e) => setOtp(e.target.value)} required />
            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <p className="resend-text">
              Didn’t get OTP?{" "}
              <span onClick={handleResendOtp} className="resend-link">Resend</span>
            </p>
          </form>
        )}

        {message && <p className="message">{message}</p>}

        {step === "form" && (
          <div className="login-link">
            <p>
              Already registered?{" "}
              <Link to="/login" className="login-anchor">Login here</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
