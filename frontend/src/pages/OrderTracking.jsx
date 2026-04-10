import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { CheckCircle, Circle, Clock, MapPin, Package, ChefHat, Truck, Home } from "lucide-react";

const STEPS = [
  { key: "Order Placed",     label: "Order Placed",     emoji: "🧾", desc: "Your order has been received"           },
  { key: "Packing",          label: "Packing",          emoji: "🍬", desc: "Our team is preparing your sweets"      },
  { key: "Shipped",          label: "Shipped",          emoji: "📦", desc: "Your order has been dispatched"         },
  { key: "Out for delivery", label: "Out for Delivery", emoji: "🛵", desc: "Delivery partner is on the way"         },
  { key: "Delivered",        label: "Delivered",        emoji: "✅", desc: "Your sweets have been delivered!"       },
];

const STATUS_IDX = Object.fromEntries(STEPS.map((s, i) => [s.key, i]));

const OrderTracking = () => {
  const { orderId }  = useParams();
  const navigate     = useNavigate();
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    if (!token) return;
    try {
      const { data } = await axios.post(
        backendUrl + "/api/order/userorders", {},
        { headers: { token } }
      );
      if (data.success) {
        const found = data.orders.find(o => o._id === orderId);
        setOrder(found || null);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [token, orderId]);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(fetchOrder, 30000);
    return () => clearInterval(t);
  }, [token, orderId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-xl font-bold text-stone-800">Order not found</h2>
      <p className="text-stone-400 mt-2 mb-6">This order doesn't exist or doesn't belong to your account.</p>
      <button onClick={() => navigate("/orders")}
        className="px-6 py-3 bg-stone-800 text-white rounded-2xl text-sm font-semibold hover:bg-amber-700 transition-all">
        Back to Orders
      </button>
    </div>
  );

  const currentStep = STATUS_IDX[order.status] ?? 0;
  const isDelivered = order.status === "Delivered";
  const isOutForDelivery = order.status === "Out for delivery";

  const addr = order.address;
  const mapQuery = encodeURIComponent(
    `${addr.street}, ${addr.city}, ${addr.state}, India`
  );

  return (
    <div className="min-h-screen bg-amber-50/20 px-4 sm:px-8 lg:px-16 py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/orders")}
            className="p-2 rounded-xl border border-stone-200 bg-white text-stone-500 hover:border-amber-400 hover:text-amber-700 transition-all">
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Track Your Order</h1>
            <p className="text-xs text-stone-400 font-mono">#{order._id.slice(-10).toUpperCase()}</p>
          </div>
        </div>

        {/* Live Banner */}
        {isOutForDelivery && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 flex items-center gap-3 text-white shadow-lg">
            <div className="text-3xl animate-bounce">🛵</div>
            <div className="flex-1">
              <p className="font-bold text-lg">Your order is on the way!</p>
              <p className="text-white/80 text-sm">Delivery partner is heading to your address</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          </div>
        )}

        {isDelivered && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="text-3xl">🎉</div>
            <div>
              <p className="font-bold text-green-800">Delivered Successfully!</p>
              <p className="text-sm text-green-600">Your Prem Mithas sweets have been delivered. Enjoy!</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Stepper */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="font-bold text-stone-800 mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" /> Order Progress
            </h2>

            <div className="relative">
              {/* Background line */}
              <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-stone-100" />
              {/* Progress line */}
              <div
                className="absolute left-[18px] top-5 w-0.5 bg-amber-500 transition-all duration-700"
                style={{ height: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              />

              <div className="space-y-7">
                {STEPS.map((step, i) => {
                  const done    = i <= currentStep;
                  const current = i === currentStep;
                  return (
                    <div key={step.key} className="relative flex items-start gap-4">
                      {/* Circle */}
                      <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-500
                        ${done
                          ? current
                            ? "bg-amber-500 ring-4 ring-amber-500/20 shadow-lg"
                            : "bg-amber-500"
                          : "bg-white border-2 border-stone-200"}`}>
                        {done
                          ? <CheckCircle className="w-5 h-5 text-white" />
                          : <Circle className="w-5 h-5 text-stone-300" />
                        }
                      </div>

                      {/* Text */}
                      <div className={`pt-1.5 transition-all ${current ? "opacity-100" : done ? "opacity-80" : "opacity-35"}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg">{step.emoji}</span>
                          <p className={`font-semibold text-sm ${current ? "text-amber-700" : done ? "text-stone-700" : "text-stone-400"}`}>
                            {step.label}
                          </p>
                          {current && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold animate-pulse">
                              NOW
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Map + Address */}
          <div className="space-y-4">

            {/* Free OpenStreetMap - no API key needed */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <h2 className="font-bold text-stone-800">Delivery Address</h2>
                </div>
                {isOutForDelivery && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                    Live
                  </span>
                )}
              </div>

              {/* OpenStreetMap iframe — completely free */}
              <div className="relative">
              <iframe
  title="Delivery Location"
  className="w-full border-0"
  height="200"
  src={`https://www.openstreetmap.org/export/embed.html?bbox=72.0,18.0,81.0,24.0&layer=mapnik`}
  allowFullScreen
  loading="lazy"
/>
                {/* Overlay badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-md">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-semibold text-stone-700">
                    {isOutForDelivery ? "En route to you 🛵" : "Delivery Location"}
                  </span>
                </div>
              </div>

              <div className="px-5 py-4 space-y-1">
                <p className="font-semibold text-stone-800">{addr.firstName} {addr.lastName}</p>
                <p className="text-sm text-stone-500">{addr.street}</p>
                <p className="text-sm text-stone-500">{addr.city}, {addr.state} – {addr.zipcode}</p>
                <p className="text-sm text-stone-500">📞 {addr.phone}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
              <h3 className="font-bold text-stone-800">Order Summary</h3>

              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.image[0]} className="w-10 h-10 rounded-xl object-cover border border-stone-100" alt={item.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">{item.name}</p>
                    <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-stone-700">
                    {currency}{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}

              <hr className="border-stone-100" />

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-semibold">
                  <span>🎟️ Coupon ({order.couponCode})</span>
                  <span>− {currency}{order.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-stone-800">
                <span>Total Paid</span>
                <span>{currency}{order.amount.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-sm text-stone-500">
                <span>Payment Method</span>
                <span className={`font-semibold ${order.payment ? "text-green-600" : "text-orange-500"}`}>
                  {order.payment ? "✓ Paid" : `⏳ ${order.paymentMethod}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;