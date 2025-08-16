import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiRepeat, FiChevronDown } from "react-icons/fi";
import { formatDateTime } from "../utils/common.js";

export default function OrderHistory({ orderHistory, formatINR, theme, onReorder }) {
  const isDark = theme === "dark";
  const [showModal, setShowModal] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState([]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  const toggleExpand = (orderNumber) => {
    setExpandedOrders((prev) =>
      prev.includes(orderNumber)
        ? prev.filter((num) => num !== orderNumber)
        : [...prev, orderNumber]
    );
  };

  const renderOrders = (orders) => (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto pr-2"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e0 transparent" }}
    >
      {orders.map((order) => (
        <motion.li
          key={order.order_number}
          variants={cardVariants}
          className={`p-4 rounded-lg border shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
            isDark
              ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 border-gray-700"
              : "bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-200"
          }`}
        >
          {/* Order Info */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">#{order.order_number}</span>
              <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {formatDateTime(order.date)}
              </span>
            </div>
            <div className={`text-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {order.items.map((it) => `${it.name} (x${it.qty})`).join(", ")}
            </div>
            <div className={`mt-2 font-semibold flex justify-between items-center ${isDark ? "text-amber-400" : "text-amber-500"}`}>
              {formatINR(order.total)}

              {/* Expand/Collapse Icon */}
              <button onClick={() => toggleExpand(order.order_number)} className="ml-2 focus:outline-none">
                <FiChevronDown
                  className={`transition-transform duration-300 ${
                    expandedOrders.includes(order.order_number) ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedOrders.includes(order.order_number) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scaleY: 0.8 }}
                  animate={{ opacity: 1, height: "auto", scaleY: 1 }}
                  exit={{ opacity: 0, height: 0, scaleY: 0.8 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className={`mt-3 rounded-lg p-3 border shadow-inner ${
                    isDark
                      ? "bg-gray-800/70 border-gray-700 text-gray-200"
                      : "bg-amber-50 border-amber-200 text-gray-800"
                  }`}
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Subtotal:</span>
                    <span className={isDark ? "text-gray-300" : "text-gray-600"}>{formatINR(order.subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Discount:</span>
                    <span className="text-red-500 font-semibold">-{formatINR(order.discount)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Total:</span>
                    <span className="text-amber-500 font-bold">{formatINR(order.total)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Earned Points:</span>
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="text-green-500 font-semibold"
                    >
                      +{order.earned_points}
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reorder Button */}
          <button
            onClick={() => onReorder(order)}
            className={`mt-3 w-full px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] shadow-sm ${
              isDark
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 hover:shadow-amber-500/40"
                : "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-amber-500/40"
            }`}
          >
            <FiRepeat className="text-base" />
            Reorder
          </button>
        </motion.li>
      ))}
    </motion.ul>
  );

  return (
    <section id="order-history" className={`py-16 transition-colors duration-300 ${isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold mb-8 tracking-tight text-center">Order History</h2>

        {orderHistory.length === 0 ? (
          <p className={`text-center text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            You haven’t placed any orders yet.
          </p>
        ) : (
          <>
            {renderOrders(orderHistory.slice(0, 6))}

            {orderHistory.length > 6 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowModal(true)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    isDark ? "bg-amber-500 hover:bg-amber-400 text-gray-900" : "bg-amber-500 hover:bg-amber-600 text-white"
                  }`}
                >
                  View All Orders
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`max-w-5xl w-full max-h-[80vh] overflow-y-auto rounded-xl p-6 ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">All Orders</h3>
                <button onClick={() => setShowModal(false)} className="text-xl font-bold hover:text-red-500">✕</button>
              </div>
              {renderOrders(orderHistory)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
