import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, PlusCircle, List, ShoppingBag, Tag, TrendingUp } from "lucide-react";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard"  },
  { to: "/users",     icon: Users,           label: "Users"      },
  { to: "/add",       icon: PlusCircle,      label: "Add Sweet"  },
  { to: "/list",      icon: List,            label: "Products"   },
  { to: "/orders",    icon: ShoppingBag,     label: "Orders"     },
  { to: "/coupons",   icon: Tag,             label: "Coupons"    },
  { to: "/insights", icon: TrendingUp, label: "Sales Insights" },
];

const Sidebar = () => (
  <aside className="w-16 md:w-56 min-h-screen bg-white border-r border-stone-100 flex flex-col py-6 shrink-0">
    <div className="hidden md:flex items-center gap-2 px-5 mb-8">
      <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">P</div>
      <div>
        <p className="text-xs font-bold text-stone-800 leading-none">PREM MITHAS</p>
        <p className="text-[9px] text-amber-600 tracking-widest uppercase leading-none mt-0.5">Admin Panel</p>
      </div>
    </div>
    <div className="md:hidden flex justify-center mb-6">
      <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">P</div>
    </div>
    <nav className="flex flex-col gap-1 px-2">
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            ${isActive ? "bg-amber-50 text-amber-700 border border-amber-200 shadow-sm" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"}`
          }
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="hidden md:block">{label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;