import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "@/config";
import { toast } from "react-toastify";
import { Package, ShoppingBag, IndianRupee, Clock, Users, RefreshCcw } from "lucide-react";

const STATUS_COLOR = {
  "Order Placed":     "bg-blue-100 text-blue-700",
  "Packing":          "bg-yellow-100 text-yellow-700",
  "Shipped":          "bg-purple-100 text-purple-700",
  "Out for delivery": "bg-orange-100 text-orange-700",
  "Delivered":        "bg-green-100 text-green-700",
};

const COLOR_MAP = {
  amber:  { bg:"bg-amber-50",  icon:"bg-amber-100 text-amber-700",   val:"text-amber-700"  },
  blue:   { bg:"bg-blue-50",   icon:"bg-blue-100 text-blue-700",     val:"text-blue-700"   },
  green:  { bg:"bg-green-50",  icon:"bg-green-100 text-green-700",   val:"text-green-700"  },
  orange: { bg:"bg-orange-50", icon:"bg-orange-100 text-orange-700", val:"text-orange-700" },
  purple: { bg:"bg-purple-50", icon:"bg-purple-100 text-purple-700", val:"text-purple-700" },
};

const Dashboard = ({ token }) => {
  const [loading,      setLoading]      = useState(true);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [stats,        setStats]        = useState({ products:0, orders:0, revenue:0, pending:0, users:0 });
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        axios.get(backendUrl + "/api/product/list"),
        axios.post(backendUrl + "/api/order/list", {}, { headers: { token } }),
        axios.get(backendUrl + "/api/user/count",  { headers: { token } }),
      ]);
      if (productsRes.data.success && ordersRes.data.success && usersRes.data.success) {
        const orders  = ordersRes.data.orders;
        const revenue = orders.filter(o => o.payment).reduce((s, o) => s + o.amount, 0);
        setStats({ products: productsRes.data.products.length, orders: orders.length, revenue, pending: orders.filter(o => !o.payment).length, users: usersRes.data.count });
        setRecentOrders(orders.slice(0, 6));
        setLastUpdated(new Date());
      }
    } catch { toast.error("Failed to load dashboard"); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, []);
  const timeStr = useMemo(() => lastUpdated ? lastUpdated.toLocaleTimeString() : "", [lastUpdated]);

  const CARDS = [
    { label:"Sweets",           value: stats.products, icon: Package,     color:"amber",  prefix:"" },
    { label:"Total Orders",     value: stats.orders,   icon: ShoppingBag, color:"blue",   prefix:"" },
    { label:"Revenue",          value: stats.revenue,  icon: IndianRupee, color:"green",  prefix: currency },
    { label:"Pending Payment",  value: stats.pending,  icon: Clock,       color:"orange", prefix:"" },
    { label:"Registered Users", value: stats.users,    icon: Users,       color:"purple", prefix:"" },
  ];

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
          <p className="text-sm text-stone-400 mt-0.5">Overview of Prem Mithas store performance</p>
          {lastUpdated && <p className="text-xs text-stone-300 mt-1">Updated at {timeStr}</p>}
        </div>
        <button onClick={fetchDashboardData} disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold text-stone-500 border border-stone-200 px-3 py-2 rounded-xl hover:border-amber-400 hover:text-amber-700 transition-all duration-200 disabled:opacity-50">
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {CARDS.map(({ label, value, icon: Icon, color, prefix }) => {
          const c = COLOR_MAP[color];
          return (
            <div key={label} className={`${c.bg} rounded-2xl p-5 border border-white shadow-sm`}>
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-9 w-9 rounded-xl bg-white/70" />
                  <div className="h-3 w-16 rounded bg-white/70" />
                  <div className="h-7 w-12 rounded bg-white/70" />
                </div>
              ) : (
                <>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${c.icon}`}><Icon className="w-4 h-4" /></div>
                  <p className="text-xs text-stone-500 font-medium">{label}</p>
                  <p className={`text-2xl font-bold mt-0.5 ${c.val}`}>{prefix}{Number(value).toLocaleString("en-IN")}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h2 className="font-semibold text-stone-800">Recent Orders</h2>
            <p className="text-xs text-stone-400">Latest customer orders</p>
          </div>
          <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">{recentOrders.length} shown</span>
        </div>

        {loading ? (
          <div className="divide-y divide-stone-50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 animate-pulse">
                <div className="space-y-2"><div className="h-3 w-32 rounded bg-stone-100" /><div className="h-3 w-20 rounded bg-stone-100" /></div>
                <div className="h-6 w-16 rounded-full bg-stone-100" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 text-2xl">🛒</div>
            <p className="font-semibold text-stone-700">No orders yet</p>
            <p className="text-sm text-stone-400 mt-1">Your first sale will appear here</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/50">
                    {["Customer","Date","Items","Total","Payment","Status"].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {recentOrders.map(order => (
                    <tr key={order._id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-stone-800">{order.address.firstName} {order.address.lastName}</p>
                        <p className="text-xs text-stone-400">{order.address.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-stone-600">{new Date(order.date).toLocaleDateString("en-IN")}</td>
                      <td className="px-6 py-4 text-stone-600">{order.items.length} item{order.items.length > 1 ? "s" : ""}</td>
                      <td className="px-6 py-4 font-semibold text-stone-800">{currency}{order.amount.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.payment ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                          {order.payment ? "✓ Paid" : "⏳ Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] || "bg-stone-100 text-stone-600"}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-stone-100">
              {recentOrders.map(order => (
                <div key={order._id} className="px-5 py-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-stone-800 text-sm">{order.address.firstName} {order.address.lastName}</p>
                      <p className="text-xs text-stone-400">{new Date(order.date).toLocaleDateString("en-IN")}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.payment ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {order.payment ? "Paid" : "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">{order.items.length} items</span>
                    <span className="font-bold text-stone-800">{currency}{order.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;