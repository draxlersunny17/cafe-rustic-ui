import React from "react";

export default function FloatingButtons({ cartCount }) {
  return (
    <>
      {/* Floating Cart */}
      <button
        onClick={() => document.getElementById("cart-panel-btn")?.click()}
        className="fixed top-1/2 right-4 -translate-y-1/2 z-50 flex flex-col items-center justify-center bg-amber-500 text-white rounded-full w-14 h-14 shadow-lg hover:bg-amber-600 transition-colors"
      >
        🛒
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {cartCount}
          </span>
        )}
      </button>
    </>
  );
}
