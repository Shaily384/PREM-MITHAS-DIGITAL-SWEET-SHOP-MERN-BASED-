import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "@/config";
import { toast } from "react-toastify";
import { Package, ShoppingBag, IndianRupee, Clock, Users, RefreshCcw } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";

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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-lg">
        <p className="text-xs text-stone-400 mb-1">{label}</p>
        <p className="text-base font-bold text-amber-700">₹{Number(payload[0].value).toLocaleString("en-IN")}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = ({ token }) => {
  const [loading,      setLoading]      = useState(true);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [stats,        setStats]        = useState({ products:0, orders:0, revenue:0, pending:0, users:0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData,  setRevenueData]  = useState([]);
  const [graphType,    setGraphType]    = useState("area"); // "area" | "bar"

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, usersRes, revenueRes] = await Promise.all([
        axios.get(backendUrl + "/api/product/list"),
        axios.post(backendUrl + "/api/order/list", {}, { headers: { token } }),
        axios.get(backendUrl + "/api/user/count", { headers: { token } }),
        axios.get(backendUrl + "/api/order/revenue-stats", { headers: { token } }),
      ]);

      if (productsRes.data.success && ordersRes.data.success && usersRes.data.success) {
        const orders  = ordersRes.data.orders;
        const revenue = orders.filter(o => o.payment).reduce((s, o) => s + o.amount, 0);
        setStats({
          products: productsRes.data.products.length,
          orders:   orders.length,
          revenue,
          pending:  orders.filter(o => !o.payment).length,
          users:    usersRes.data.count,
        });
        setRecentOrders(orders.slice(0, 6));
        setLastUpdated(new Date());
      }

      if (revenueRes.data.success) setRevenueData(revenueRes.data.data);
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

  // Insight from graph
  const topMonth = useMemo(() => {
    if (!revenueData.length) return null;
    return revenueData.reduce((a, b) => a.revenue > b.revenue ? a : b);
  }, [revenueData]);

  const totalRevenue = useMemo(() =>
    revenueData.reduce((s, d) => s + d.revenue, 0), [revenueData]);

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
          <p className="text-sm text-stone-400 mt-0.5">Prem Mithas store overview</p>
          {lastUpdated && <p className="text-xs text-stone-300 mt-1">Updated at {timeStr}</p>}
        </div>
        <button onClick={fetchDashboardData} disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold text-stone-500 border border-stone-200 px-3 py-2 rounded-xl hover:border-amber-400 hover:text-amber-700 transition-all duration-200 disabled:opacity-50">
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ── Stat Cards ── */}
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
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${c.icon}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-stone-500 font-medium">{label}</p>
                  <p className={`text-2xl font-bold mt-0.5 ${c.val}`}>{prefix}{Number(value).toLocaleString("en-IN")}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Revenue Graph ── */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-bold text-stone-800 text-lg">Revenue Overview</h2>
            <p className="text-xs text-stone-400 mt-0.5">Last 12 months · Paid orders only</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Insight pill */}
            {topMonth && topMonth.revenue > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
                <span className="text-xs text-green-600 font-semibold">
                  🏆 Best: {topMonth.month} · ₹{topMonth.revenue.toLocaleString("en-IN")}
                </span>
              </div>
            )}
            {/* Graph type toggle */}
            <div className="flex border border-stone-200 rounded-xl overflow-hidden">
              {["area","bar"].map(type => (
                <button key={type} onClick={() => setGraphType(type)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-all capitalize
                    ${graphType === type ? "bg-stone-800 text-white" : "text-stone-500 hover:bg-stone-50"}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 rounded-xl bg-stone-50 animate-pulse flex items-center justify-center">
            <p className="text-stone-300 text-sm">Loading chart...</p>
          </div>
        ) : revenueData.every(d => d.revenue === 0) ? (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-3">📊</div>
            <p className="font-semibold text-stone-700">No revenue data yet</p>
            <p className="text-sm text-stone-400 mt-1">Revenue will appear here once you receive paid orders</p>
          </div>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {graphType === "area" ? (
                  <AreaChart data={revenueData} margin={{ top:5, right:10, left:10, bottom:5 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#d97706" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}
                      tickFormatter={v => v >= 1000 ? `₹${v/1000}k` : `₹${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={2.5}
                      fill="url(#revenueGrad)" dot={{ fill:"#d97706", strokeWidth:2, r:3 }}
                      activeDot={{ r:6, fill:"#d97706" }} />
                  </AreaChart>
                ) : (
                  <BarChart data={revenueData} margin={{ top:5, right:10, left:10, bottom:5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}
                      tickFormatter={v => v >= 1000 ? `₹${v/1000}k` : `₹${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#d97706" radius={[6,6,0,0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Stats row below chart */}
            <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-stone-100">
              <div className="text-center">
                <p className="text-xs text-stone-400">12-Month Revenue</p>
                <p className="font-bold text-stone-800 mt-0.5">₹{totalRevenue.toLocaleString("en-IN")}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-stone-400">Avg / Month</p>
                <p className="font-bold text-stone-800 mt-0.5">₹{Math.round(totalRevenue / 12).toLocaleString("en-IN")}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-stone-400">Best Month</p>
                <p className="font-bold text-amber-700 mt-0.5">{topMonth?.month || "—"}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Recent Orders Table ── */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h2 className="font-semibold text-stone-800">Recent Orders</h2>
            <p className="text-xs text-stone-400">Latest customer orders</p>
          </div>
          <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
            {recentOrders.length} shown
          </span>
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
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  {["Customer","Date","Items","Total","Coupon","Payment","Status"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {recentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-800">{order.address.firstName} {order.address.lastName}</p>
                      <p className="text-xs text-stone-400">{order.address.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-stone-600 text-xs">{new Date(order.date).toLocaleDateString("en-IN")}</td>
                    <td className="px-5 py-4 text-stone-600">{order.items.length}</td>
                    <td className="px-5 py-4 font-semibold text-stone-800">₹{order.amount.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4">
                      {order.couponCode
                        ? <span className="font-mono text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">{order.couponCode}</span>
                        : <span className="text-stone-300 text-xs">—</span>
                      }
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.payment ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {order.payment ? "✓ Paid" : "⏳ Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] || "bg-stone-100 text-stone-600"}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;