import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { MapPin, Search, ChevronLeft, ChevronRight, Download, RefreshCw, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateInvoicePDF } from "../utils/invoiceGenerator";

const ORDERS_PER_PAGE = 5;

const STATUS_COLOR = {
  "Order Placed":     "bg-blue-100 text-blue-700",
  "Packing":          "bg-yellow-100 text-yellow-700",
  "Shipped":          "bg-purple-100 text-purple-700",
  "Out for delivery": "bg-orange-100 text-orange-700",
  "Delivered":        "bg-green-100 text-green-700",
};

const PAYMENT_ICON = {
  "COD":       "💵",
  "UPI":       "📱",
  "Razorpay":  "🏦",
  "Stripe":    "💳",
  "Net Banking":"🏦",
};

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const navigate = useNavigate();

  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [downloadingId,setDownloadingId]= useState(null);

  const loadOrderData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/order/userorders", {},
        { headers: { token } }
      );
      if (data.success) setOrders(data.orders.reverse());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadOrderData(); }, [token]);

  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const s = search.toLowerCase();
    return orders.filter(o =>
      o.items.some(i => i.name.toLowerCase().includes(s)) ||
      o.status.toLowerCase().includes(s) ||
      o.paymentMethod?.toLowerCase().includes(s)
    );
  }, [orders, search]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalPages     = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);

  const handleDownloadInvoice = (order) => {
    setDownloadingId(order._id);
    try {
      generateInvoicePDF(order);
    } catch (e) {
      console.error(e);
      alert("Invoice generation failed. Make sure jspdf is installed:\nnpm install jspdf jspdf-autotable");
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/10 px-4 sm:px-8 lg:px-16 py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-2xl"><Title text1="MY" text2="ORDERS" /></div>
          <div className="flex items-center gap-3">
            <button onClick={loadOrderData}
              className="p-2.5 border border-stone-200 rounded-xl hover:border-amber-400 hover:text-amber-700 transition-all text-stone-500">
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
                className="pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all w-full sm:w-56" />
            </div>
          </div>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
            <div className="text-5xl mb-4">🛍️</div>
            <p className="font-bold text-stone-700 text-lg">No orders yet</p>
            <p className="text-stone-400 mt-2 mb-6">Your ordered sweets will appear here</p>
            <button onClick={() => navigate("/collection")}
              className="px-6 py-3 bg-stone-800 text-white rounded-2xl text-sm font-semibold hover:bg-amber-700 transition-all">
              Shop Sweets 🍬
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedOrders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-md transition-all">

                {/* Status colour bar */}
                <div className={`h-1 w-full ${
                  order.status === "Delivered"        ? "bg-green-400"  :
                  order.status === "Out for delivery" ? "bg-orange-400 animate-pulse" :
                  order.status === "Shipped"          ? "bg-purple-400" :
                  order.status === "Packing"          ? "bg-yellow-400" : "bg-blue-400"
                }`} />

                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-stone-100 bg-stone-50/50">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{PAYMENT_ICON[order.paymentMethod] || "💳"}</span>
                    <div>
                      <p className="text-xs text-stone-400">
                        {new Date(order.date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                        {" · "}{order.paymentMethod}
                      </p>
                      <p className="text-xs font-mono text-stone-400">#{order._id.slice(-10).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[order.status] || "bg-stone-100 text-stone-600"}`}>
                      {order.status}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.payment ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {order.payment ? "✓ Paid" : "⏳ Pending"}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 py-4">
                  <div className="flex gap-3 flex-wrap">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <img src={item.image[0]} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-stone-100" />
                        <div>
                          <p className="text-xs font-semibold text-stone-800 max-w-[120px] truncate">{item.name}</p>
                          <p className="text-xs text-stone-400">×{item.quantity} · {currency}{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-xs font-bold text-stone-400">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-stone-100 bg-stone-50/50">
                  <div>
                    <p className="font-bold text-stone-800">
                      {currency}{order.amount.toLocaleString("en-IN")}
                      {order.discountAmount > 0 && (
                        <span className="ml-2 text-xs text-green-600 font-semibold">(saved ₹{order.discountAmount})</span>
                      )}
                    </p>
                    <p className="text-xs text-stone-400">{order.items.length} item{order.items.length > 1 ? "s" : ""} · GST included</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Download Invoice */}
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      disabled={downloadingId === order._id}
                      className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 bg-white hover:bg-stone-100 border border-stone-200 px-3 py-2 rounded-xl transition-all whitespace-nowrap"
                    >
                      {downloadingId === order._id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Download className="w-3.5 h-3.5" />
                      }
                      Invoice PDF
                    </button>

                    {/* Track Order */}
                    <button
                      onClick={() => navigate(`/track-order/${order._id}`)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl transition-all whitespace-nowrap"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Track
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
              className="p-2 rounded-xl border border-stone-200 hover:border-amber-400 hover:text-amber-700 disabled:opacity-40 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${currentPage === i + 1 ? "bg-amber-600 text-white" : "border border-stone-200 text-stone-600 hover:border-amber-400"}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-stone-200 hover:border-amber-400 hover:text-amber-700 disabled:opacity-40 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;