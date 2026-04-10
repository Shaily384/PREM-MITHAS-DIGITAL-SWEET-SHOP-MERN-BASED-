import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "@/config";
import { toast } from "react-toastify";
import { TrendingUp, TrendingDown, Star, Package, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SalesInsights = ({ token }) => {
  const [insights, setInsights] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("top"); // "top" | "low" | "rated"

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(backendUrl + "/api/product/insights", { headers: { token } });
        if (data.success) setInsights(data.insights);
      } catch (e) { toast.error(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const topSelling  = [...insights].sort((a,b) => b.unitsSold - a.unitsSold).slice(0,10);
  const lowDemand   = [...insights].filter(p => p.unitsSold === 0);
  const topRated    = [...insights].filter(p => p.reviewCount > 0).sort((a,b) => b.avgRating - a.avgRating).slice(0,10);

  const chartData = topSelling.slice(0,8).map(p => ({
    name: p.name.length > 12 ? p.name.slice(0,12)+"…" : p.name,
    sold: p.unitsSold,
    revenue: p.revenue,
  }));

  const CustomTip = ({ active, payload, label }) => active && payload?.length ? (
    <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs text-stone-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-amber-700">{payload[0].value} units sold</p>
    </div>
  ) : null;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-amber-600" /> Sales Insights
        </h1>
        <p className="text-sm text-stone-400">{insights.length} products analysed</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Total Products",  value: insights.length,                             color:"bg-amber-50 text-amber-700",  icon:"📦" },
          { label:"Total Units Sold",value: insights.reduce((s,p)=>s+p.unitsSold,0),    color:"bg-blue-50 text-blue-700",    icon:"📊" },
          { label:"Total Revenue",   value:`₹${insights.reduce((s,p)=>s+p.revenue,0).toLocaleString("en-IN")}`, color:"bg-green-50 text-green-700", icon:"💰" },
          { label:"Zero Sales",      value: lowDemand.length,                            color:"bg-red-50 text-red-700",      icon:"⚠️" },
        ].map(c => (
          <div key={c.label} className={`${c.color} rounded-2xl p-5 border border-white shadow-sm`}>
            <div className="text-2xl mb-2">{c.icon}</div>
            <p className="text-xs font-medium opacity-70">{c.label}</p>
            <p className="text-xl font-bold mt-0.5">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <h2 className="font-bold text-stone-800 mb-5">Top 8 Best-Selling Sweets</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top:5, right:10, left:10, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTip />} />
                <Bar dataKey="sold" fill="#d97706" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-stone-100">
          {[
            { id:"top",   label:`🏆 Top Selling (${topSelling.length})`  },
            { id:"low",   label:`⚠️ Zero Sales (${lowDemand.length})`     },
            { id:"rated", label:`⭐ Top Rated (${topRated.length})`       },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${tab === t.id ? "border-b-2 border-amber-500 text-amber-700 bg-amber-50/50" : "text-stone-500 hover:bg-stone-50"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="divide-y divide-stone-50">
          {(tab === "top" ? topSelling : tab === "low" ? lowDemand : topRated).map((p, i) => (
            <div key={p._id} className="flex items-center gap-4 px-5 py-4 hover:bg-amber-50/20 transition-colors">
              <span className="text-sm font-bold text-stone-400 w-5">{i+1}</span>
              <img src={p.image[0]} className="w-10 h-10 rounded-xl object-cover border border-stone-100" alt={p.name} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-800 truncate text-sm">{p.name}</p>
                <p className="text-xs text-stone-400">{p.category}</p>
              </div>
              {tab === "top" && (
                <div className="text-right">
                  <p className="font-bold text-amber-700 text-sm">{p.unitsSold} sold</p>
                  <p className="text-xs text-stone-400">₹{p.revenue.toLocaleString("en-IN")}</p>
                </div>
              )}
              {tab === "low" && (
                <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-semibold">No sales yet</span>
              )}
              {tab === "rated" && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-amber-700 text-sm">{p.avgRating}</span>
                  <span className="text-xs text-stone-400">({p.reviewCount})</span>
                </div>
              )}
            </div>
          ))}
          {(tab === "top" ? topSelling : tab === "low" ? lowDemand : topRated).length === 0 && (
            <div className="text-center py-12 text-stone-400">
              <p className="text-4xl mb-3">📊</p>
              <p>No data yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesInsights;