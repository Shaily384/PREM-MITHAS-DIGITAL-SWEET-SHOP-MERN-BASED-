import orderModel   from "../models/orderModel.js";
import userModel    from "../models/userModel.js";
import Stripe       from "stripe";
import productModel from "../models/productModel.js";

const currency       = "inr";
const deliveryCharge = 35;

/* ───────── STRIPE ───────── */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/* ── helpers ── */
const buildDetailedItems = async (items) => {
  const out = [];
  for (const ci of items) {
    const p = await productModel.findById(ci._id);
    if (!p) continue;
    out.push({
      productId: p._id,
      name:      p.name,
      price:     p.price,
      image:     p.image,
      quantity:  ci.quantity,
    });
  }
  return out;
};

/* ════════════════════════════
   1. PLACE ORDER (COD / generic)
════════════════════════════ */
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address, paymentMethod, couponCode } = req.body;
    const userId = req.userId;

    const detailedItems = await buildDetailedItems(items);

    const newOrder = new orderModel({
      userId,
      items:         detailedItems,
      address,
      amount,
      couponCode:    couponCode || null,
      paymentMethod: paymentMethod || "COD",
      payment:       false,
      status:        "Order Placed",
      date:          Date.now(),
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed Successfully", orderId: newOrder._id });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ════════════════════════════
   2. VERIFY UPI PAYMENT
════════════════════════════ */
const verifyUpiPayment = async (req, res) => {
  try {
    const { orderId, txnId } = req.body;
    const userId = req.userId;

    if (!orderId || !txnId)
      return res.json({ success: false, message: "Order ID and Transaction ID required." });

    const order = await orderModel.findOne({ _id: orderId, userId });
    if (!order)
      return res.json({ success: false, message: "Order not found." });

    await orderModel.findByIdAndUpdate(orderId, {
      payment:   true,
      status:    "Payment Received",
      upiTxnId:  txnId,
    });

    res.json({ success: true, message: "Payment confirmed. Order is being processed." });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ════════════════════════════
   3. RAZORPAY (DISABLED)
════════════════════════════ */
const placeOrderRazorpay = async (req, res) =>
  res.json({ success: false, message: "Razorpay is not configured." });

const verifyRazorpay = async (req, res) =>
  res.json({ success: false, message: "Razorpay is not configured." });

/* ════════════════════════════
   4. STRIPE
════════════════════════════ */
const placeOrderStripe = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.userId;
    const { origin } = req.headers;

    const newOrder = new orderModel({
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment:       false,
      date:          Date.now(),
    });

    await newOrder.save();

    const line_items = items.map(item => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount:  item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency,
        product_data: { name: "Delivery" },
        unit_amount:  deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url:  `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const verifyStripe = async (req, res) => {
  try {
    const { orderId, success } = req.body;

    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(req.userId, { cartData: {} });
      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ════════════════════════════
   5. USER + ADMIN QUERIES
════════════════════════════ */
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

/* ════════════════════════════
   6. ADMIN MANAGEMENT
════════════════════════════ */
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const update = { status };

    // Auto-set estimated delivery when dispatched
    if (status === "Out for delivery") {
      update.estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000);
    }

    await orderModel.findByIdAndUpdate(orderId, update);
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    await orderModel.findByIdAndDelete(req.body.orderId);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ════════════════════════════
   7. ADMIN: MARK PAYMENT DONE (manual UPI / COD confirm)
════════════════════════════ */
const markPaymentDone = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order)         return res.json({ success: false, message: "Order not found." });
    if (order.payment)  return res.json({ success: false, message: "Already marked as paid." });

    await orderModel.findByIdAndUpdate(orderId, { payment: true });
    res.json({ success: true, message: "Payment marked as received ✅" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ════════════════════════════
   8. ADMIN: REVENUE STATS
════════════════════════════ */
const revenueStats = async (req, res) => {
  try {
    const orders  = await orderModel.find({ payment: true });
    const monthly = {};

    orders.forEach(order => {
      const d   = new Date(order.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthly[key] = (monthly[key] || 0) + order.amount;
    });

    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d     = new Date();
      d.setMonth(d.getMonth() - i);
      const key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
      months.push({ month: label, revenue: monthly[key] || 0 });
    }

    res.json({ success: true, data: months });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  verifyUpiPayment,
  placeOrderRazorpay,
  verifyRazorpay,
  placeOrderStripe,
  verifyStripe,
  userOrders,
  allOrders,
  updateStatus,
  deleteOrder,
  markPaymentDone,
  revenueStats,
};