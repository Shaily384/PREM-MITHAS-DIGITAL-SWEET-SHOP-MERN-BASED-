import validator from "validator";
import bcrypt    from "bcrypt";
import jwt       from "jsonwebtoken";
import userModel from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js";

// ─── helpers ──────────────────────────────────────────────────────────────────

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const otpEmailHTML = (otp, heading, sub) => `
<div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:0 auto;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">
  <div style="background:#292524;padding:26px 32px;">
    <h2 style="color:#fef3c7;margin:0;font-size:18px;letter-spacing:1px;">🧺 Wholesale Cane Baskets</h2>
  </div>
  <div style="padding:36px 32px;background:#fafaf9;">
    <h3 style="color:#1c1917;margin:0 0 6px;">${heading}</h3>
    <p style="color:#78716c;margin:0 0 28px;font-size:15px;line-height:1.6;">${sub}</p>
    <div style="background:#fff;border:2px dashed #d97706;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;color:#a8a29e;letter-spacing:4px;text-transform:uppercase;">One-Time Password</p>
      <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:12px;color:#92400e;">${otp}</p>
    </div>
    <p style="color:#a8a29e;font-size:13px;margin:0;">Valid for <strong>10 minutes</strong>. Never share this with anyone.</p>
  </div>
  <div style="background:#f5f5f4;padding:14px 32px;text-align:center;">
    <p style="color:#a8a29e;font-size:12px;margin:0;">If you didn't request this, you can safely ignore this email.</p>
  </div>
</div>`;

// ─── LOGIN ────────────────────────────────────────────────────────────────────

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "No account found with this email." });

    if (!user.isVerified)
      return res.json({
        success: false,
        message: "Please verify your email first.",
        needsVerification: true,
        userId: user._id,
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Incorrect password. Please try again." });

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// ─── REGISTER ────────────────────────────────────────────────────────────────

const registerUser = async (req, res) => {
  let savedUser = null;
  try {
    const { name, email, password, mobileNo } = req.body;

    // validation
    if (!name || !email || !password || !mobileNo)
      return res.json({ success: false, message: "All fields are required." });

    if (!validator.isEmail(email))
      return res.json({ success: false, message: "Please enter a valid email address." });

    if (password.length < 8)
      return res.json({ success: false, message: "Password must be at least 8 characters." });

    const cleanMobile = mobileNo.replace(/\s/g, "");
    if (!/^\d{10}$/.test(cleanMobile))
      return res.json({ success: false, message: "Please enter a valid 10-digit mobile number." });

    // check existing verified user
    const existing = await userModel.findOne({ email });

    if (existing && existing.isVerified)
      return res.json({ success: false, message: "Account already exists. Please login." });

    // delete any old unverified account with same email
    if (existing && !existing.isVerified) {
      await userModel.deleteOne({ email });
    }

    // hash password
    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp            = generateOTP();

    // save user as unverified
    const newUser = new userModel({
      name,
      email,
      password:   hashedPassword,
      mobileNo:   cleanMobile,
      otp,
      otpExpiry:  new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
    });

    savedUser = await newUser.save();

    // send OTP email — if this fails, delete the user from DB
    await sendEmail({
      to:      email,
      subject: "Your Verification OTP – Wholesale Cane Baskets",
      html:    otpEmailHTML(
        otp,
        "Welcome! Verify Your Email",
        `Thanks for signing up, <strong>${name}</strong>! Use the OTP below to activate your account.`
      ),
    });

    // only reach here if email was sent successfully
    res.json({
      success: true,
      message: "OTP sent to your email address. Please check your inbox.",
      userId: savedUser._id,
    });

  } catch (err) {
    console.log(err);

    // if user was saved but email failed — delete them so DB stays clean
    if (savedUser) {
      await userModel.deleteOne({ _id: savedUser._id }).catch(() => {});
    }

    // give a clear message if it's an email error
    if (err.message?.includes("Invalid login") || err.message?.includes("535") || err.code === "EAUTH") {
      return res.json({
        success: false,
        message: "Email sending failed. Please check your EMAIL_USER and EMAIL_PASS in .env file.",
      });
    }

    res.json({ success: false, message: "Registration failed. Please try again." });
  }
};

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────

const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await userModel.findById(userId);
    if (!user)           return res.json({ success: false, message: "User not found. Please register again." });
    if (user.isVerified) return res.json({ success: false, message: "Email already verified. Please login." });

    if (!user.otp || !user.otpExpiry)
      return res.json({ success: false, message: "No OTP found. Please register again." });

    if (new Date() > user.otpExpiry)
      return res.json({ success: false, message: "OTP has expired. Click resend to get a new one." });

    if (user.otp !== otp)
      return res.json({ success: false, message: "Invalid OTP. Please try again." });

    // mark verified and clear OTP
    user.isVerified = true;
    user.otp        = null;
    user.otpExpiry  = null;
    await user.save();

    const token = createToken(user._id);
    res.json({ success: true, token, message: "Email verified! Welcome aboard 🎉" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// ─── RESEND OTP ───────────────────────────────────────────────────────────────

const resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);
    if (!user)           return res.json({ success: false, message: "User not found. Please register again." });
    if (user.isVerified) return res.json({ success: false, message: "Email already verified. Please login." });

    const otp      = generateOTP();
    user.otp       = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      to:      user.email,
      subject: "Your New OTP – Wholesale Cane Baskets",
      html:    otpEmailHTML(otp, "New OTP Sent", "You requested a new OTP. Use it to verify your email."),
    });

    res.json({ success: true, message: "New OTP sent to your email." });
  } catch (err) {
    console.log(err);
    if (err.message?.includes("Invalid login") || err.message?.includes("535") || err.code === "EAUTH") {
      return res.json({
        success: false,
        message: "Email sending failed. Please check your EMAIL_USER and EMAIL_PASS in .env file.",
      });
    }
    res.json({ success: false, message: "Failed to resend OTP. Please try again." });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "No account found with this email." });

    const otp           = generateOTP();
    user.resetOtp       = otp;
    user.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendEmail({
      to:      email,
      subject: "Password Reset OTP – Wholesale Cane Baskets",
      html:    otpEmailHTML(
        otp,
        "Reset Your Password",
        `You requested a password reset. OTP is valid for <strong>15 minutes</strong>.`
      ),
    });

    res.json({ success: true, message: "OTP sent to your email address." });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Failed to send OTP. Please try again." });
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found." });

    if (!user.resetOtp || !user.resetOtpExpiry)
      return res.json({ success: false, message: "No reset request found. Please try again." });
    if (new Date() > user.resetOtpExpiry)
      return res.json({ success: false, message: "OTP expired. Please request a new one." });
    if (user.resetOtp !== otp)
      return res.json({ success: false, message: "Invalid OTP." });
    if (newPassword.length < 8)
      return res.json({ success: false, message: "Password must be at least 8 characters." });

    const salt          = await bcrypt.genSalt(10);
    user.password       = await bcrypt.hash(newPassword, salt);
    user.resetOtp       = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({ success: true, message: "Password reset successfully! You can now login." });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials." });
    }
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// ─── USER PROFILE ─────────────────────────────────────────────────────────────

const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) return res.json({ success: false, message: "User not found." });
    res.json({ success: true, user });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ─── ADMIN: user count ────────────────────────────────────────────────────────

const getUserCount = async (req, res) => {
  try {
    const count = await userModel.countDocuments();
    res.json({ success: true, count });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

export {
  loginUser,
  registerUser,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  adminLogin,
  getUserProfile,
  getUserCount,
};