import React, { useState } from "react";
import QRCodeDisplay from "./QRCodeDisplay";

const QRQuickOrderModal = ({ productUrl = "", productName = "" }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("shop");

  const shopUrl = window.location.origin;
  const pUrl = productUrl || window.location.href;

  return (
    <>
      {/* Floating QR Button — bottom right */}
      <button
        onClick={() => setOpen(true)}
        title="QR Quick Order"
        className="fixed bottom-6 right-6 z-50 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-all"
        style={{ width: 52, height: 52 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4z" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl leading-none"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-1">QR Quick Order</h2>
            <p className="text-xs text-gray-500 mb-4">
              Scan with your phone camera or any UPI/QR app to open the shop instantly.
            </p>

            {productUrl && (
              <div className="flex gap-2 mb-5">
                {["shop", "product"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition ${
                      tab === t
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-500 border-gray-200"
                    }`}
                  >
                    {t === "shop" ? "🏪 Shop" : "🍬 This Product"}
                  </button>
                ))}
              </div>
            )}

            {tab === "shop" && (
              <QRCodeDisplay
                url={shopUrl}
                size={180}
                label="Scan to open Prem Mithas Sweet Shop"
              />
            )}
            {tab === "product" && (
              <QRCodeDisplay
                url={pUrl}
                size={180}
                label={productName ? `Quick order: ${productName}` : "Scan to view this product"}
              />
            )}

            <p className="text-[10px] text-gray-400 text-center mt-4">
              Share this QR with friends to let them order directly
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default QRQuickOrderModal;