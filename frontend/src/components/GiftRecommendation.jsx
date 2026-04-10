import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";

const OCCASIONS = [
  { id:"diwali",    label:"Diwali",       emoji:"🪔", categories:["Dry Fruit","Festive","Gifting"],    keywords:["kaju","dry fruit","barfi","laddu"]  },
  { id:"wedding",   label:"Wedding",      emoji:"💍", categories:["Gifting","Festive","Traditional"],  keywords:["motichoor","laddu","barfi","peda"]  },
  { id:"birthday",  label:"Birthday",     emoji:"🎂", categories:["Party Desserts","Fusion"],          keywords:["chocolate","fusion","cake"]         },
  { id:"eid",       label:"Eid",          emoji:"🌙", categories:["Traditional","Prasad"],             keywords:["sewai","sheer","halwa","kheer"]     },
  { id:"holi",      label:"Holi",         emoji:"🎨", categories:["Traditional","Fusion"],             keywords:["gujiya","malpua","thandai"]         },
  { id:"corporate", label:"Corporate",    emoji:"💼", categories:["Gifting","Dry Fruit"],              keywords:["dry fruit","premium","assorted"]    },
  { id:"anniversary",label:"Anniversary",emoji:"💕", categories:["Fusion","Gifting"],                 keywords:["chocolate","special","premium"]     },
  { id:"prasad",    label:"Puja / Prasad",emoji:"🪔", categories:["Prasad","Traditional"],             keywords:["laddu","peda","modak","coconut"]    },
];

const GiftRecommendation = () => {
  const { products, currency } = useContext(ShopContext);
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const recommendations = selected
    ? products
        .filter(p =>
          OCCASIONS.find(o => o.id === selected)?.categories.includes(p.category) ||
          OCCASIONS.find(o => o.id === selected)?.keywords.some(kw => p.name.toLowerCase().includes(kw))
        )
        .slice(0, 6)
    : [];

  // Fallback to bestsellers if no category match
  const finalRecs = recommendations.length > 0
    ? recommendations
    : products.filter(p => p.bestseller).slice(0, 6);

  const occasion = OCCASIONS.find(o => o.id === selected);

  return (
    <div className="my-16 px-4 sm:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-stone-800">🎁 Gift Recommendations</h2>
        <p className="text-stone-500 mt-2">Tell us the occasion — we'll suggest the perfect sweets</p>
      </div>

      {/* Occasion Pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {OCCASIONS.map(occ => (
          <button key={occ.id} onClick={() => setSelected(occ.id === selected ? null : occ.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-200
              ${selected === occ.id
                ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30"
                : "bg-white text-stone-700 border-stone-200 hover:border-amber-400 hover:text-amber-700"}`}>
            <span>{occ.emoji}</span> {occ.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {selected && (
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <p className="font-semibold text-stone-700">
              {occasion?.emoji} Perfect for {occasion?.label}
              {finalRecs.length > 0 && <span className="text-stone-400 font-normal ml-2">({finalRecs.length} suggestions)</span>}
            </p>
            <button onClick={() => navigate("/collection")} className="text-sm text-amber-700 hover:underline font-semibold">
              View all →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {finalRecs.map(product => {
              const discountedPrice = product.discount > 0
                ? Math.round(product.price * (1 - product.discount / 100))
                : product.price;
              return (
                <div key={product._id} onClick={() => navigate(`/product/${product._id}`)}
                  className="cursor-pointer group">
                  <div className="relative overflow-hidden rounded-xl bg-stone-100">
                    {product.discount > 0 && (
                      <span className="absolute top-1 left-1 z-10 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        -{product.discount}%
                      </span>
                    )}
                    <img src={product.image[0]} alt={product.name}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <p className="text-xs font-semibold text-stone-800 mt-2 truncate">{product.name}</p>
                  <p className="text-xs font-bold text-amber-700">{currency}{discountedPrice}</p>
                </div>
              );
            })}
          </div>

          {/* Combo suggestion */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="text-3xl">🎀</div>
            <div className="flex-1">
              <p className="font-semibold text-amber-800">Create a Custom Gift Box!</p>
              <p className="text-sm text-amber-700">Mix these sweets into a beautiful gift box for {occasion?.label}</p>
            </div>
            <button onClick={() => navigate("/sweet-box-builder")}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-all whitespace-nowrap">
              Build Box 🎁
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftRecommendation;