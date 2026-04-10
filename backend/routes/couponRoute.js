import express from "express";
import {
  createCoupon,
  listCoupons,
  toggleCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/couponController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const couponRouter = express.Router();

// Admin routes
couponRouter.post("/create",   adminAuth, createCoupon);
couponRouter.get("/list",      adminAuth, listCoupons);
couponRouter.post("/toggle",   adminAuth, toggleCoupon);
couponRouter.post("/delete",   adminAuth, deleteCoupon);

// User route
couponRouter.post("/validate", authUser, validateCoupon);

export default couponRouter;