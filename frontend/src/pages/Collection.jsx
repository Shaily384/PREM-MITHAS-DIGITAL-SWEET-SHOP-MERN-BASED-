import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { FiBox } from "react-icons/fi";

import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import CollectionSkeleton from "../components/CollectionSkeleton";

const ITEMS_PER_PAGE = 16;

const Collection = () => {
  const { products, productsLoading, search, showSearch } =
    useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relavent");
  const [currentPage, setCurrentPage] = useState(1);

  const loading = productsLoading;

  /* ---------------- FILTER HANDLERS ---------------- */
  const toggleCategory = (e) => {
    const value = e.target.value;
    setCategory((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value],
    );
  };

  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSubCategory((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value],
    );
  };

  /* ---------------- APPLY FILTER ---------------- */
  const applyFilter = () => {
    let copy = products.slice();

    if (showSearch && search) {
      copy = copy.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (category.length > 0) {
      copy = copy.filter((p) => category.includes(p.category));
    }

    if (subCategory.length > 0) {
      copy = copy.filter((p) => subCategory.includes(p.subCategory));
    }

    setFilterProducts(copy);
  };

  /* ---------------- SORT ---------------- */
  const sortProduct = () => {
    let copy = filterProducts.slice();

    if (sortType === "low-high") {
      copy.sort((a, b) => a.price - b.price);
    } else if (sortType === "high-low") {
      copy.sort((a, b) => b.price - a.price);
    } else {
      applyFilter();
      return;
    }

    setFilterProducts(copy);
  };

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    applyFilter();
    setCurrentPage(1);
  }, [category, subCategory, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(filterProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = filterProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const isEmpty = !loading && filterProducts.length === 0;

  return (
    <>
      <Helmet>
        <title>Sweets Collection | Prem Mithas Nagpur</title>
      </Helmet>

      <div className="px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="flex flex-col sm:flex-row gap-10 pt-10 border-t">
          
          {/* LEFT SIDE: FILTERS */}
          <div className="min-w-60">
            <p
              onClick={() => setShowFilter(!showFilter)}
              className="my-2 text-xl flex items-center cursor-pointer gap-2 font-medium"
            >
              FILTERS
              <img
                className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
                src={assets.dropdown_icon}
                alt=""
              />
            </p>

            {/* Main Categories */}
            <div className={`border border-gray-300 pl-5 py-4 mt-6 ${showFilter ? "" : "hidden"} sm:block bg-white`}>
              <p className="mb-4 text-sm font-semibold text-amber-900">SWEET CATEGORIES</p>
              <div className="flex flex-col gap-3 text-sm text-gray-700">
                <label className="flex gap-2 cursor-pointer hover:text-amber-700">
                  <input type="checkbox" value="Prasad" onChange={toggleCategory} /> Prasad & Rituals
                </label>
                <label className="flex gap-2 cursor-pointer hover:text-amber-700">
                  <input type="checkbox" value="Party Desserts" onChange={toggleCategory} /> Party Desserts
                </label>
                <label className="flex gap-2 cursor-pointer hover:text-amber-700">
                  <input type="checkbox" value="Gifting" onChange={toggleCategory} /> Gifting Collections
                </label>
                <label className="flex gap-2 cursor-pointer hover:text-amber-700">
                  <input type="checkbox" value="Fusion" onChange={toggleCategory} /> Fusion & Artisan
                </label>
              </div>
            </div>

            {/* Sub Categories (Dietary & Base) */}
            <div className={`border border-gray-300 pl-5 py-4 mt-6 ${showFilter ? "" : "hidden"} sm:block bg-white`}>
              <p className="mb-4 text-sm font-semibold text-amber-900">DIETARY & BASE</p>
              <div className="flex flex-col gap-3 text-sm text-gray-700">
                <label className="flex gap-2 cursor-pointer hover:text-amber-700">
                  <input type="checkbox" value="Sugar-Free" onChange={toggleSubCategory} /> Sugar-Free
                </label>
                <label className="flex gap-2 cursor-pointer hover:text-amber-700">
                  <input type="checkbox" value="Dry Fruit Based" onChange={toggleSubCategory} /> Dry Fruit Based
                </label>
                <label className="flex gap-2 cursor-pointer hover:text-amber-700">
                  <input type="checkbox" value="With Ghee" onChange={toggleSubCategory} /> With Pure Ghee
                </label>
                <label className="flex gap-2 cursor-pointer hover:text-amber-700">
                  <input type="checkbox" value="Without Ghee" onChange={toggleSubCategory} /> Ghee-Free
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: PRODUCTS */}
          <div className="flex-1">
            <div className="flex justify-between mb-4">
              <Title text1="OUR" text2="COLLECTIONS" />
              <select
                onChange={(e) => setSortType(e.target.value)}
                className="border-2 border-gray-300 text-sm px-2 outline-none"
              >
                <option value="relavent">Relevant</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>
            </div>

            {loading ? (
              <CollectionSkeleton count={12} />
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="w-28 h-28 flex items-center justify-center mb-6 rounded-full bg-gray-100 text-gray-400">
                  <FiBox size={48} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">No products found</h2>
                <p className="text-gray-500 max-w-md mb-6">
                  We couldn’t find any sweets matching your current selection.
                </p>
                <button
                  onClick={() => { setCategory([]); setSubCategory([]); }}
                  className="px-6 py-2 bg-amber-800 text-white text-sm hover:bg-amber-900 transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
                {paginatedProducts.map((item) => (
                  <ProductItem
                    key={item._id}
                    id={item._id}
                    name={item.name}
                    price={item.price}
                    image={item.image}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Collection;