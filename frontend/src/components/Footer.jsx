import React from "react";
import { Link } from "react-router-dom";
import { FiPhone, FiMail, FiMapPin, FiInstagram } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-gray-50 mt-32 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 py-16 grid gap-14 sm:grid-cols-2 md:grid-cols-4 text-sm text-gray-600">

        {/* Brand */}
        <div className="md:col-span-2">
          <p className="prata-regular text-2xl text-gray-900 mb-1">
            Prem Mithas
          </p>
          <p className="text-xs tracking-[0.2em] text-amber-700 uppercase mb-4">
            Artisan Indian Sweets
          </p>
          <p className="max-w-md leading-relaxed text-gray-600">
            We craft authentic Indian sweets using pure desi ghee, real dry fruits and traditional recipes. Made fresh every day in Nagpur with love and care.
          </p>

          <div className="flex items-center gap-4 mt-6">
            <a
              href="https://www.instagram.com/"
              target=""
              rel="noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <FiInstagram className="text-lg" />
              <span className="text-sm">@premmithas</span>
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <p className="text-sm font-semibold tracking-wide text-gray-900 mb-4">
            QUICK LINKS
          </p>
          <ul className="flex flex-col gap-3">
            <li><Link to="/" className="hover:text-gray-900 transition">Home</Link></li>
            <li><Link to="/collection" className="hover:text-gray-900 transition">Our Sweets</Link></li>
            <li><Link to="/about" className="hover:text-gray-900 transition">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-gray-900 transition">Contact</Link></li>
            <li><Link to="/orders" className="hover:text-gray-900 transition">My Orders</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-sm font-semibold tracking-wide text-gray-900 mb-4">
            GET IN TOUCH
          </p>
          <ul className="flex flex-col gap-4">
            <li className="flex items-start gap-3">
              <FiPhone className="mt-1 text-amber-700" />
              <span>+91 XXXXXXXXXX</span>
            </li>
            <li className="flex items-start gap-3">
              <FiMail className="mt-1 text-amber-700" />
              <span>hello@premmithas.in</span>
            </li>
            <li className="flex items-start gap-3">
              <FiMapPin className="mt-1 text-amber-700" />
              <p className="leading-relaxed">
                Near Gandhi Chowk, Sitabuldi,<br />
                Nagpur, Maharashtra – 440012
              </p>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <p className="text-center text-xs text-gray-500 py-5 tracking-wide">
          © {new Date().getFullYear()} Prem Mithas. All rights reserved. Handcrafted with love in Nagpur.
        </p>
      </div>
    </footer>
  );
};

export default Footer;