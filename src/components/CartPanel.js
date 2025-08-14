import React from "react";
import { toast } from 'react-toastify';

export default function CartPanel({
  open,
  onClose,
  cart,
  incQty,
  decQty,
  removeItem,
  clearCart,
  totalPrice,
  totalCalories,
  formatINR,
  onCheckout,
  theme,
  loyaltyPoints,       // ✅ new prop
  redeemPoints,        // ✅ new prop
  setRedeemPoints,     // ✅ new prop
}) {
  const discount = Math.min(redeemPoints, loyaltyPoints, totalPrice); // prevent over-discount

  const handleCheckout = () => {
    if (discount > 0) {
      toast.success(`Yaay! You have saved ${formatINR(discount)} 🎉`);
    }
    onCheckout();
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full z-50 shadow-xl border-l transition-transform duration-300 ease-in-out ${
        theme === "dark"
          ? "bg-gray-900 border-gray-700 text-white"
          : "bg-white border-gray-200 text-gray-800"
      } ${open ? "translate-x-0 w-80" : "translate-x-full w-0 overflow-hidden"}`}
    >
      {open && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className={`flex items-center justify-between p-4 border-b ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <h2 className="font-bold text-lg">Your Cart</h2>
            <button
              onClick={onClose}
              className={`${
                theme === "dark"
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ❯
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-auto p-4">
            {cart.length === 0 ? (
              <div
                className={`text-center mt-10 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No items in cart.
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((it) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <img
                      src={it.image}
                      alt={it.name}
                      className="w-16 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-semibold">{it.name}</div>
                          <div
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {it.calories} kcal
                          </div>
                        </div>
                        <div className="font-bold">
                          {formatINR(it.price * it.qty)}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          className={`px-2 py-1 rounded-md border text-sm ${
                            theme === "dark"
                              ? "border-gray-600 hover:bg-gray-700"
                              : "border-gray-300 hover:bg-gray-100"
                          }`}
                          onClick={() => decQty(it.id)}
                        >
                          -
                        </button>
                        <div
                          className={`px-3 py-1 border rounded text-sm ${
                            theme === "dark"
                              ? "border-gray-600"
                              : "border-gray-300"
                          }`}
                        >
                          {it.qty}
                        </div>
                        <button
                          className={`px-2 py-1 rounded-md border text-sm ${
                            theme === "dark"
                              ? "border-gray-600 hover:bg-gray-700"
                              : "border-gray-300 hover:bg-gray-100"
                          }`}
                          onClick={() => incQty(it.id)}
                        >
                          +
                        </button>
                        <button
                          className="ml-auto text-sm text-red-500 hover:text-red-600"
                          onClick={() => removeItem(it.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div
              className={`p-4 border-t ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              {/* Loyalty Points Section */}
              <div className="mb-3">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Available Points</span>
                  <span className="font-bold">{loyaltyPoints} pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={loyaltyPoints}
                    value={redeemPoints}
                    onChange={(e) => setRedeemPoints(Number(e.target.value))}
                    className={`w-20 px-2 py-1 border rounded ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  />
                  <span className="text-sm text-gray-500">
                    = {formatINR(discount)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Total Calories</span>
                <span className="font-bold">{totalCalories} kcal</span>
              </div>

              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="font-bold">{formatINR(totalPrice)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600 mb-1">
                  <span className="text-sm">Points Discount</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}

              <div className="flex justify-between mb-4">
                <span className="font-semibold">Final Total</span>
                <span className="font-extrabold text-xl">
                  {formatINR(totalPrice - discount)}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={clearCart}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
                  disabled={cart.length === 0}
                >
                  Clear
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold disabled:opacity-50"
                  disabled={cart.length === 0}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
