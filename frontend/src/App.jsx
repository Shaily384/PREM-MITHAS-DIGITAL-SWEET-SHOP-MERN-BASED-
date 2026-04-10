import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import OrderTracking from "./pages/OrderTracking";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Verify from "./pages/Verify";
import Profile from "./pages/Profile";
import SweetBoxBuilder from "./pages/SweetBoxBuilder";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "./context/NotificationContext";


const App = () => {
  return (
    <NotificationProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <ScrollToTop />
        <ToastContainer />
        <Toaster position="top-right" />
        <Navbar />
        <SearchBar />
        <main className="flex-1">
          <Routes>
            <Route path="/"                   element={<Home />} />
            <Route path="/collection"         element={<Collection />} />
            <Route path="/about"              element={<About />} />
            <Route path="/contact"            element={<Contact />} />
            <Route path="/product/:productId" element={<Product />} />
            <Route path="/cart"               element={<Cart />} />
            <Route path="/login"              element={<Login />} />
            <Route path="/place-order"        element={<PlaceOrder />} />
            <Route path="/orders"             element={<Orders />} />
            <Route path="/verify"             element={<Verify />} />
            <Route path="/profile"            element={<Profile />} />
            <Route path="/sweet-box-builder"  element={<SweetBoxBuilder />} />
            <Route path="/track-order/:orderId"  element={<OrderTracking />} />


            </Routes>
        </main>
        <Footer />
      </div>
    </NotificationProvider>
  );
};

export default App;