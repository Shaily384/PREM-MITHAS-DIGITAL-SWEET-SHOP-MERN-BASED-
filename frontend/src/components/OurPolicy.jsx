import React from "react";

const OurPolicy = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700">

      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
          🍬
        </div>
        <p className="font-semibold text-gray-800">Made Fresh Daily</p>
        <p className="text-gray-400 max-w-[180px]">Every sweet is prepared fresh each morning in our kitchen</p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
          🥛
        </div>
        <p className="font-semibold text-gray-800">Pure Ingredients</p>
        <p className="text-gray-400 max-w-[180px]">Pure desi ghee, real dry fruits and no artificial colours or preservatives</p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
          📦
        </div>
        <p className="font-semibold text-gray-800">Safe Delivery</p>
        <p className="text-gray-400 max-w-[180px]">Securely packed to keep your sweets fresh right to your doorstep</p>
      </div>

    </div>
  );
};

export default OurPolicy;