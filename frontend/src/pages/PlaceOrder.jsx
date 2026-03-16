import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", street: "", city: "", state: "", zipcode: "", country: "", phone: ""
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    
    // Logic: Only allow 10 digits in the phone field
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((data) => ({ ...data, [name]: numericValue }));
    } else {
      setFormData((data) => ({ ...data, [name]: value }));
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    // Basic validation check for phone length
    if (formData.phone.length !== 10) {
      return toast.error("Please enter a valid 10-digit phone number");
    }

    try {
      const orderItems = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find((product) => product._id === items));
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              itemInfo.productId = itemInfo._id; 
              orderItems.push(itemInfo);
            }
          }
        }
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        paymentMethod: method.toUpperCase()
      };

      const response = await axios.post(backendUrl + "/api/order/place", orderData, { headers: { token } });

      if (response.data.success) {
        setCartItems({});
        navigate("/orders");
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="px-6 sm:px-10 md:px-16 lg:px-20 border-t pt-10 bg-gray-50/20">
      <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-12 pt-5 sm:pt-14 min-h-[80vh]">
        
        {/* --- LEFT SIDE: DELIVERY INFORMATION --- */}
        <div className="flex flex-col gap-5 w-full sm:max-w-[480px]">
          <div className="text-xl sm:text-2xl mb-2">
            <Title text1="DELIVERY" text2="INFORMATION" />
          </div>

          <div className="flex gap-3">
            <input required name="firstName" value={formData.firstName} onChange={onChangeHandler} 
              className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all" 
              placeholder="First name" />
            <input required name="lastName" value={formData.lastName} onChange={onChangeHandler} 
              className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all" 
              placeholder="Last name" />
          </div>

          <input required type="email" name="email" value={formData.email} onChange={onChangeHandler} 
            className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all" 
            placeholder="Email address" />

          <input required name="street" value={formData.street} onChange={onChangeHandler} 
            className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all" 
            placeholder="Street Address" />

          {/* Location Grid */}
          <div className="grid grid-cols-2 gap-3">
            <input required name="city" value={formData.city} onChange={onChangeHandler} 
              className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all" 
              placeholder="City" />
            <input required name="state" value={formData.state} onChange={onChangeHandler} 
              className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all" 
              placeholder="State" />
            <input required name="zipcode" type="number" value={formData.zipcode} onChange={onChangeHandler} 
              className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all" 
              placeholder="Zipcode" />
            <input required name="country" value={formData.country} onChange={onChangeHandler} 
              className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all" 
              placeholder="Country" />
          </div>

          <div className="relative">
            <input required type="tel" name="phone" value={formData.phone} onChange={onChangeHandler} 
              className="border border-gray-300 rounded-lg py-2.5 px-4 w-full focus:ring-1 focus:ring-black outline-none transition-all" 
              placeholder="Phone (10 digits)" />
            {formData.phone && formData.phone.length !== 10 && (
               <span className="text-[10px] text-red-500 absolute -bottom-4 left-1">Must be 10 digits</span>
            )}
          </div>
        </div>

        {/* --- RIGHT SIDE: SUMMARY & PAYMENT --- */}
        <div className="flex-1 sm:max-w-[500px]">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <CartTotal />
            
            <div className="mt-12">
              <Title text1="PAYMENT" text2="METHOD" />
              
              <div className="grid grid-cols-1 gap-3 mt-6">
                {[
                  { id: "stripe", label: "Debit / Credit Card", icon: "💳" },
                  { id: "upi_id", label: "UPI / Google Pay", icon: "📱" },
                  { id: "cod", label: "Cash on Delivery", icon: "💵" },
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`group flex items-center justify-between gap-4 border-2 p-4 cursor-pointer rounded-lg transition-all duration-200 ${
                      method === m.id ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${method === m.id ? 'border-black' : 'border-gray-300'}`}>
                        {method === m.id && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                      </div>
                      <span className={`text-sm font-semibold ${method === m.id ? 'text-black' : 'text-gray-500'}`}>{m.label}</span>
                    </div>
                    <span className="text-xl opacity-80 group-hover:scale-110 transition-transform">{m.icon}</span>
                  </div>
                ))}
              </div>

              <div className="w-full mt-10">
                <button type="submit" className="w-full bg-black text-white px-8 py-4 text-sm font-bold rounded-lg hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]">
                  PLACE ORDER NOW
                </button>
                <p className="text-center text-[11px] text-gray-400 mt-4 uppercase tracking-widest">
                  🔒 Secure SSL Encrypted Checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;