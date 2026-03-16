import express from "express";
import {
  placeOrder,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  verifyRazorpay,
  deleteOrder,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

// Admin
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/delete", adminAuth, deleteOrder);

// User payments
orderRouter.post("/place", authUser, placeOrder); // COD
orderRouter.post("/razorpay", authUser, placeOrderRazorpay);
orderRouter.post("/verifyRazorpay", authUser, verifyRazorpay);

// User orders
orderRouter.post("/userorders", authUser, userOrders);

export default orderRouter;