import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { ShopContext } from "../context/ShopContext";
import { useNotification } from "../context/NotificationContext";
import UPIPaymentModal from "../components/UPIPaymentModal";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const {
    navigate, backendUrl, token,
    cartItems, setCartItems,
    getCartAmount, delivery_fee, products,
  } = useContext(ShopContext);
  const { notifyOrderPlaced, notifyError } = useNotification();

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "",
    street: "", city: "", state: "",
    zipcode: "", country: "", phone: "",
  });

  // ── Coupon state ──────────────────────────────
  const [couponCode,      setCouponCode]      = useState("");
  const [couponApplied,   setCouponApplied]   = useState(false);
  const [discountAmount,  setDiscountAmount]  = useState(0);
  const [couponLoading,   setCouponLoading]   = useState(false);

  // ── UPI modal state ───────────────────────────
  const [upiModal,       setUpiModal]       = useState(false);
  const [placedOrderId,  setPlacedOrderId]  = useState(null);
  const [totalAmount,    setTotalAmount]    = useState(0);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData((d) => ({ ...d, [name]: value.replace(/\D/g, "").slice(0, 10) }));
    } else {
      setFormData((d) => ({ ...d, [name]: value }));
    }
  };

  // ── Apply coupon ──────────────────────────────
  const applyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Enter a coupon code");
    if (couponApplied)      return toast.info("Coupon already applied");

    setCouponLoading(true);
    try {
      const res = await axios.post(
        backendUrl + "/api/coupon/validate",
        { code: couponCode, amount: getCartAmount() },
        { headers: { token } }
      );
      if (res.data.success) {
        setDiscountAmount(res.data.discountAmount);
        setCouponApplied(true);
        toast.success(`Coupon applied! You saved ₹${res.data.discountAmount}`);
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setDiscountAmount(0);
    toast.info("Coupon removed");
  };

  const getFinalAmount = () => getCartAmount() + delivery_fee - discountAmount;

  // ── Submit ────────────────────────────────────
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      return toast.error("Please enter a valid 10-digit phone number");
    }

    try {
      const orderItems = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find((p) => p._id === items));
            if (itemInfo) {
              itemInfo.size     = item;
              itemInfo.quantity = cartItems[items][item];
              itemInfo.productId = itemInfo._id;
              orderItems.push(itemInfo);
            }
          }
        }
      }

      const amount = getFinalAmount();
      const orderData = {
        address:       formData,
        items:         orderItems,
        amount,
        paymentMethod: method.toUpperCase(),
        couponCode:    couponApplied ? couponCode : null,
        discountAmount,
      };

      const response = await axios.post(
        backendUrl + "/api/order/place",
        orderData,
        { headers: { token } }
      );

      if (response.data.success) {
        const orderId = response.data.orderId || "";

        if (method === "upi_id") {
          setPlacedOrderId(orderId);
          setTotalAmount(amount);
          setCartItems({});
          setUpiModal(true);
          return;
        }

        setCartItems({});
        notifyOrderPlaced(orderId);
        navigate("/orders");
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
        notifyError(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
      notifyError(error.message);
    }
  };

  const handleUpiConfirmed = () => {
    notifyOrderPlaced(placedOrderId);
    setUpiModal(false);
    navigate("/orders");
  };

  return (
    <div className="px-6 sm:px-10 md:px-16 lg:px-20 border-t pt-10 bg-gray-50/20">
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col sm:flex-row justify-between gap-12 pt-5 sm:pt-14 min-h-[80vh]"
      >
        {/* ── LEFT: Delivery Information ── */}
        <div className="flex flex-col gap-5 w-full sm:max-w-[480px]">
          <div className="text-xl sm:text-2xl mb-2">
            <Title text1="DELIVERY" text2="INFORMATION" />
          </div>

          <div className="flex gap-3">
            <input required name="firstName" value={formData.firstName} onChange={onChangeHandler}
              className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="First name" />
            <input required name="lastName" value={formData.lastName} onChange={onChangeHandler}
              className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="Last name" />
          </div>

          <input required type="email" name="email" value={formData.email} onChange={onChangeHandler}
            className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all"
            placeholder="Email address" />

          <input required name="street" value={formData.street} onChange={onChangeHandler}
            className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all"
            placeholder="Street Address" />

          <div className="grid grid-cols-2 gap-3">
            <input required name="city" value={formData.city} onChange={onChangeHandler}
              className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="City" />
            <input required name="state" value={formData.state} onChange={onChangeHandler}
              className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="State" />
            <input required name="zipcode" type="number" value={formData.zipcode} onChange={onChangeHandler}
              className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="Zipcode" />
            <input required name="country" value={formData.country} onChange={onChangeHandler}
              className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="Country" />
          </div>

          <div className="relative">
            <input required type="tel" name="phone" value={formData.phone} onChange={onChangeHandler}
              className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="Phone (10 digits)" />
            {formData.phone && formData.phone.length !== 10 && (
              <span className="text-[10px] text-red-500 absolute -bottom-4 left-1">Must be 10 digits</span>
            )}
          </div>

          {/* ── Coupon Code ── */}
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Have a coupon?</p>
            {couponApplied ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                <span className="text-sm text-green-700 font-semibold">
                  🎉 <span className="uppercase">{couponCode}</span> — ₹{discountAmount} off
                </span>
                <button type="button" onClick={removeCoupon}
                  className="text-xs text-red-500 hover:text-red-700 font-medium ml-4">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all text-sm uppercase tracking-widest"
                  placeholder="ENTER CODE"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Summary & Payment ── */}
        <div className="flex-1 sm:max-w-[500px]">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <CartTotal discountAmount={discountAmount} />

            <div className="mt-12">
              <Title text1="PAYMENT" text2="METHOD" />

              <div className="grid grid-cols-1 gap-3 mt-6">
                {[
                  { id: "stripe",  label: "Debit / Credit Card", icon: "💳" },
                  { id: "upi_id",  label: "UPI / Google Pay",     icon: "📱" },
                  { id: "cod",     label: "Cash on Delivery",      icon: "💵" },
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`group flex items-center justify-between gap-4 border-2 p-4 cursor-pointer rounded-lg transition-all duration-200 ${
                      method === m.id ? "border-black bg-gray-50" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${method === m.id ? "border-black" : "border-gray-300"}`}>
                        {method === m.id && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                      </div>
                      <span className={`text-sm font-semibold ${method === m.id ? "text-black" : "text-gray-500"}`}>
                        {m.label}
                      </span>
                    </div>
                    <span className="text-xl opacity-80 group-hover:scale-110 transition-transform">{m.icon}</span>
                  </div>
                ))}
              </div>

              {method === "upi_id" && (
                <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-800">
                  📲 After placing the order, a UPI QR will appear. Scan to complete payment.
                </div>
              )}

              <div className="w-full mt-10">
                <button
                  type="submit"
                  className="w-full bg-black text-white px-8 py-4 text-sm font-bold rounded-lg hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
                >
                  {method === "upi_id" ? "PLACE ORDER & PAY VIA UPI" : "PLACE ORDER NOW"}
                </button>
                <p className="text-center text-[11px] text-gray-400 mt-4 uppercase tracking-widest">
                  🔒 Secure SSL Encrypted Checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* UPI Payment Modal */}
      {upiModal && (
        <UPIPaymentModal
          amount={totalAmount}
          orderId={placedOrderId}
          onConfirmed={handleUpiConfirmed}
          onClose={() => { setUpiModal(false); navigate("/orders"); }}
        />
      )}
    </div>
  );
};

export default PlaceOrder;