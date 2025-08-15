import React from "react";

export default function VariantSelector({ item, onSelect, onClose, theme }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div
        className={`p-6 rounded-lg shadow-lg w-80 ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-lg font-bold mb-4">
          Choose Variant for {item.name}
        </h2>
        <div className="space-y-3">
          {item.menu_item_variants?.map((variant) => (
            <button
              key={variant.name}
              onClick={() => onSelect(variant)}
              className={`block w-full py-2 px-4 rounded border text-left ${
                theme === "dark"
                  ? "border-gray-700 hover:bg-gray-800"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              {variant.name} — ₹{variant.price}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded bg-red-500 text-white hover:bg-red-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
