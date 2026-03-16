import React from "react";
import { FiHeart, FiStar, FiPackage } from "react-icons/fi";
import Title from "../components/Title";
import { assets2 } from "../assets/assets";

const About = () => {
  return (
    <div className="bg-[#FFF8F1]">

      {/* Header */}
      <div className="pt-10 pb-12 text-center border-t border-[#e6d6c6]">
        <Title text1="ABOUT" text2="PREM MITHAS" />
        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Celebrating the sweetness of every moment with handcrafted Indian mithai made from pure ingredients and timeless recipes.
        </p>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Image */}
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl border border-[#e7cfa8] pointer-events-none" />
            <img
              src={assets2.about_us}
              alt="Prem Mithas Sweet Shop"
              className="w-full h-[520px] object-cover rounded-3xl shadow-md"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6 text-gray-700 text-sm leading-relaxed">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900">
              Prem Mithas
            </h2>
            <p className="text-xs tracking-[0.2em] text-amber-700 uppercase -mt-3">
              Artisan Indian Sweets — Nagpur
            </p>

            <p>
              Prem Mithas was born from a simple belief — that the best sweets are made slowly, carefully and with love. Founded in Nagpur, we started as a small family kitchen crafting traditional Indian mithai for local celebrations. What began as a labour of love has grown into a trusted name for authentic handcrafted sweets.
            </p>

            <p>
              Every recipe at Prem Mithas carries the soul of Indian tradition. We use only pure desi ghee, farm-fresh milk, real saffron and carefully sourced dry fruits. No shortcuts. No artificial flavours. Just honest, delicious sweets made the way they were always meant to be made.
            </p>

            {/* Promise */}
            <div className="mt-2 p-6 bg-[#FFFBF6] rounded-2xl border border-[#ead9c5]">
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Our Promise
              </h3>
              <p>
                Every box of Prem Mithas sweets that leaves our kitchen is prepared fresh that day — because we believe you deserve nothing less than the best, always.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-gradient-to-b from-[#FFF3E4] to-[#FFF8F1] py-24">
        <div className="text-center mb-16">
          <Title text1="WHY" text2="CHOOSE US" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-[#FFFBF6] p-8 rounded-3xl border border-[#ead9c5] shadow-sm hover:shadow-md transition">
            <FiHeart className="text-2xl text-amber-700 mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">Traditional Recipes</h4>
            <p className="text-gray-600 text-sm">
              Our sweets are made using recipes that have been perfected over generations in Indian kitchens — carrying the taste of real tradition.
            </p>
          </div>

          <div className="bg-[#FFFBF6] p-8 rounded-3xl border border-[#ead9c5] shadow-sm hover:shadow-md transition">
            <FiStar className="text-2xl text-amber-700 mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">100% Pure Ingredients</h4>
            <p className="text-gray-600 text-sm">
              Pure desi ghee, real dry fruits, natural colours — we never compromise on the quality of what goes into our sweets. Ever.
            </p>
          </div>

          <div className="bg-[#FFFBF6] p-8 rounded-3xl border border-[#ead9c5] shadow-sm hover:shadow-md transition">
            <FiPackage className="text-2xl text-amber-700 mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">Fresh Every Day</h4>
            <p className="text-gray-600 text-sm">
              We prepare our sweets in small batches every single day so you always get the freshest mithai possible — never stale, always perfect.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default About;