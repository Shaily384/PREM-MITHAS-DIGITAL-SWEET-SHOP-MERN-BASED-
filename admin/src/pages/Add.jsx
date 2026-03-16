import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { backendUrl } from "@/config";
import { Loader2, Upload, Tag, IndianRupee, Star, ImagePlus, ChevronDown } from "lucide-react";

// ─── Category / SubCategory data ─────────────────────────────────────────────
const CATEGORIES = [
  { value: "Prasad",          label: "🪔 Prasad",                desc: "Temple & pooja sweets" },
  { value: "Traditional",     label: "🍮 Traditional Mithai",    desc: "Classic Indian sweets" },
  { value: "Dry Fruit",       label: "🥜 Dry Fruit Sweets",      desc: "Rich dry fruit based" },
  { value: "Festive",         label: "🎁 Festive & Gifting",      desc: "Gift boxes & hampers" },
  { value: "Party Desserts",  label: "🎂 Party Desserts",         desc: "Occasion sweets" },
  { value: "Fusion",          label: "✨ Fusion & Artisan",       desc: "Modern Indian fusion" },
  { value: "Seasonal",        label: "🌸 Seasonal Specials",      desc: "Limited time sweets" },
];

const SUB_CATEGORIES = [
  { value: "Sugar-Free",       label: "🩺 Sugar-Free",         desc: "Diabetic friendly" },
  { value: "Dry Fruit Based",  label: "🥜 Dry Fruit Based",    desc: "Cashew, almond, pistachio" },
  { value: "With Ghee",        label: "🧈 Made with Ghee",     desc: "Pure desi ghee" },
  { value: "Without Ghee",     label: "🌿 Without Ghee",       desc: "Lighter option" },
  { value: "Milk Based",       label: "🥛 Milk Based",         desc: "Khoya, paneer, cream" },
  { value: "Besan Based",      label: "🌾 Besan Based",        desc: "Gram flour sweets" },
  { value: "Rice Based",       label: "🍚 Rice Based",         desc: "Rice flour sweets" },
  { value: "Chocolate",        label: "🍫 Chocolate Fusion",   desc: "Chocolate coated" },
];

// ─── Custom Select ────────────────────────────────────────────────────────────
const CustomSelect = ({ label, icon: Icon, value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className="w-full relative">
      <label className="block text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all duration-200 bg-white
          ${open ? "border-amber-500 ring-2 ring-amber-500/20" : "border-stone-200 hover:border-amber-400"}`}
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="w-4 h-4 text-amber-600" />}
          {selected ? (
            <div className="text-left">
              <p className="text-stone-800 font-medium">{selected.label}</p>
            </div>
          ) : (
            <span className="text-stone-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-xl z-20 overflow-hidden">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-amber-50 transition-colors
                  ${value === opt.value ? "bg-amber-50 border-l-2 border-amber-500" : ""}`}
              >
                <div>
                  <p className="text-sm font-medium text-stone-800">{opt.label}</p>
                  {opt.desc && <p className="text-xs text-stone-400 mt-0.5">{opt.desc}</p>}
                </div>
                {value === opt.value && (
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Image Upload Box ─────────────────────────────────────────────────────────
const ImageBox = ({ img, index, onChange, isFirst }) => (
  <label className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden group
    ${img ? "border-amber-400 bg-amber-50/30" : "border-stone-200 bg-stone-50 hover:border-amber-400 hover:bg-amber-50/20"}
    ${isFirst ? "h-44" : "h-32"}`}
  >
    {img ? (
      <>
        <img src={URL.createObjectURL(img)} alt="product" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <p className="text-white text-xs font-semibold">Change</p>
        </div>
      </>
    ) : (
      <div className="flex flex-col items-center gap-2 p-4 text-center">
        <div className={`rounded-xl bg-stone-100 flex items-center justify-center group-hover:bg-amber-100 transition-colors
          ${isFirst ? "w-12 h-12" : "w-8 h-8"}`}>
          <ImagePlus className={`text-stone-400 group-hover:text-amber-600 transition-colors ${isFirst ? "w-5 h-5" : "w-4 h-4"}`} />
        </div>
        {isFirst && <p className="text-xs text-stone-400 leading-relaxed">Drop image here<br />or click to upload</p>}
        {isFirst && <p className="text-[10px] text-stone-300">PNG, JPG up to 5MB</p>}
      </div>
    )}
    {isFirst && (
      <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
        MAIN
      </span>
    )}
    <input type="file" hidden accept="image/*" onChange={e => onChange(index, e.target.files[0])} />
  </label>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Add = ({ token }) => {
  const [images,      setImages]      = useState([null, null, null, null]);
  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [price,       setPrice]       = useState("");
  const [category,    setCategory]    = useState("Traditional");
  const [subCategory, setSubCategory] = useState("With Ghee");
  const [bestseller,  setBestseller]  = useState(false);
  const [loading,     setLoading]     = useState(false);

  const handleImageChange = (index, file) => {
    const updated = [...images];
    updated[index] = file;
    setImages(updated);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name",        name);
      formData.append("description", description);
      formData.append("price",       price);
      formData.append("category",    category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller",  bestseller);
      images.forEach((img, i) => img && formData.append(`image${i + 1}`, img));

      const res = await axios.post(backendUrl + "/api/product/add", formData, {
        headers: { token },
      });

      if (res.data.success) {
        toast.success("Sweet added successfully! 🍬");
        setName(""); setDescription(""); setPrice("");
        setImages([null, null, null, null]);
        setBestseller(false);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filledImages = images.filter(Boolean).length;

  return (
    <>
      {/* Full screen loader */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <Loader2 className="h-10 w-10 text-amber-600 animate-spin" />
            <p className="text-stone-700 font-semibold">Adding sweet to store...</p>
            <p className="text-stone-400 text-sm">Please wait</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <span className="text-xl">🍬</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-800">Add New Sweet</h1>
                <p className="text-sm text-stone-400">Add a new product to Prem Mithas store</p>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-6">

            {/* ── Images Card ── */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <h2 className="font-semibold text-stone-800">Product Images</h2>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full
                  ${filledImages > 0 ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-400"}`}>
                  {filledImages} / 4 uploaded
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <ImageBox img={images[0]} index={0} onChange={handleImageChange} isFirst={true} />
                {[1, 2, 3].map(i => (
                  <ImageBox key={i} img={images[i]} index={i} onChange={handleImageChange} isFirst={false} />
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-3">
                💡 First image is the main display image. Add multiple angles for better sales.
              </p>
            </div>

            {/* ── Product Details Card ── */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Tag className="w-4 h-4 text-amber-600" />
                <h2 className="font-semibold text-stone-800">Product Details</h2>
              </div>

              <div className="space-y-5">

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">
                    Sweet Name
                  </label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Kaju Katli, Motichoor Laddu, Besan Barfi..."
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800
                               placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30
                               focus:border-amber-500 bg-stone-50 focus:bg-white transition-all duration-200"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the sweet — ingredients, taste, occasion, shelf life..."
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800
                               placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30
                               focus:border-amber-500 bg-stone-50 focus:bg-white transition-all duration-200 resize-none"
                  />
                  <p className="text-xs text-stone-300 mt-1.5 text-right">{description.length} characters</p>
                </div>
              </div>
            </div>

            {/* ── Category Card ── */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-base">🗂️</span>
                <h2 className="font-semibold text-stone-800">Category</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomSelect
                  label="Category"
                  value={category}
                  onChange={setCategory}
                  options={CATEGORIES}
                  placeholder="Select category"
                />
                <CustomSelect
                  label="Sub Category"
                  value={subCategory}
                  onChange={setSubCategory}
                  options={SUB_CATEGORIES}
                  placeholder="Select sub category"
                />
              </div>

              {/* Selected display */}
              {category && subCategory && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-stone-400">Tagged as:</span>
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {CATEGORIES.find(c => c.value === category)?.label}
                  </span>
                  <span className="text-stone-300">→</span>
                  <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {SUB_CATEGORIES.find(s => s.value === subCategory)?.label}
                  </span>
                </div>
              )}
            </div>

            {/* ── Pricing & Bestseller Card ── */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <IndianRupee className="w-4 h-4 text-amber-600" />
                <h2 className="font-semibold text-stone-800">Pricing & Visibility</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">
                    Price per Kg (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="500"
                      min="1"
                      required
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800
                                 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30
                                 focus:border-amber-500 bg-stone-50 focus:bg-white transition-all duration-200"
                    />
                  </div>
                  {price && (
                    <p className="text-xs text-amber-600 mt-1.5 font-medium">
                      ₹{Number(price).toLocaleString("en-IN")} per kg
                    </p>
                  )}
                </div>

                {/* Bestseller toggle */}
                <div>
                  <label className="block text-xs font-semibold tracking-widest text-stone-400 uppercase mb-2">
                    Visibility
                  </label>
                  <button
                    type="button"
                    onClick={() => setBestseller(p => !p)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200
                      ${bestseller
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-stone-200 bg-stone-50 text-stone-500 hover:border-amber-300"}`}
                  >
                    <Star className={`w-5 h-5 transition-all ${bestseller ? "fill-amber-500 text-amber-500" : "text-stone-300"}`} />
                    <div className="text-left">
                      <p className="text-sm font-semibold">
                        {bestseller ? "Marked as Bestseller ⭐" : "Mark as Bestseller"}
                      </p>
                      <p className="text-xs opacity-60">
                        {bestseller ? "Shows on homepage" : "Feature on homepage"}
                      </p>
                    </div>
                    <div className={`ml-auto w-10 h-6 rounded-full transition-all duration-300 flex items-center px-1
                      ${bestseller ? "bg-amber-500" : "bg-stone-200"}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-300
                        ${bestseller ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-stone-800 hover:bg-amber-700 text-white font-bold text-sm
                         tracking-widest rounded-2xl transition-all duration-300 disabled:opacity-60
                         disabled:cursor-not-allowed shadow-lg shadow-stone-800/20 active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding Sweet...
                </span>
              ) : (
                "🍬 ADD SWEET TO STORE"
              )}
            </button>

          </form>
        </div>
      </div>
    </>
  );
};

export default Add;