import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// 1. PLACE ORDER (Simple/COD Logic)
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address, paymentMethod } = req.body;
    const userId = req.userId; 

    const newOrder = new orderModel({
      userId,
      items,
      address,
      amount,
      paymentMethod: paymentMethod || "COD",
      payment: false,
      date: Date.now(),
    });

    await newOrder.save(); 
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    console.error("Order Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// 2. PLACEHOLDERS (To prevent backend crash while Razorpay is unconfigured)
const placeOrderRazorpay = async (req, res) => {
  res.json({ success: false, message: "Razorpay not configured yet" });
};

const verifyRazorpay = async (req, res) => {
  res.json({ success: false, message: "Razorpay not configured yet" });
};

// 3. ORDER FETCHING LOGIC
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 4. ORDER MANAGEMENT
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    await orderModel.findByIdAndDelete(orderId);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// SINGLE EXPORT BLOCK (Fixed Duplicate Error)
export {
  placeOrder,
  placeOrderRazorpay,
  verifyRazorpay,
  userOrders,
  allOrders,
  updateStatus,
  deleteOrder,
};