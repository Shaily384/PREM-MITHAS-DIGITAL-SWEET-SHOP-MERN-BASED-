import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Plus, Minus, ShoppingBag, Gift, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const BOX_SIZES = [
  { label: "Small Box",  emoji: "🎁", minQty: 4,  maxQty: 6,  price: 50,  color: "border-amber-200 bg-amber-50"  },
  { label: "Medium Box", emoji: "🎀", minQty: 7,  maxQty: 12, price: 80,  color: "border-blue-200 bg-blue-50"    },
  { label: "Large Box",  emoji: "🛍️", minQty: 13, maxQty: 20, price: 120, color: "border-purple-200 bg-purple-50" },
];

const SweetBoxBuilder = () => {
  const { products, currency, addToCart, token } = useContext(ShopContext);
  const navigate = useNavigate();

  const [selectedBox,   setSelectedBox]   = useState(null);
  const [boxItems,      setBoxItems]      = useState({});   // { productId: qty }
  const [searchFilter,  setSearchFilter]  = useState("");

  const sweetsOnly = products.filter(p =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const totalQty    = Object.values(boxItems).reduce((s, q) => s + q, 0);
  const subtotal    = Object.entries(boxItems).reduce((s, [id, qty]) => {
    const p = products.find(x => x._id === id);
    return p ? s + p.price * qty : s;
  }, 0);
  const boxFee      = selectedBox?.price || 0;
  const grandTotal  = subtotal + boxFee;

  const minQty = selectedBox?.minQty || 1;
  const maxQty = selectedBox?.maxQty || 99;

  const addItem = (id) => {
    if (!selectedBox) return toast.error("Please choose a box size first");
    if (totalQty >= maxQty) return toast.error(`Max ${maxQty} sweets for ${selectedBox.label}`);
    setBoxItems(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeItem = (id) => {
    setBoxItems(prev => {
      const next = { ...prev };
      if ((next[id] || 0) <= 1) delete next[id];
      else next[id]--;
      return next;
    });
  };

  const clearItem = (id) => setBoxItems(prev => { const n = {...prev}; delete n[id]; return n; });

  const handleOrder = () => {
    if (!token) return toast.error("Please login first");
    if (!selectedBox) return toast.error("Choose a box size");
    if (totalQty < minQty) return toast.error(`Add at least ${minQty} sweets for ${selectedBox.label}`);

    // Add each item to cart
    Object.entries(boxItems).forEach(([id, qty]) => {
      for (let i = 0; i < qty; i++) addToCart(id);
    });
    toast.success(`🎁 ${selectedBox.label} added to cart!`);
    navigate("/cart");
  };

  const selectedItems = Object.entries(boxItems).map(([id, qty]) => {
    const p = products.find(x => x._id === id);
    return p ? { ...p, qty } : null;
  }).filter(Boolean);

  return (
    <div className="min-h-screen bg-amber-50/20 px-4 sm:px-8 lg:px-16 py-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">🎁</div>
          <h1 className="text-3xl font-bold text-stone-800">Build Your Sweet Box</h1>
          <p className="text-stone-500 mt-2">Mix and match your favourite sweets into a custom gift box</p>
        </div>

        {/* Step 1: Choose Box */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <h2 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">1</span>
            Choose Your Box Size
          </h2>
          <p className="text-sm text-stone-400 mb-5">Each box size has a minimum and maximum number of sweets</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {BOX_SIZES.map(box => (
              <button key={box.label} onClick={() => { setSelectedBox(box); setBoxItems({}); }}
                className={`p-5 rounded-2xl border-2 text-left transition-all duration-200
                  ${selectedBox?.label === box.label ? "border-amber-500 ring-2 ring-amber-500/20 " + box.color : "border-stone-200 hover:border-amber-300"}`}>
                <div className="text-3xl mb-2">{box.emoji}</div>
                <p className="font-bold text-stone-800">{box.label}</p>
                <p className="text-sm text-stone-500">{box.minQty}–{box.maxQty} sweets</p>
                <p className="text-xs text-stone-400 mt-1">Box packaging: {currency}{box.price}</p>
                {selectedBox?.label === box.label && (
                  <span className="mt-2 inline-block text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">Selected ✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Step 2: Pick Sweets */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">2</span>
              Pick Your Sweets
              {selectedBox && (
                <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${totalQty >= minQty ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                  {totalQty} / {maxQty} sweets
                </span>
              )}
            </h2>
            {selectedBox && (
              <div className="mb-4 h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-2 bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((totalQty / maxQty) * 100, 100)}%` }} />
              </div>
            )}

            <input value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
              placeholder="🔍 Search sweets..."
              className="w-full px-4 py-2.5 mb-4 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-stone-50 transition-all" />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
              {sweetsOnly.map(product => {
                const qty = boxItems[product._id] || 0;
                const discountedPrice = product.discount > 0
                  ? Math.round(product.price * (1 - product.discount / 100))
                  : product.price;
                return (
                  <div key={product._id}
                    className={`rounded-xl border-2 overflow-hidden transition-all ${qty > 0 ? "border-amber-400 shadow-md" : "border-stone-100 hover:border-amber-200"}`}>
                    <div className="relative">
                      <img src={product.image[0]} alt={product.name} className="w-full h-24 object-cover" />
                      {product.discount > 0 && (
                        <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          -{product.discount}%
                        </span>
                      )}
                      {qty > 0 && (
                        <span className="absolute top-1 right-1 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {qty}
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-stone-800 truncate">{product.name}</p>
                      <p className="text-xs text-amber-700 font-bold">{currency}{discountedPrice}/kg</p>
                      <div className="flex items-center gap-1 mt-2">
                        <button onClick={() => removeItem(product._id)} disabled={!qty}
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all disabled:opacity-30">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="flex-1 text-center text-xs font-bold">{qty}</span>
                        <button onClick={() => addItem(product._id)}
                          className="w-7 h-7 rounded-lg bg-amber-100 hover:bg-amber-500 hover:text-white text-amber-700 flex items-center justify-center transition-all">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sticky top-6">
              <h2 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                Your Box
              </h2>

              {selectedItems.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  <Gift className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No sweets added yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                  {selectedItems.map(item => (
                    <div key={item._id} className="flex items-center gap-2">
                      <img src={item.image[0]} className="w-8 h-8 rounded-lg object-cover" alt={item.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-stone-800 truncate">{item.name}</p>
                        <p className="text-xs text-stone-400">×{item.qty} · {currency}{item.price * item.qty}</p>
                      </div>
                      <button onClick={() => clearItem(item._id)} className="text-stone-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-stone-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-stone-500">
                  <span>Sweets subtotal</span>
                  <span>{currency}{subtotal}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Box packaging</span>
                  <span>{currency}{boxFee}</span>
                </div>
                <div className="flex justify-between font-bold text-stone-800 text-base border-t border-stone-100 pt-2">
                  <span>Total</span>
                  <span>{currency}{grandTotal}</span>
                </div>
              </div>

              {selectedBox && totalQty < minQty && totalQty > 0 && (
                <p className="text-xs text-orange-600 mt-3 text-center">
                  Add {minQty - totalQty} more sweet{minQty - totalQty > 1 ? "s" : ""} for {selectedBox.label}
                </p>
              )}

              <button onClick={handleOrder}
                disabled={!selectedBox || totalQty < minQty}
                className="w-full mt-4 py-3.5 bg-stone-800 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Add Box to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SweetBoxBuilder;