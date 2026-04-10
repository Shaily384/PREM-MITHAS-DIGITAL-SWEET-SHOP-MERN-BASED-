import React, { useEffect, useState } from "react";

const QRCodeDisplay = ({
  url = window.location.origin,
  size = 200,
  label = "Scan to open shop",
  showDownload = true,
  className = "",
}) => {
  const [qrSrc, setQrSrc] = useState("");
  const [copied, setCopied] = useState(false);

  const encoded = encodeURIComponent(url);
  const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=10&color=1a1a1a&bgcolor=ffffff`;

  useEffect(() => {
    setQrSrc(apiUrl);
  }, [url, size]);

  const handleDownload = async () => {
    try {
      const res = await fetch(qrSrc);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "sweet-shop-qr.png";
      a.click();
    } catch {
      window.open(qrSrc, "_blank");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 bg-white shadow-sm">
        {qrSrc ? (
          <img src={qrSrc} alt="QR Code" width={size} height={size} className="block" />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center text-gray-400 text-sm"
          >
            Generating QR…
          </div>
        )}
      </div>

      {label && (
        <p className="text-xs text-gray-500 text-center max-w-[200px]">{label}</p>
      )}

      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 max-w-[220px]">
        <span className="text-[10px] text-gray-500 truncate flex-1">{url}</span>
        <button
          onClick={handleCopyLink}
          className="text-[10px] font-semibold text-black hover:text-gray-600 whitespace-nowrap"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {showDownload && (
        <button
          onClick={handleDownload}
          className="text-xs border border-gray-300 rounded-lg px-4 py-1.5 hover:bg-gray-50 transition"
        >
          ⬇ Download QR
        </button>
      )}
    </div>
  );
};

export default QRCodeDisplay;