import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { CheckCircle, Circle, Clock, MapPin, Package, Truck, Home, ChefHat } from "lucide-react";

const STEPS = [
  { key: "Order Placed",     label: "Order Placed",     icon: Package,  desc: "Your order has been received",        emoji: "🧾" },
  { key: "Packing",          label: "Packing",          icon: ChefHat,  desc: "Our team is preparing your sweets",   emoji: "🍬" },
  { key: "Shipped",          label: "Shipped",          icon: Package,  desc: "Your order is on the way",            emoji: "📦" },
  { key: "Out for delivery", label: "Out for Delivery", icon: Truck,    desc: "Delivery partner is near you",        emoji: "🛵" },
  { key: "Delivered",        label: "Delivered",        icon: Home,     desc: "Your sweets have been delivered!",    emoji: "✅" },
];

const STATUS_INDEX = Object.fromEntries(STEPS.map((s, i) => [s.key, i]));

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

  // Auto refresh every 30s
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
      <button onClick={() => navigate("/orders")} className="px-6 py-3 bg-stone-800 text-white rounded-2xl text-sm font-semibold">
        Back to Orders
      </button>
    </div>
  );

  const currentStep = STATUS_INDEX[order.status] ?? 0;
  const isDelivered = order.status === "Delivered";

  // Build address string for map embed
  const addr = order.address;
  const addressQuery = encodeURIComponent(
    `${addr.street}, ${addr.city}, ${addr.state}, ${addr.country} ${addr.zipcode}`
  );

  // OpenStreetMap embed URL (free, no API key)
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=73.0,18.8,73.2,19.0&layer=mapnik&marker=${addressQuery}`;
  // Better: use nominatim geocode link approach
  const mapSearchUrl = `https://www.openstreetmap.org/search?query=${addressQuery}#map=14`;

  return (
    <div className="min-h-screen bg-amber-50/30 px-4 sm:px-8 lg:px-16 py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/orders")}
            className="p-2 rounded-xl border border-stone-200 bg-white text-stone-500 hover:border-amber-400 hover:text-amber-700 transition-all">
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Track Your Order</h1>
            <p className="text-xs text-stone-400 font-mono mt-0.5">#{order._id.slice(-10).toUpperCase()}</p>
          </div>
        </div>

        {/* Live banner */}
        {order.status === "Out for delivery" && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 flex items-center gap-3 text-white shadow-lg">
            <div className="text-3xl animate-bounce">🛵</div>
            <div>
              <p className="font-bold text-lg">Your order is on the way!</p>
              <p className="text-white/80 text-sm">Delivery partner is heading to your address</p>
            </div>
            {order.estimatedDelivery && (
              <div className="ml-auto text-right">
                <p className="text-xs text-white/70">Est. Delivery</p>
                <p className="font-bold text-sm">{new Date(order.estimatedDelivery).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            )}
          </div>
        )}

        {isDelivered && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 text-green-800">
            <div className="text-3xl">🎉</div>
            <div>
              <p className="font-bold">Delivered Successfully!</p>
              <p className="text-sm text-green-600">Your Prem Mithas sweets have been delivered. Enjoy!</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Stepper ── */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="font-bold text-stone-800 mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" /> Order Progress
            </h2>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-stone-100" />
              {/* Progress line */}
              <div
                className="absolute left-5 top-5 w-0.5 bg-amber-500 transition-all duration-700"
                style={{ height: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              />

              <div className="space-y-6">
                {STEPS.map((step, i) => {
                  const done    = i <= currentStep;
                  const current = i === currentStep;

                  return (
                    <div key={step.key} className="relative flex items-start gap-4 pl-1">
                      {/* Circle */}
                      <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-500
                        ${done
                          ? current
                            ? "bg-amber-500 shadow-lg shadow-amber-500/40 ring-4 ring-amber-500/20"
                            : "bg-amber-500"
                          : "bg-white border-2 border-stone-200"
                        }`}>
                        {done
                          ? <CheckCircle className="w-5 h-5 text-white" />
                          : <Circle className="w-5 h-5 text-stone-300" />
                        }
                      </div>

                      {/* Content */}
                      <div className={`pt-1.5 transition-all ${current ? "opacity-100" : done ? "opacity-90" : "opacity-40"}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{step.emoji}</span>
                          <p className={`font-semibold text-sm ${current ? "text-amber-700" : done ? "text-stone-700" : "text-stone-400"}`}>
                            {step.label}
                          </p>
                          {current && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold animate-pulse">
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

          {/* ── Map + Address ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <h2 className="font-bold text-stone-800">Delivery Address</h2>
              </div>

              {/* Map using OpenStreetMap iframe */}
              <div className="relative">
                <iframe
                  title="Delivery Location"
                  className="w-full h-52 border-0"
                  src={`https://maps.google.com/maps?q=${addressQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                  loading="lazy"
                />
                {/* Overlay label */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-md">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-semibold text-stone-700">Delivery Location</span>
                </div>
              </div>

              <div className="px-5 py-4 space-y-1">
                <p className="font-semibold text-stone-800">{addr.firstName} {addr.lastName}</p>
                <p className="text-sm text-stone-500">{addr.street}</p>
                <p className="text-sm text-stone-500">{addr.city}, {addr.state} – {addr.zipcode}</p>
                <p className="text-sm text-stone-500">{addr.phone}</p>
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
              <h3 className="font-bold text-stone-800">Order Summary</h3>
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.image[0]} className="w-10 h-10 rounded-xl object-cover border border-stone-100" alt={item.name} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-800 truncate">{item.name}</p>
                    <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-stone-700">{currency}{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                </div>
              ))}
              <hr className="border-stone-100" />
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon ({order.couponCode})</span>
                  <span>− {currency}{order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-stone-800">
                <span>Total Paid</span>
                <span>{currency}{order.amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-500">
                <span>Payment</span>
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