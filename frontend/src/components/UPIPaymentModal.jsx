import React, { useContext, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { useNotification } from "../context/NotificationContext";

const UPI_ID   = "shailyrinait03-1@okicici";
const UPI_NAME = "Prem Mithas";

const UPIPaymentModal = ({ amount, orderId, onConfirmed, onClose }) => {
  const { backendUrl, token } = useContext(ShopContext);
  const { notifyPaymentDone, notifyError } = useNotification();

  const [step, setStep]       = useState("qr");
  const [txnId, setTxnId]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const upiLink =
    `upi://pay?pa=${encodeURIComponent(UPI_ID)}` +
    `&pn=${encodeURIComponent(UPI_NAME)}` +
    `&am=${amount}&cu=INR` +
    `&tn=${encodeURIComponent("Sweet Shop Order")}`;

  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220` +
    `&data=${encodeURIComponent(upiLink)}&margin=10&color=1a1a1a&bgcolor=ffffff`;

  const handleConfirm = async () => {
    if (!txnId.trim()) {
      setError("Please enter your UPI transaction ID (UTR).");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `${backendUrl}/api/order/verify-upi`,
        { orderId, txnId, amount },
        { headers: { token } }
      );
      setStep("done");
      notifyPaymentDone(amount);
      onConfirmed && onConfirmed(txnId);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Verification failed.";
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9998] bg-black/60 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl leading-none"
        >
          ✕
        </button>

        {step === "qr" && (
          <>
            <h2 className="text-lg font-bold mb-1 text-center">Pay with UPI</h2>
            <p className="text-xs text-gray-500 text-center mb-4">
              Scan with Google Pay, PhonePe, or any UPI app
            </p>

            <div className="flex justify-center mb-3">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-2 bg-gray-50">
                <img src={qrUrl} alt="UPI QR" width={220} height={220} className="block" />
              </div>
            </div>

            <div className="text-center mb-3">
              <span className="text-2xl font-bold text-gray-900">₹{amount}</span>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center mb-4">
              <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-0.5">UPI ID</p>
              <p className="text-sm font-mono font-semibold text-gray-800 select-all">{UPI_ID}</p>
            </div>

            <a
              href={upiLink}
              className="block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-3 text-sm font-semibold mb-3 hover:opacity-90 transition"
            >
              📱 Open UPI App
            </a>

            <button
              onClick={() => setStep("confirming")}
              className="block w-full text-center border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              I've completed the payment →
            </button>
          </>
        )}

        {step === "confirming" && (
          <>
            <h2 className="text-lg font-bold mb-1">Confirm Payment</h2>
            <p className="text-xs text-gray-500 mb-4">
              Enter your UPI Transaction ID (UTR Number) to confirm payment of <strong>₹{amount}</strong>.
            </p>

            <label className="block text-xs font-semibold text-gray-600 mb-1">
              UPI / UTR Transaction ID
            </label>
            <input
              type="text"
              value={txnId}
              onChange={(e) => { setTxnId(e.target.value); setError(""); }}
              placeholder="e.g. 425112345678"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-1 focus:ring-1 focus:ring-black outline-none"
            />

            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 mb-4">
              📌 After payment, your order will be confirmed. Orders are processed within 30 minutes.
            </div>

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-black text-white rounded-xl py-3 text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Confirm Payment"}
            </button>

            <button
              onClick={() => setStep("qr")}
              className="mt-2 w-full text-center text-xs text-gray-400 hover:text-gray-600"
            >
              ← Back to QR
            </button>
          </>
        )}

        {step === "done" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              ✅
            </div>
            <h2 className="text-xl font-bold mb-2">Payment Confirmed!</h2>
            <p className="text-sm text-gray-500 mb-2">Thank you! Your order has been confirmed.</p>
            <p className="text-xs text-gray-400 mb-6">
              Transaction ID: <span className="font-mono font-semibold">{txnId}</span>
            </p>
            <button
              onClick={onClose}
              className="bg-black text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
            >
              View My Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UPIPaymentModal;