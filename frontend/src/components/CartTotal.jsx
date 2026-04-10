import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";

const CartTotal = ({ discountAmount = 0 }) => {
  const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);
  const subtotal = getCartAmount();
  const total    = subtotal === 0 ? 0 : Math.max(subtotal + delivery_fee - discountAmount, delivery_fee);

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className="text-xl mb-4">
        <Title text1="CART" text2="TOTALS" />
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between text-stone-600">
          <p>Subtotal</p>
          <p>{currency} {subtotal.toLocaleString("en-IN")}</p>
        </div>
        <hr className="border-stone-100" />

        <div className="flex justify-between text-stone-600">
          <p>Delivery Fee</p>
          <p>{currency} {delivery_fee}</p>
        </div>

        {discountAmount > 0 && (
          <>
            <hr className="border-stone-100" />
            <div className="flex justify-between text-green-600 font-semibold">
              <p>🎉 Coupon Discount</p>
              <p>− {currency} {discountAmount.toLocaleString("en-IN")}</p>
            </div>
          </>
        )}

        <hr className="border-stone-100" />
        <div className="flex justify-between font-bold text-stone-900 text-base">
          <p>Total</p>
          <p>{currency} {total.toLocaleString("en-IN")}</p>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;