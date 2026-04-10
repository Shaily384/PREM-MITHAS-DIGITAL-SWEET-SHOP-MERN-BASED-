import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/Users";
import Coupons from "./pages/Coupons";
import SalesInsights from "./pages/SalesInsights";
import { backendUrl } from "./config";

const App = () => {
  const [token, setToken] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="flex-1 mx-auto px-6 my-8 text-gray-600 text-base max-w-6xl">
              <Routes>
                <Route path="/dashboard" element={<Dashboard token={token} />} />
                <Route path="/add"       element={<Add token={token} />} />
                <Route path="/list"      element={<List token={token} />} />
                <Route path="/orders"    element={<Orders token={token} />} />
                <Route path="/users"     element={<UsersPage token={token} />} />
                <Route path="/coupons"   element={<Coupons token={token} />} />
                <Route path="/insights" element={<SalesInsights token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;