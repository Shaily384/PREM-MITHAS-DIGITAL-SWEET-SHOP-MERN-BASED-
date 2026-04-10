import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "@/config";
import { toast } from "react-toastify";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, ChevronDown, Loader2 } from "lucide-react";

const EMPTY = { code:"", discountType:"percent", discountValue:"", minOrderAmount:"", maxUses:"100", expiresAt:"" };

const Coupons = ({ token }) => {
  const [coupons,  setCoupons]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState(EMPTY);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + "/api/coupon/list", { headers: { token } });
      if (data.success) setCoupons(data.coupons);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await axios.post(backendUrl + "/api/coupon/create", form, { headers: { token } });
      if (data.success) { toast.success("Coupon created! 🎉"); setForm(EMPTY); setShowForm(false); fetchCoupons(); }
      else toast.error(data.message);
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleToggle = async (couponId) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/coupon/toggle", { couponId }, { headers: { token } });
      if (data.success) { toast.success(data.message); fetchCoupons(); }
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (couponId) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      const { data } = await axios.post(backendUrl + "/api/coupon/delete", { couponId }, { headers: { token } });
      if (data.success) { toast.success("Deleted"); fetchCoupons(); }
    } catch (e) { toast.error(e.message); }
  };

  const isExpired = (date) => new Date() > new Date(date);

  const INPUT = "w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-stone-50 focus:bg-white transition-all";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-600" /> Coupons
          </h1>
          <p className="text-sm text-stone-400">{coupons.length} coupon{coupons.length !== 1 ? "s" : ""} created</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-all duration-200">
          <Plus className="w-4 h-4" />
          New Coupon
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showForm ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
          <h2 className="font-bold text-stone-800 mb-5 flex items-center gap-2">
            <span className="text-xl">🎟️</span> Create New Coupon
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <div>
              <label className="block text-xs font-semibold tracking-widest text-stone-400 uppercase mb-1.5">Coupon Code *</label>
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                placeholder="DIWALI20" required className={`${INPUT} font-mono tracking-widest`} />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest text-stone-400 uppercase mb-1.5">Discount Type *</label>
              <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} className={INPUT}>
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest text-stone-400 uppercase mb-1.5">
                Discount Value * {form.discountType === "percent" ? "(%)" : "(₹)"}
              </label>
              <input type="number" value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})}
                placeholder={form.discountType === "percent" ? "20" : "100"} required min="1" className={INPUT} />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest text-stone-400 uppercase mb-1.5">Min Order Amount (₹)</label>
              <input type="number" value={form.minOrderAmount} onChange={e => setForm({...form, minOrderAmount: e.target.value})}
                placeholder="500" min="0" className={INPUT} />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest text-stone-400 uppercase mb-1.5">Max Uses</label>
              <input type="number" value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})}
                placeholder="100" min="1" className={INPUT} />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest text-stone-400 uppercase mb-1.5">Expires On *</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})}
                required min={new Date().toISOString().split("T")[0]} className={INPUT} />
            </div>

            {/* Preview */}
            {form.code && form.discountValue && (
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="text-3xl">🎟️</div>
                  <div>
                    <p className="font-bold text-amber-800 font-mono text-lg">{form.code}</p>
                    <p className="text-sm text-amber-700">
                      {form.discountType === "percent" ? `${form.discountValue}% off` : `₹${form.discountValue} off`}
                      {form.minOrderAmount ? ` on orders above ₹${form.minOrderAmount}` : ""}
                      {form.expiresAt ? ` · Expires ${new Date(form.expiresAt).toLocaleDateString("en-IN")}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-stone-800 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Coupon
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); }}
                className="px-6 py-2.5 border border-stone-200 text-stone-600 text-sm font-semibold rounded-xl hover:bg-stone-50 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">🎟️</div>
            <p className="font-semibold text-stone-700">No coupons yet</p>
            <p className="text-sm text-stone-400 mt-1">Create your first coupon to give discounts to customers</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  {["Code","Type","Value","Min Order","Used","Expires","Status","Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {coupons.map(coupon => {
                  const expired = isExpired(coupon.expiresAt);
                  const usedUp  = coupon.usedCount >= coupon.maxUses;
                  return (
                    <tr key={coupon._id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-stone-800 bg-stone-100 px-2 py-1 rounded-lg text-xs tracking-widest">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${coupon.discountType === "percent" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                          {coupon.discountType === "percent" ? "%" : "₹"} {coupon.discountType}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-amber-700">
                        {coupon.discountType === "percent" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      </td>
                      <td className="px-5 py-4 text-stone-600">{coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount}` : "—"}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-stone-100 rounded-full h-1.5 w-16">
                            <div className="bg-amber-500 h-1.5 rounded-full" style={{width: `${Math.min((coupon.usedCount / coupon.maxUses) * 100, 100)}%`}} />
                          </div>
                          <span className="text-xs text-stone-500">{coupon.usedCount}/{coupon.maxUses}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-stone-500 text-xs">
                        {new Date(coupon.expiresAt).toLocaleDateString("en-IN")}
                        {expired && <span className="ml-1 text-red-500">(Expired)</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          expired || usedUp ? "bg-stone-100 text-stone-500" :
                          coupon.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {expired ? "Expired" : usedUp ? "Limit Reached" : coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggle(coupon._id)} title={coupon.isActive ? "Deactivate" : "Activate"}
                            className="p-1.5 rounded-lg border border-stone-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-stone-500 hover:text-amber-700">
                            {coupon.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleDelete(coupon._id)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:border-red-400 hover:bg-red-50 transition-all text-stone-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupons;