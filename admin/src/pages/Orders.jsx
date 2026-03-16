import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "@/config";
import { Search, ChevronLeft, ChevronRight, ChevronDown, Trash2, Eye, Package } from "lucide-react";
import OrderDetailsDialog from "@/components/OrderDetailsDialog";

const ORDERS_PER_PAGE = 8;

const STATUS_OPTS = ["Order Placed","Packing","Shipped","Out for delivery","Delivered"];
const STATUS_COLOR = {
  "Order Placed":     "bg-blue-100 text-blue-700 border-blue-200",
  "Packing":          "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Shipped":          "bg-purple-100 text-purple-700 border-purple-200",
  "Out for delivery": "bg-orange-100 text-orange-700 border-orange-200",
  "Delivered":        "bg-green-100 text-green-700 border-green-200",
};

const StatusSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${STATUS_COLOR[value] || "bg-stone-100 text-stone-600 border-stone-200"}`}>
        {value}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-xl z-20 min-w-[170px] overflow-hidden">
            {STATUS_OPTS.map(s => (
              <button key={s} type="button"
                onClick={() => { onChange(s); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center justify-between ${value === s ? "text-amber-700" : "text-stone-700"}`}>
                {s}
                {value === s && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Orders = ({ token }) => {
  const [orders,       setOrders]      = useState([]);
  const [loading,      setLoading]     = useState(false);
  const [search,       setSearch]      = useState("");
  const [currentPage,  setCurrentPage] = useState(1);
  const [selectedOrder,setSelectedOrder] = useState(null);
  const [openDialog,   setOpenDialog]  = useState(false);
  const [deleteId,     setDeleteId]    = useState(null);
  const [deleting,     setDeleting]    = useState(false);

  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.post(backendUrl + "/api/order/list", {}, { headers: { token } });
      if (res.data.success) setOrders(res.data.orders.reverse());
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAllOrders(); }, [token]);

  const statusHandler = async (status, orderId) => {
    try {
      await axios.post(backendUrl + "/api/order/status", { orderId, status }, { headers: { token } });
      fetchAllOrders();
    } catch (err) { toast.error(err.message); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await axios.post(backendUrl + "/api/order/delete", { orderId: deleteId }, { headers: { token } });
      toast.success("Order deleted");
      setDeleteId(null);
      fetchAllOrders();
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(false); }
  };

  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const s = search.toLowerCase();
    return orders.filter(o =>
      `${o.address.firstName} ${o.address.lastName}`.toLowerCase().includes(s) ||
      o.address.phone.includes(s) ||
      o.status.toLowerCase().includes(s) ||
      o.paymentMethod.toLowerCase().includes(s)
    );
  }, [orders, search]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalPages     = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Orders</h1>
          <p className="text-sm text-stone-400">{filteredOrders.length} total order{filteredOrders.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
            className="pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 w-full sm:w-64 transition-all" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-stone-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-stone-100" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-32 rounded bg-stone-100" />
                  <div className="h-3 w-48 rounded bg-stone-100" />
                </div>
                <div className="h-6 w-20 rounded-full bg-stone-100" />
              </div>
            ))}
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 text-2xl">📦</div>
            <p className="font-semibold text-stone-700">No orders yet</p>
            <p className="text-sm text-stone-400 mt-1">Customer orders will appear here</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/50">
                    {["Items","Customer","Payment","Total","Status","Actions"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {paginatedOrders.map(order => (
                    <tr key={order._id} className="hover:bg-amber-50/20 transition-colors align-top">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Package className="w-3.5 h-3.5 text-amber-600" />
                          </div>
                          <div className="text-xs text-stone-600 space-y-0.5">
                            {order.items.slice(0, 2).map((item, i) => (
                              <p key={i}>{item.name} × {item.quantity}</p>
                            ))}
                            {order.items.length > 2 && <p className="text-stone-400">+{order.items.length - 2} more</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-stone-800">{order.address.firstName} {order.address.lastName}</p>
                        <p className="text-xs text-stone-400">{order.address.phone}</p>
                        <p className="text-xs text-stone-400">{new Date(order.date).toLocaleDateString("en-IN")}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.payment ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                          {order.payment ? "✓ Paid" : "⏳ Pending"}
                        </span>
                        <p className="text-xs text-stone-400 mt-1">{order.paymentMethod}</p>
                      </td>
                      <td className="px-5 py-4 font-bold text-stone-800">{currency}{order.amount.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4">
                        <StatusSelect value={order.status} onChange={v => statusHandler(v, order._id)} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setSelectedOrder(order); setOpenDialog(true); }}
                            className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(order._id)}
                            className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-stone-100">
              {paginatedOrders.map(order => (
                <div key={order._id} className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-stone-800">{order.address.firstName} {order.address.lastName}</p>
                      <p className="text-xs text-stone-400">{order.address.phone} · {new Date(order.date).toLocaleDateString("en-IN")}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.payment ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {order.payment ? "Paid" : "Pending"}
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 space-y-0.5">
                    {order.items.map((item, i) => <p key={i}>{item.name} × {item.quantity}</p>)}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-stone-800">{currency}{order.amount}</p>
                    <StatusSelect value={order.status} onChange={v => statusHandler(v, order._id)} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedOrder(order); setOpenDialog(true); }}
                      className="flex-1 py-2 text-xs font-semibold border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-all">
                      View Details
                    </button>
                    <button onClick={() => setDeleteId(order._id)}
                      className="flex-1 py-2 text-xs font-semibold border border-red-200 rounded-xl text-red-500 hover:bg-red-50 transition-all">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
            className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${currentPage === i + 1 ? "bg-amber-600 text-white" : "border border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-700"}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <OrderDetailsDialog open={openDialog} onOpenChange={setOpenDialog} order={selectedOrder} />

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 text-center">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="font-bold text-stone-800 text-lg mb-2">Delete Order?</h3>
            <p className="text-sm text-stone-500 mb-6">This action cannot be undone. The order will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-all">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60">
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;