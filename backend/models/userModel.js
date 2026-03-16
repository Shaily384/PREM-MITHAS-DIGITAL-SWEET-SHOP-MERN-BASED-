import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true },
    email:          { type: String, required: true, unique: true },
    password:       { type: String, required: true },
    mobileNo:       { type: String, required: true },
    isVerified:     { type: Boolean, default: false },
    otp:            { type: String, default: null },
    otpExpiry:      { type: Date,   default: null },
    resetOtp:       { type: String, default: null },
    resetOtpExpiry: { type: Date,   default: null },
    cartData:       { type: Object, default: {} },
  },
  { timestamps: true, minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;