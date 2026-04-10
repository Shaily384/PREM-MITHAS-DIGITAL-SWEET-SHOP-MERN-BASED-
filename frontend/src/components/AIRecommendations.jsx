import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import Title from "./Title";

const AIRecommendations = ({ mode = "popular", category = "", currentProductId = "" }) => {
  const { products, cartItems } = useContext(ShopContext);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    if (!products.length) return;

    let pool = [...products];

    if (mode === "product" && category) {
      pool = pool.filter(
        (p) => p.category === category && p._id !== currentProductId
      );
    } else if (mode === "cart") {
      const inCartIds = new Set(Object.keys(cartItems));
      pool = pool.filter((p) => !inCartIds.has(p._id));

      const cartCategories = new Set(
        Object.keys(cartItems)
          .map((id) => products.find((p) => p._id === id)?.category)
          .filter(Boolean)
      );

      const sameCategory = pool.filter((p) => cartCategories.has(p.category));
      pool = sameCategory.length >= 4 ? sameCategory : pool;
    }

    const scored = pool
      .map((p) => ({
        ...p,
        _score: (p.bestseller ? 2 : 0) + Math.random(),
      }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 4);

    setRecommended(scored);
  }, [products, cartItems, mode, category, currentProductId]);

  if (!recommended.length) return null;

  const titleMap = {
    product: { t1: "YOU MAY", t2: "ALSO LIKE" },
    cart:    { t1: "PEOPLE ALSO", t2: "BOUGHT" },
    popular: { t1: "AI", t2: "PICKS FOR YOU" },
  };

  const { t1, t2 } = titleMap[mode] || titleMap.popular;

  return (
    <div className="my-10">
      <div className="flex items-center gap-3 mb-1">
        <div className="text-2xl">
          <Title text1={t1} text2={t2} />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full">
          AI
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-5">
        Personalised based on your browsing &amp; order history
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6">
        {recommended.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            name={item.name}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations;