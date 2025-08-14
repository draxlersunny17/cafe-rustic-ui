import React from "react";
import { FaSun, FaMoon } from "react-icons/fa";

export default function Navbar({ theme, toggleTheme, setMenuOpen, menuOpen }) {
  return (
    <nav
      className={`${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      } fixed w-full z-30 bg-opacity-60 backdrop-blur-md`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/images/cafelogo.png"
            alt="Logo"
            className="w-8 h-8 object-cover"
          />
          <div className="text-lg font-semibold">Café Rustic</div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {["Home", "About", "Menu", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="hover:underline"
            >
              {item}
            </a>
          ))}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div
          className="md:hidden cursor-pointer text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </div>
      </div>
    </nav>
  );
}
