import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Shell({ children }) {
    const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const nav = [
  { to: "/admin/dashboard/overview", label: "Overview" },
  { to: "/admin/dashboard/users", label: "Users" },
  { to: "/admin/dashboard/menu", label: "Menu" },
  { to: "/admin/dashboard/special-offers", label: "Offers" },
  ];

  return (
    <div className="min-h-screen relative text-gray-900 overflow-hidden">
      {/* Background base */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />

      {/* Animated glowing blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-400 opacity-30 blur-3xl animate-blob" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-400 opacity-30 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full bg-pink-400 opacity-20 blur-3xl animate-blob animation-delay-4000" />

      {/* Content wrapper so children sit above background */}
      <div className="relative z-10">
      {/* 🔥 Top Navbar */}
      <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur text-white shadow">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="text-2xl font-bold tracking-wide flex gap-4">
            <img
              src="/images/cafelogo.png"
              alt="Logo"
              className="w-8 h-8 object-cover"
            />
            Café Rustic — Admin
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === n.to
                    ? "bg-emerald-500 text-white shadow"
                    : "hover:bg-gray-700 hover:text-white text-gray-300"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-700 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-700">
            <nav className="flex flex-col p-4 space-y-2">
              {nav.map((n) => (
               <Link
               key={n.to}
               to={n.to}
               className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                 location.pathname === n.to
                   ? "bg-emerald-600/20 text-emerald-400 border-l-4 border-emerald-500" 
                   : "text-gray-300 hover:bg-gray-700 hover:text-white"
               }`}
               onClick={() => setMenuOpen(false)}
             >
               {n.label}
             </Link>
             
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="mx-auto max-w-7xl p-6 lg:p-10">{children}</main>
    </div>
    </div>
  );
}