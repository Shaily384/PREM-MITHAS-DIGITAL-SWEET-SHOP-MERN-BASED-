import React, { useEffect, useState } from "react";
import { FiStar, FiUser, FiMessageSquare } from "react-icons/fi";

const testimonials = [
  {
    name: "Anjali Deshmukh",
    role: "Regular Customer · Nagpur",
    review:
      "The Motichoor Laddus here are the best I've had in years. You can really taste the purity of the desi ghee.",
  },
  {
    name: "Sanjay Rao",
    role: "Corporate Client · Nagpur",
    review:
      "We ordered bulk gift boxes for Diwali. The packaging was elegant, and every guest raved about the freshness of the Kaju Katli.",
  },
  {
    name: "Meera Patel",
    role: "Home Maker · Nagpur",
    review:
      "Prem Mithas has become our go-to for every festival. Their commitment to using no artificial flavors makes them stand out.",
  }
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-gray-50 py-5">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-semibold text-gray-900">
            Trusted by Our Clients
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Trusted across Maharashtra
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border shadow-sm p-8 hover:shadow-md transition"
            >
              {/* Quote + Stars */}
               <div className="flex items-center justify-between mb-4">
                <FiMessageSquare className="text-gray-300 text-2xl" />
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="text-yellow-400 text-sm" />
                  ))}
                </div>
              </div> 

              {/* Review */}
              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                “{item.review}”
              </p>

              {/* User */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                  <FiUser className="text-lg" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
