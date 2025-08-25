import express from "express";
import { addToCart, updateCartItem, removeCartItem, getCart, clearCart } from "../controllers/cartControllers.js";
import {isCustomerAuthenticated} from "../middlewares/auth.js";

const router = express.Router();

router.post("/add",isCustomerAuthenticated,addToCart);
router.put("/update", isCustomerAuthenticated, updateCartItem);
router.delete("/remove", isCustomerAuthenticated, removeCartItem);
router.get("/", isCustomerAuthenticated, getCart);
router.delete("/clear",isCustomerAuthenticated, clearCart);

export default router;
