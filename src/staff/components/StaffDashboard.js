import { fetchAllOrders, updateOrder } from "../../service/supabaseApi";
import { supabase } from "../../service/supabaseClient";
import React, { useEffect, useState } from "react";

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all orders on mount & listen for realtime changes
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
        () => {
          fetchOrders(); // refresh whenever orders change
        }
      )
      .subscribe();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  // Pause/resume order
  const handlePause = async (orderId, paused) => {
    const updated = await updateOrder(orderId, { paused: !paused });
    if (updated) {
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updated : order))
      );
    }
  };

  // Change order status
  const handleStatusChange = async (orderId, newStatus) => {
    const updated = await updateOrder(orderId, { status: newStatus });
    if (updated) {
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updated : order))
      );
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Staff Dashboard</h2>

      {loading ? (
        <div>Loading orders...</div>
      ) : (
        <div className="space-y-6">
          {orders.length === 0 && <div>No orders yet.</div>}

          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center justify-between"
            >
              {/* Order info */}
              <div>
                <div className="font-semibold">Order #{order.order_number}</div>
                <div className="text-sm text-gray-500">
                  Customer: {order.customer_name || order.user_id}
                </div>
                <div className="text-sm mt-1">
                  Status: <span className="font-mono">{order.status}</span>
                </div>
                {order.paused && (
                  <div className="text-red-500 text-xs mt-1">Paused</div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-2 mt-4 md:mt-0">
                <button
                  onClick={() => handlePause(order.id, order.paused)}
                  className={`px-4 py-2 rounded ${
                    order.paused ? "bg-green-500" : "bg-yellow-400"
                  } text-white font-semibold`}
                >
                  {order.paused ? "Resume" : "Pause"}
                </button>

                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order.id, e.target.value)
                  }
                  className="px-2 py-1 rounded border"
                >
                  <option>Order Placed</option>
                  <option>In Preparation</option>
                  <option>Ready to Serve</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
