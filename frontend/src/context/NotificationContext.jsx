import React, { createContext, useCallback, useContext, useRef, useState } from "react";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timerRef = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timerRef.current[id]);
  }, []);

  const notify = useCallback(
    (type = "info", title = "", message = "", duration = 4000) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]);
      if (duration > 0) {
        timerRef.current[id] = setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const notifyOrderPlaced = (orderId) =>
    notify("success", "Order Placed! 🎉", `Your order #${orderId || ""} has been placed successfully.`);
  const notifyPaymentDone = (amount) =>
    notify("payment", "Payment Received 💰", `₹${amount} received via UPI. Your order is confirmed!`);
  const notifyOffer = (text) =>
    notify("offer", "🎁 Special Offer!", text, 6000);
  const notifyOrderStatus = (status) =>
    notify("info", "Order Update 📦", `Your order status is now: ${status}`);
  const notifyError = (msg) =>
    notify("error", "Something went wrong", msg);
  const notifyAddToCart = (name) =>
    notify("success", "Added to Cart 🛒", `${name} added to your cart.`, 2500);

  return (
    <NotificationContext.Provider
      value={{ notify, notifyOrderPlaced, notifyPaymentDone, notifyOffer, notifyOrderStatus, notifyError, notifyAddToCart, dismiss }}
    >
      {children}
      <ToastStack toasts={toasts} dismiss={dismiss} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used inside NotificationProvider");
  return ctx;
};

const ICONS = {
  success: "✅",
  error:   "❌",
  info:    "📦",
  offer:   "🎁",
  payment: "💳",
};

const COLORS = {
  success: "border-l-green-500",
  error:   "border-l-red-500",
  info:    "border-l-blue-500",
  offer:   "border-l-yellow-500",
  payment: "border-l-purple-500",
};

const ToastStack = ({ toasts, dismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto bg-white shadow-lg rounded-xl border border-gray-100 border-l-4 ${COLORS[t.type] || COLORS.info} px-4 py-3 flex gap-3 items-start`}
          style={{ animation: "slideInRight 0.3s ease" }}
        >
          <span className="text-lg leading-none mt-0.5">{ICONS[t.type] || "ℹ️"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{t.title}</p>
            {t.message && (
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{t.message}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="text-gray-300 hover:text-gray-600 text-base leading-none mt-0.5 flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};