import express from "express";
import { register,verifyOTP,resendOtp,login,logoutAdmin,logoutCustomer , getUserDetails} from "../controllers/userController.js";
import { isCustomerAuthenticated , isAdminAuthenticated } from "../middlewares/auth.js";
const router = express.Router();

// @route   POST /api/v1/register
// @desc    Register user and send OTP
router.post("/register", register);

// @route   POST /api/v1/verify-otp
// @desc    Verify OTP and activate account
router.post("/verify-otp", verifyOTP);

// @route   POST /api/v1/resend-otp
// @desc    Resend OTP
router.post("/resend-otp", resendOtp);

// @route   POST /api/v1/login
// @desc    Login user
router.post("/login", login);
router.post("/admin/logout",isAdminAuthenticated,logoutAdmin);
router.post("/customer/logout",isCustomerAuthenticated,logoutCustomer);
router.get("/customer/me",isCustomerAuthenticated,getUserDetails);
router.get("/admin/me",isAdminAuthenticated,getUserDetails);

export default router;
