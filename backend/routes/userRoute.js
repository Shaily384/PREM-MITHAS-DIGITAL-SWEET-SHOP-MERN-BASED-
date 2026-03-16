import express from "express";
import {
  loginUser,
  registerUser,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  adminLogin,
  getUserProfile,
  getUserCount,
} from "../controllers/userController.js";
import authUser  from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import userModel from "../models/userModel.js";

const userRouter = express.Router();

userRouter.post("/register",        registerUser);
userRouter.post("/verify-otp",      verifyOtp);
userRouter.post("/resend-otp",      resendOtp);
userRouter.post("/login",           loginUser);
userRouter.post("/admin",           adminLogin);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password",  resetPassword);
userRouter.get("/profile",          authUser, getUserProfile);
userRouter.get("/count",            adminAuth, getUserCount);

userRouter.get("/list", adminAuth, async (req, res) => {
  try {
    const users = await userModel
      .find()
      .select("-password -otp -otpExpiry -resetOtp -resetOtpExpiry")
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

export default userRouter;