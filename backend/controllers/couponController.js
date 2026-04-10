import couponModel from "../models/couponModel.js";

/* ── ADMIN: Create coupon ── */
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = req.body;

    const exists = await couponModel.findOne({ code: code.toUpperCase() });
    if (exists) return res.json({ success: false, message: "Coupon code already exists" });

    const coupon = new couponModel({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxUses: Number(maxUses) || 100,
      expiresAt: new Date(expiresAt),
    });

    await coupon.save();
    res.json({ success: true, message: "Coupon created!", coupon });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ── ADMIN: List all coupons ── */
const listCoupons = async (req, res) => {
  try {
    const coupons = await couponModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ── ADMIN: Toggle active/inactive ── */
const toggleCoupon = async (req, res) => {
  try {
    const { couponId } = req.body;
    const coupon = await couponModel.findById(couponId);
    if (!coupon) return res.json({ success: false, message: "Coupon not found" });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ success: true, message: `Coupon ${coupon.isActive ? "activated" : "deactivated"}` });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ── ADMIN: Delete coupon ── */
const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.body;
    await couponModel.findByIdAndDelete(couponId);
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ── USER: Validate coupon ── */
const validateCoupon = async (req, res) => {
  try {
    const { code, cartAmount } = req.body;

    const coupon = await couponModel.findOne({ code: code.toUpperCase() });

    if (!coupon)
      return res.json({ success: false, message: "Invalid coupon code" });

    if (!coupon.isActive)
      return res.json({ success: false, message: "This coupon is no longer active" });

    if (new Date() > new Date(coupon.expiresAt))
      return res.json({ success: false, message: "This coupon has expired" });

    if (coupon.usedCount >= coupon.maxUses)
      return res.json({ success: false, message: "Coupon usage limit reached" });

    if (cartAmount < coupon.minOrderAmount)
      return res.json({
        success: false,
        message: `Minimum order of ₹${coupon.minOrderAmount} required for this coupon`,
      });

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percent") {
      discountAmount = Math.round((cartAmount * coupon.discountValue) / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    // Cap discount to cart amount
    discountAmount = Math.min(discountAmount, cartAmount);

    res.json({
      success: true,
      message: `🎉 Coupon applied! You saved ₹${discountAmount}`,
      discountAmount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      couponCode: coupon.code,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { createCoupon, listCoupons, toggleCoupon, deleteCoupon, validateCoupon };