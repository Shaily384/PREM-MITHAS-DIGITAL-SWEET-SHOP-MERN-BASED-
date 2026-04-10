import express from "express";
import {
  placeOrder,
  verifyUpiPayment,
  placeOrderRazorpay,
  verifyRazorpay,
  placeOrderStripe,
  verifyStripe,
  allOrders,
  userOrders,
  updateStatus,
  deleteOrder,
  revenueStats,
  markPaymentDone,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser  from "../middleware/auth.js";

const orderRouter = express.Router();

// ── Admin ──────────────────────────────────────────
orderRouter.post("/list",          adminAuth, allOrders);
orderRouter.post("/status",        adminAuth, updateStatus);
orderRouter.post("/delete",        adminAuth, deleteOrder);
orderRouter.post("/mark-payment",  adminAuth, markPaymentDone);
orderRouter.get("/revenue-stats",  adminAuth, revenueStats);

// ── Payments (user) ────────────────────────────────
orderRouter.post("/place",          authUser, placeOrder);          // COD / generic
orderRouter.post("/verify-upi",     authUser, verifyUpiPayment);    // UPI verification
orderRouter.post("/razorpay",       authUser, placeOrderRazorpay);  // Razorpay (disabled)
orderRouter.post("/verifyRazorpay", authUser, verifyRazorpay);      // Razorpay (disabled)
orderRouter.post("/stripe",         authUser, placeOrderStripe);    // Stripe checkout
orderRouter.post("/verifyStripe",   authUser, verifyStripe);        // Stripe verify

// ── User orders ────────────────────────────────────
orderRouter.post("/userorders",     authUser, userOrders);

export default orderRouter;