import React from "react";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart, FaDownload } from "react-icons/fa";

export default function MenuSection({
  id = "menu",
  categories,
  theme,
  category,
  setCategory,
  query,
  setQuery,
  items,
  favorites,
  toggleFavorite,
  addToCart,
  setSelectedItem,
  handleDownloadPDF,
}) {
  return (
    <section id={id} className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  category === cat
                    ? cat === "Favorites"
                      ? "bg-red-400 text-white"
                      : "bg-amber-300 text-gray-900"
                    : cat === "Favorites"
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : theme === "dark"
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {cat === "Favorites" ? "❤️ Favorites" : cat}
              </button>
            ))}
          </div>

          {/* Search + Download */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items..."
              className={`w-full md:w-80 px-4 py-2 rounded-lg outline-none border ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            />
            <button
              onClick={handleDownloadPDF}
              className="group flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              <FaDownload className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />
              <span className="hidden md:inline">Download Menu</span>
            </button>
          </div>
        </div>

        {/* Grid */}
        {items.length === 0 ? (
          <p className="text-gray-500">No items found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                className={`rounded-xl overflow-hidden border ${
                  theme === "dark"
                    ? "border-gray-800 bg-gray-900"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="relative">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-44 object-cover"
                  />
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="absolute top-2 right-2 text-xl"
                    aria-label="toggle favorite"
                    title="Add to favorites"
                  >
                    {favorites.includes(item.id) ? (
                      <FaHeart className="text-red-500 drop-shadow" />
                    ) : (
                      <FaRegHeart className="text-white drop-shadow" />
                    )}
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <span className="font-bold">₹{item.price}</span>
                  </div>
                  {item.shortDesc && (
                    <p className="text-sm text-gray-500 mt-1">
                      {item.shortDesc}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => addToCart(item, 1)}
                      className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === "dark" ? "border-gray-700" : "border-gray-300"
                      }`}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
