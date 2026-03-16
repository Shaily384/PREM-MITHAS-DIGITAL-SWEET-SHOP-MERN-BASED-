import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { backendUrl, currency } from "@/config";
import { Loader2, Search, Star, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 8;

const CATEGORIES = ["Prasad","Traditional","Dry Fruit","Festive","Party Desserts","Fusion","Seasonal"];

const List = ({ token }) => {
  const [list,        setList]        = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [updating,    setUpdating]    = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [search,      setSearch]      = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(backendUrl + "/api/product/list");
      if (res.data.success) setList(res.data.products.reverse());
      else toast.error(res.data.message);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const removeProduct = async (id) => {
    try {
      const res = await axios.post(backendUrl + "/api/product/remove", { id }, { headers: { token } });
      if (res.data.success) { toast.success("Sweet removed! 🗑️"); fetchList(); setDeleteId(null); }
    } catch (err) { toast.error(err.message); }
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await axios.post(backendUrl + "/api/product/update",
        { id: editProduct._id, name: editProduct.name, price: editProduct.price, category: editProduct.category, description: editProduct.description, bestseller: editProduct.bestseller },
        { headers: { token } }
      );
      if (res.data.success) { toast.success("Product updated! ✅"); fetchList(); setEditProduct(null); }
    } catch (err) { toast.error(err.message); }
    finally { setUpdating(false); }
  };

  useEffect(() => { fetchList(); }, []);

  const filteredList = useMemo(() => {
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter(item => item.name.toLowerCase().includes(s) || item.category.toLowerCase().includes(s));
  }, [list, search]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalPages   = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
  const paginatedList = filteredList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Products</h1>
          <p className="text-sm text-stone-400">
            {filteredList.length} sweet{filteredList.length !== 1 ? "s" : ""} in store
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sweets..."
            className="pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 w-full sm:w-64 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
          </div>
        ) : paginatedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-4xl mb-3">🍬</div>
            <p className="font-semibold text-stone-700">No sweets found</p>
            <p className="text-sm text-stone-400 mt-1">Try a different search or add a new product</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  {["Product","Category","Price","Status","Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {paginatedList.map(item => (
                  <tr key={item._id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.image[0]} alt={item.name} className="w-11 h-11 rounded-xl object-cover border border-stone-100" />
                        <div>
                          <p className="font-semibold text-stone-800">{item.name}</p>
                          <p className="text-xs text-stone-400 mt-0.5 line-clamp-1 max-w-[180px]">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-stone-800">{currency}{Number(item.price).toLocaleString("en-IN")}<span className="text-xs text-stone-400 font-normal">/kg</span></td>
                    <td className="px-5 py-4">
                      {item.bestseller
                        ? <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 w-fit"><Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Bestseller</span>
                        : <span className="text-xs text-stone-400">Regular</span>
                      }
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewProduct(item)}
                          className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditProduct(item)}
                          className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteId(item._id)}
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

      {/* VIEW MODAL */}
      {viewProduct && (
        <Modal onClose={() => setViewProduct(null)} title="Product Details">
          <img src={viewProduct.image[0]} className="w-full h-52 object-cover rounded-xl mb-4" alt={viewProduct.name} />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoBox label="Name"     value={viewProduct.name} />
            <InfoBox label="Price"    value={`${currency}${viewProduct.price}/kg`} />
            <InfoBox label="Category" value={viewProduct.category} />
            <InfoBox label="Status"   value={viewProduct.bestseller ? "⭐ Bestseller" : "Regular"} />
          </div>
          <div className="mt-3 p-3 bg-stone-50 rounded-xl">
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-1">Description</p>
            <p className="text-sm text-stone-600">{viewProduct.description}</p>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editProduct && (
        <Modal onClose={() => setEditProduct(null)} title="Edit Sweet">
          <form onSubmit={updateProduct} className="space-y-4">
            <Field label="Sweet Name">
              <input value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-stone-50 focus:bg-white transition-all" />
            </Field>
            <Field label="Price (₹ per kg)">
              <input type="number" value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-stone-50 focus:bg-white transition-all" />
            </Field>
            <Field label="Category">
              <select value={editProduct.category} onChange={e => setEditProduct({ ...editProduct, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-stone-50 focus:bg-white transition-all">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Description">
              <textarea rows={3} value={editProduct.description} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-stone-50 focus:bg-white transition-all resize-none" />
            </Field>
            <button type="button" onClick={() => setEditProduct({ ...editProduct, bestseller: !editProduct.bestseller })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${editProduct.bestseller ? "border-amber-500 bg-amber-50 text-amber-700" : "border-stone-200 text-stone-500 hover:border-amber-300"}`}>
              <Star className={`w-4 h-4 ${editProduct.bestseller ? "fill-amber-500 text-amber-500" : "text-stone-300"}`} />
              <span className="text-sm font-semibold">{editProduct.bestseller ? "⭐ Marked as Bestseller" : "Mark as Bestseller"}</span>
            </button>
            <button type="submit" disabled={updating}
              className="w-full py-3 bg-stone-800 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2">
              {updating && <Loader2 className="w-4 h-4 animate-spin" />}
              {updating ? "Updating..." : "Update Sweet"}
            </button>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <Modal onClose={() => setDeleteId(null)} title="Delete Sweet?">
          <div className="text-center py-4">
            <div className="text-5xl mb-4">🗑️</div>
            <p className="text-stone-600 mb-6">This action cannot be undone. The sweet will be permanently removed from your store.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-all">
                Cancel
              </button>
              <button onClick={() => removeProduct(deleteId)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all">
                Yes, Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ children, onClose, title }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-stone-800 text-lg">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-all text-lg font-bold">×</button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold tracking-widest text-stone-400 uppercase mb-1.5">{label}</label>
    {children}
  </div>
);

const InfoBox = ({ label, value }) => (
  <div className="p-3 bg-stone-50 rounded-xl">
    <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-stone-800">{value}</p>
  </div>
);

export default List;