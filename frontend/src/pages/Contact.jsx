import React from "react";
import { FiPhone, FiMail, FiInstagram, FiMapPin } from "react-icons/fi";
import Title from "../components/Title";
// Notice the curly braces { } - these must match the 'export const' in your SweetAnimes file
import { MotichoorAnime, GulabJamunAnime } from "../components/SweetAnimes";
import { assets2 } from "../assets/assets";

const Contact = () => {
  return (
    <div className="bg-[#FFF8F1]">
      {/* Header with Sweets Duo Animations */}
      <div className="pt-14 pb-12 flex flex-col items-center border-t border-[#ead9c5]">
        <div className="flex items-center justify-center gap-4 sm:gap-10">
          
          {/* Motichoor Anime (Left Side) */}
          <div className="hidden sm:block w-16 h-16 md:w-24 md:h-24">
            <MotichoorAnime />
          </div>

          <Title text1="CONTACT" text2="US" />

          {/* Gulab Jamun Anime (Right Side) */}
          <div className="w-16 h-16 md:w-24 md:h-24">
            <GulabJamunAnime />
          </div>
          
        </div>
        <p className="mt-4 text-sm sm:text-base text-gray-600 text-center">
          We'd love to hear from you — orders, enquiries or just a sweet hello!
        </p>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-10 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* Visual Image Section */}
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl border border-[#e7cfa8] pointer-events-none" />
            <img
              src={assets2.contact_us}
              alt="Prem Mithas Sweet Shop Nagpur"
              className="rounded-3xl shadow-md w-full object-cover"
            />
          </div>

          {/* Contact Details Card */}
          <div className="bg-[#FFFBF6] rounded-3xl border border-[#ead9c5] shadow-sm p-10 flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Prem Mithas</h2>
              <p className="text-xs tracking-[0.2em] text-amber-700 uppercase mt-1">
                Artisan Indian Sweets — Nagpur
              </p>
            </div>

            {/* Address Details */}
            <div className="flex gap-4">
              <FiMapPin className="text-xl text-amber-700 mt-1 shrink-0" />
              <div className="text-gray-700 text-sm leading-relaxed">
                <p className="font-medium text-gray-900">Nagpur, Maharashtra</p>
                <p className="mt-1">
                  Near Gandhi Chowk, Sitabuldi,<br />
                  Nagpur, Maharashtra – 440012
                </p>
              </div>
            </div>

            {/* Phone & Email - Using your updated contact info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 text-gray-700">
                <FiPhone className="text-amber-700 shrink-0" />
                <a href="tel:+918767750850" className="font-medium hover:text-amber-700 transition-colors">
                  +91 8767750850
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <FiMail className="text-amber-700 shrink-0" />
                <a href="mailto:shailyrinait03@gmail.com" className="font-medium hover:text-amber-700 transition-colors">
                  shailyrinait03@gmail.com
                </a>
              </div>
            </div>

            {/* Instagram - Using your handle */}
            <div className="flex items-center gap-3 text-gray-700">
              <FiInstagram className="text-amber-700" />
              <a
                href="https://www.instagram.com/s_rinait384"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-gray-900 hover:underline hover:text-amber-700 transition-colors"
              >
                @s_rinait384
              </a>
            </div>

            {/* Bulk Order Section */}
            <div className="border-t border-[#ead9c5] pt-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                🎁 Bulk & Festive Orders
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Planning a wedding, corporate event or festive gifting? We offer bulk sweet boxes, custom packaging and special pricing for large orders.
              </p>
            </div>

            <button className="w-fit px-8 py-3 border border-amber-700 text-sm font-medium text-amber-700 hover:bg-amber-700 hover:text-white transition-all duration-300">
              Enquire for Bulk Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;