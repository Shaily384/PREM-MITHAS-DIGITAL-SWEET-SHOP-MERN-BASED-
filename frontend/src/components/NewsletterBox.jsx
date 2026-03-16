import React from "react";

const NewsletterBox = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
  };

  return (
    <div className="text-center py-4">
      <p className="text-2xl font-medium text-gray-800">
        Get Sweet Deals in Your Inbox
      </p>
      <p className="text-gray-400 mt-3 max-w-md mx-auto">
        Subscribe and be the first to know about festive offers, new arrivals and exclusive discounts from Prem Mithas.
      </p>
      <form
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border border-gray-300 pl-3"
      >
        <input
          className="w-full sm:flex-1 outline-none text-sm py-1"
          type="email"
          placeholder="Enter your email address"
          required
        />
        <button
          type="submit"
          className="bg-black text-white text-xs px-10 py-4 hover:bg-amber-700 transition duration-300"
        >
          SUBSCRIBE
        </button>
      </form>
    </div>
  );
};

export default NewsletterBox;