import {
  fetchAllOrders,
  updateOrder,
  fetchUserProfile,
} from "../../service/supabaseApi";
import { supabase } from "../../service/supabaseClient";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StaffOrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("In Preparation");
  const [toast, setToast] = useState("");

  const prevOrderIdsRef = React.useRef([]);
  const isFirstFetchRef = React.useRef(true);
  const statusFlow = ["Order Placed", "In Preparation", "Completed"];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchOrders = React.useCallback(async (showLoader = false) => {
    if (showLoader) setInitialLoading(true);
    const allOrders = await fetchAllOrders();

    // Detect new orders, but skip on first fetch
    const existingIds = prevOrderIdsRef.current;
    if (!isFirstFetchRef.current) {
      const newOrders = allOrders.filter((o) => !existingIds.includes(o.id));
      newOrders.forEach((o) =>
        showToast(`New order received #${o.order_number} 🛒`)
      );
    } else {
      isFirstFetchRef.current = false;
    }
    prevOrderIdsRef.current = allOrders.map((o) => o.id);

    // Fetch user profiles
    const userIds = [...new Set(allOrders.map((order) => order.user_id))];
    const userMapTemp = {};
    await Promise.all(
      userIds.map(async (userId) => {
        if (!userId) return;
        const user = await fetchUserProfile(userId);
        if (user) userMapTemp[userId] = user;
      })
    );

    setUserMap(userMapTemp);
    setOrders(allOrders);
    if (showLoader) setInitialLoading(false);
  }, []);
  useEffect(() => {
    const subscription = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders(false)
      )
      .subscribe();

    fetchOrders(true);

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [fetchOrders]);

  const handlePause = async (orderId, paused) => {
    const updated = await updateOrder(orderId, { paused: !paused });
    if (updated) {
      showToast(updated.paused ? "Order Paused ⏸" : "Order Resumed ▶");
      fetchOrders(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const updated = await updateOrder(orderId, { status: newStatus });
    if (updated) {
      showToast(`Status updated to "${newStatus}" ✅`);
      fetchOrders(false);
    }
  };

  const filteredOrders = orders
    .filter((o) => (filterStatus === "All" ? true : o.status === filterStatus))
    .filter((o) =>
      searchTerm
        ? (userMap[o.user_id]?.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true
    );

  const getCardStyle = (status) => {
    switch (status) {
      case "Order Placed":
        return "bg-gradient-to-br from-sky-100 to-sky-200 border border-sky-300 dark:from-sky-800 dark:to-sky-900 dark:border-sky-700 text-sky-900 dark:text-sky-100";
      case "In Preparation":
        return "bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 dark:from-yellow-700 dark:to-yellow-800 dark:border-yellow-600 text-gray-900 dark:text-yellow-100";
      case "Completed":
        return "bg-gradient-to-br from-gray-900 to-black text-white shadow-lg";
      default:
        return "bg-white border border-gray-100 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-200";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Order Placed":
        return "bg-sky-200 text-sky-800 border border-sky-300 dark:bg-sky-700 dark:text-sky-100 dark:border-sky-600";
      case "In Preparation":
        return "bg-yellow-200 text-yellow-800 border border-yellow-300 dark:bg-yellow-600 dark:text-yellow-100 dark:border-yellow-500";
      case "Completed":
        return "bg-gray-700 text-gray-100 border border-gray-600";
      default:
        return "bg-gray-200 text-gray-800 border border-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500";
    }
  };

  return (
    <div className="p-6 mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          Staff Dashboard
        </h2>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <input
            type="text"
            placeholder="Search customer..."
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2">
            {["All", ...statusFlow].map((status) => (
              <button
                key={status}
                className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  filterStatus === status
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loader / Orders */}
      {initialLoading ? (
        <div className="text-center text-gray-500 animate-pulse">
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center text-gray-500 col-span-full">
          No orders found
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => {
            const customer = userMap[order.user_id];

            // Apply completed order gradient
            const cardClasses =
              order.status === "Completed"
                ? "bg-gradient-to-br from-gray-900 to-black text-white shadow-lg"
                : getCardStyle(order.status);

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${cardClasses}`}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <div
                    className={`text-xl font-bold ${
                      order.status === "Completed"
                        ? "text-white"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    Order #{order.order_number}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    {order.paused && (
                      <span className="text-red-400 text-xs font-semibold">
                        ⏸ Paused
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer */}
                <div className="flex items-center gap-3 mb-4">
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold shadow-sm
      ${
        order.status === "Completed"
          ? "bg-gray-700 text-white"
          : order.status === "In Preparation"
          ? "bg-yellow-200 text-yellow-900 dark:bg-yellow-500 dark:text-gray-900"
          : order.status === "Order Placed"
          ? "bg-sky-200 text-sky-900 dark:bg-sky-600 dark:text-white"
          : "bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
      }`}
                  >
                    {customer?.name
                      ? customer.name
                          .split(" ")
                          .map((word) => word.charAt(0).toUpperCase())
                          .slice(0, 2)
                          .join("")
                      : "?"}
                  </div>

                  {/* Name + Phone */}
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-medium tracking-wide
        ${
          order.status === "Completed"
            ? "text-gray-300"
            : order.status === "In Preparation"
            ? "text-yellow-900 dark:text-yellow-200"
            : order.status === "Order Placed"
            ? "text-sky-900 dark:text-sky-200"
            : "text-gray-800 dark:text-gray-200"
        }`}
                    >
                      {customer?.name || order.customer_name || order.user_id}
                    </span>
                    {customer?.phone && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {customer.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div
                  className={`text-sm space-y-1 mb-4 ${
                    order.status === "Completed"
                      ? "text-gray-300"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  <p>
                    <span className="font-medium">Total:</span> ₹{order.total}
                  </p>
                  {order.date && (
                    <p
                      className={`text-xs ${
                        order.status === "Completed"
                          ? "text-gray-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {new Date(order.date).toLocaleString()}
                    </p>
                  )}
                  {order.status === "In Preparation" && order.prep_time && (
                    <p>
                      <span className="font-medium">⏱ Preparation time:</span>{" "}
                      {order.prep_time} min
                    </p>
                  )}
                  {order.items_count && (
                    <p>
                      <span className="font-medium">Items:</span>{" "}
                      {order.items_count}
                    </p>
                  )}
                  {order.notes && (
                    <p>
                      <span className="font-medium">Notes:</span> {order.notes}
                    </p>
                  )}
                </div>

                {/* Controls */}
                {order.status !== "Completed" && (
                  <div className="flex gap-2 flex-wrap">
                    {order.status === "In Preparation" && (
                      <>
                        {/* Pause / Resume */}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePause(order.id, order.paused)}
                          className={`flex-1 min-w-[100px] px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                            order.paused
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : "bg-amber-400 hover:bg-amber-500 text-white"
                          }`}
                        >
                          {order.paused ? "▶ Resume" : "⏸ Pause"}
                        </motion.button>

                        {/* Prep time input (minutes) */}
                        {!order.prep_time && (
                          <>
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="number"
                                min="1"
                                placeholder="Prep (min)"
                                className="w-24 px-3 py-2 rounded-lg border text-sm shadow-sm dark:bg-gray-700 dark:text-gray-200"
                                defaultValue={order.prep_time || ""}
                                onBlur={async (e) => {
                                  const minutes = parseInt(e.target.value, 10);
                                  if (!isNaN(minutes) && minutes > 0) {
                                    const updated = await updateOrder(
                                      order.id,
                                      {
                                        prep_time: minutes,
                                      }
                                    );
                                    if (updated) {
                                      showToast(
                                        `Prep time set to ${minutes} min ⏱`
                                      );
                                      fetchOrders(false);
                                    }
                                  }
                                }}
                                disabled={order.prep_time}
                                onKeyDown={async (e) => {
                                  if (e.key === "Enter") {
                                    e.target.blur(); // trigger onBlur save
                                  }
                                }}
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {/* Status dropdown */}
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className="flex-1 min-w-[150px] px-3 py-2 rounded-lg border text-sm shadow-sm focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                    >
                      {statusFlow.map((status) => (
                        <option
                          key={status}
                          disabled={
                            statusFlow.indexOf(status) <
                            statusFlow.indexOf(order.status)
                          }
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-indigo-600 text-white px-5 py-3 rounded-lg shadow-lg z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
