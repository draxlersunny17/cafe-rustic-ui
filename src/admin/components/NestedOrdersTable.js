import React from "react";

export default function NestedOrdersTable({ orders }) {
    const INR = (n) => `₹${Number(n || 0).toFixed(0)}`;
    return (
      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <table className="min-w-full text-xs">
          <thead className="bg-emerald-50 text-emerald-800">
            <tr>
              <th className="px-3 py-2 text-left">Order #</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Items</th>
              <th className="px-3 py-2 text-left">Subtotal</th>
              <th className="px-3 py-2 text-left">Discount</th>
              <th className="px-3 py-2 text-left">Total</th>
              <th className="px-3 py-2 text-left">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => (
              <tr
                key={o.id}
                className={`${
                  idx % 2 === 0 ? "bg-white" : "bg-emerald-50/30"
                } border-b`}
              >
                <td className="px-3 py-2">{o.order_number}</td>
                <td className="px-3 py-2">
                  {o.date ? new Date(o.date).toLocaleString() : "—"}
                </td>
                <td className="px-3 py-2">
                  <ul className="list-disc pl-4">
                    {(o.items || []).map((it, idx) => (
                      <li key={idx}>
                        {it.name} × {it.qty}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-3 py-2">{INR(o.subtotal)}</td>
                <td className="px-3 py-2">{INR(o.discount)}</td>
                <td className="px-3 py-2 font-medium text-emerald-700">
                  {INR(o.total)}
                </td>
                <td className="px-3 py-2">{o.payment_method || "—"}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }