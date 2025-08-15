import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function DetailsModal({
  item,
  onClose,
  addToCart,
  formatINR,
  theme,
  setVariantItem
}) {
  if (!item) return null;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            className={`p-6 rounded-lg max-w-3xl w-full mx-4 overflow-y-auto max-h-[90vh] ${
              theme === "dark"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-800"
            }`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={item.img}
                alt={item.name}
                className="w-full md:w-1/2 rounded-lg object-cover max-h-72"
              />
              <div>
                <h2 className="text-2xl font-bold">{item.name}</h2>
                <p
                  className={`mt-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {item.description}
                </p>
                <p className="mt-3 font-semibold">
                  Calories: {item.calories} kcal
                </p>
                <p className="mt-1 text-lg">Price: {formatINR(item.price)}</p>

                <div className="mt-4">
                  <h3 className="font-semibold">Ingredients</h3>
                  <p
                    className={`${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {item.ingredients}
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold">Preparation</h3>
                  <p
                    className={`${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {item.prep}
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold">Origin</h3>
                  <p
                    className={`${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {item.origin}
                  </p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      if (item.menu_item_variants && item.menu_item_variants.length > 0) {
                        setVariantItem(item); // opens modal
                      } else {
                        addToCart(item);
                      }
                    }}
                    className={`px-4 py-2 rounded border ${
                      theme === "dark"
                        ? "border-gray-600 hover:bg-gray-700"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
