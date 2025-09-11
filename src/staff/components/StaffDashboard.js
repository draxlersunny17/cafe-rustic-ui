import { fetchAllOrders, updateOrder } from "../../service/supabaseApi";
import { supabase } from "../../service/supabaseClient";
import React, { useEffect, useState } from "react";

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription;

    const fetchOrders = async () => {
      setLoading(true);
      const allOrders = await fetchAllOrders();
      setOrders(allOrders);
      setLoading(false);
    };

    fetchOrders();

    subscription = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  const handlePause = async (orderId, paused) => {
    const updated = await updateOrder(orderId, { paused: !paused });
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const updated = await updateOrder(orderId, { status: newStatus });
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    }
  };

  const getCardStyle = (status) => {
    switch (status) {
      case "Order Placed":
        return "bg-blue-50 border border-blue-100";
      case "In Preparation":
        return "bg-amber-50 border border-amber-100";
      case "Completed":
        return "bg-gray-100 border border-gray-200";
      default:
        return "bg-white border border-gray-100";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Order Placed":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "In Preparation":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "Completed":
        return "bg-gray-200 text-gray-600 border border-gray-300";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const statusFlow = ["Order Placed", "In Preparation", "Completed"];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-8 text-gray-800">
        Staff Dashboard
      </h2>

      {loading ? (
        <div className="text-gray-500">Loading orders...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {orders.length === 0 && (
            <div className="text-gray-500 text-center col-span-2">
              No orders yet.
            </div>
          )}

          {orders.map((order) => (
            <div
              key={order.id}
              className={`rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col justify-between ${getCardStyle(
                order.status
              )}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="font-bold text-lg text-gray-900">
                  Order #{order.order_number}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              {/* Details */}
              <div className="mt-3 text-sm text-gray-700 space-y-1">
                <div>
                  <span className="font-medium">Customer:</span>{" "}
                  {order.customer_name || order.user_id}
                </div>
                <div>
                  <span className="font-medium">Total:</span> ₹{order.total}
                </div>
                {order.paused && order.status !== "Completed" && (
                  <div className="text-red-500 font-semibold text-xs">
                    ⏸ Paused
                  </div>
                )}
              </div>

              {/* Controls */}
              {order.status !== "Completed" && (
                <div className="mt-5 flex gap-3 flex-wrap">
                  {/* Pause button only visible if order is in In Preparation */}
                  {order.status === "In Preparation" && (
                    <button
                      onClick={() => handlePause(order.id, order.paused)}
                      className={`flex-1 min-w-[100px] px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm ${
                        order.paused
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-amber-400 hover:bg-amber-500 text-white"
                      }`}
                    >
                      {order.paused ? "▶ Resume" : "⏸ Pause"}
                    </button>
                  )}

                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className="flex-1 min-w-[150px] px-3 py-2 rounded-lg border text-sm shadow-sm focus:ring-2 focus:ring-indigo-400"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
