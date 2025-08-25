import express from "express";
import {createOrder,getUserOrders,getOrderById,updateOrderStatus,cancelOrder,getAllOrders,} from "../controllers/orderController.js";
import {isAdminAuthenticated,isCustomerAuthenticated} from "../middlewares/auth.js";

const router = express.Router();

router.post("/new",isCustomerAuthenticated,createOrder);
router.get("/my-orders",isCustomerAuthenticated, getUserOrders);
router.get("/order/:id",isCustomerAuthenticated, getOrderById);
router.put("/:id/cancel",isCustomerAuthenticated, cancelOrder);
router.put("/:id/status", isAdminAuthenticated, updateOrderStatus);
router.get("/all-orders",isAdminAuthenticated,getAllOrders);

export default router;
