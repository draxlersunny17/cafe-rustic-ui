import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiRepeat, FiChevronDown } from "react-icons/fi";
import QRCode from "qrcode";
import { formatDateTime } from "../utils/common.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function OrderHistory({
  orderHistory,
  formatINR,
  theme,
  onReorder,
}) {
  const isDark = theme === "dark";
  const [showModal, setShowModal] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const openReceipt = (order) => {
    setSelectedOrder(order);
    setShowReceipt(true);
  };

  const generateReceiptPDF = async () => {
    const doc = new jsPDF();

    // ===== Logo =====
    const logo = "/images/cafelogo.png";

    // (x=15, y=5, width=25, height=25)
    doc.addImage(logo, "PNG", 15, 5, 25, 25);

    // ===== Header =====
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Café Rustic", 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("123 Street, City • +91-9876543210", 105, 22, { align: "center" });
    doc.text("Thank you for dining with us!", 105, 28, { align: "center" });

    // Divider
    doc.line(10, 32, 200, 32);

    // ===== Order Info =====
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 40);
    doc.text(
      `Payment Type: ${selectedOrder.payment_method.toUpperCase()}`,
      14,
      47
    );

    // ===== Table =====
    const tableData = selectedOrder.items.map((item) => [
      item.name,
      item.qty,
      `Rs.${item.price.toFixed(2)}`,
      `Rs.${(item.price * item.qty).toFixed(2)}`,
    ]);

    autoTable(doc, {
      head: [["Item", "Qty", "Price", "Total"]],
      body: tableData,
      startY: 55,
      theme: "striped",
      styles: { fontSize: 11 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    // ===== Totals Section =====
    let y = doc.lastAutoTable.finalY + 10;

    doc.setDrawColor(180); // gray
    doc.setLineWidth(0.3);
    doc.line(10, y - 5, 200, y - 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(`SGST (2.5%): `, 150, y);
    doc.text(`Rs. ${selectedOrder.sgst.toFixed(2)}`, 190, y, {
      align: "right",
    });

    doc.text(`CGST (2.5%): `, 150, y + 8);
    doc.text(`Rs. ${selectedOrder.cgst.toFixed(2)}`, 190, y + 8, {
      align: "right",
    });

    if (selectedOrder.discount > 0) {
      doc.text(`Discount: `, 150, y + 16);
      doc.text(`Rs. ${selectedOrder.discount.toFixed(2)}`, 190, y + 16, {
        align: "right",
      });
    }

    if (selectedOrder.tip > 0) {
      doc.text(`Tip: `, 150, y + 24);
      doc.text(`Rs. ${selectedOrder.tip.toFixed(2)}`, 190, y + 24, {
        align: "right",
      });
    }
    // ===== Grand Total =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Total:`, 150, y + 40);
    doc.text(`Rs. ${selectedOrder.total.toFixed(2)}`, 190, y + 40, {
      align: "right",
    });

    // ===== QR Code (bottom left) =====
    const qrData = `https://cafe-rustic-ui.vercel.app/`;
    const qrImage = await QRCode.toDataURL(qrData);

    doc.addImage(qrImage, "PNG", 14, y + 50, 40, 40); // position + size

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("Scan QR to give feedback", 14, y + 95);

    // ===== Footer =====
    let footerY = y + 55;

    // Divider line above footer
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(10, footerY - 10, 200, footerY - 10);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.text("We hope to see you again soon!", 105, y + 60, {
      align: "center",
    });

    // ===== Watermark on Every Page =====
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(40);
      doc.setTextColor(150); // gray

      // Transparency
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.1 }));

      // Diagonal watermark
      doc.text("Powered by Café Rustic", 35, 150, { angle: 45 });

      doc.restoreGraphicsState();
    }

    // Auto-download
    doc.save(`Receipt_${Date.now()}.pdf`);
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
              <span
                className={`text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {formatDateTime(order.date)}
              </span>
            </div>
            <div
              className={`text-xs ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {order.items.map((it) => `${it.name} (x${it.qty})`).join(", ")}
            </div>
            <div
              className={`mt-2 font-semibold flex justify-between items-center ${
                isDark ? "text-amber-400" : "text-amber-500"
              }`}
            >
              {formatINR(order.total)}

              {/* Expand/Collapse Icon */}
              <button
                onClick={() => toggleExpand(order.order_number)}
                className="ml-2 focus:outline-none"
              >
                <FiChevronDown
                  className={`transition-transform duration-300 ${
                    expandedOrders.includes(order.order_number)
                      ? "rotate-180"
                      : ""
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
                    <span
                      className={isDark ? "text-gray-300" : "text-gray-600"}
                    >
                      {formatINR(order.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Discount:</span>
                    <span className="text-red-500 font-semibold">
                      -{formatINR(order.discount)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-medium">CGST:</span>
                    <span
                      className={isDark ? "text-gray-300" : "text-gray-600"}
                    >
                      {formatINR(order.cgst)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-medium">SGST:</span>
                    <span
                      className={isDark ? "text-gray-300" : "text-gray-600"}
                    >
                      {formatINR(order.sgst)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Total:</span>
                    <span className="text-amber-500 font-bold">
                      {formatINR(order.total)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Earned Points:</span>
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="text-green-500 font-semibold"
                    >
                      +{order.earned_points}
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onReorder(order)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] shadow-sm ${
                isDark
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 hover:shadow-amber-500/40"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-amber-500/40"
              }`}
            >
              <FiRepeat className="text-base" />
              Reorder
            </button>

            <button
              onClick={() => openReceipt(order)}
              className={`w-1/3 px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] shadow-sm ${
                isDark
                  ? "bg-gradient-to-r from-teal-400 to-teal-500 text-gray-900 hover:shadow-teal-500/40"
                  : "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-teal-500/40"
              }`}
            >
              Receipt
            </button>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  );

  return (
    <section
      id="order-history"
      className={`py-16 transition-colors duration-300 ${
        isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold mb-8 tracking-tight text-center">
          Order History
        </h2>

        {orderHistory.length === 0 ? (
          <p
            className={`text-center text-lg ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
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
                    isDark
                      ? "bg-amber-500 hover:bg-amber-400 text-gray-900"
                      : "bg-amber-500 hover:bg-amber-600 text-white"
                  }`}
                >
                  View All Orders
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal: All Orders */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`max-w-5xl w-full max-h-[80vh] overflow-y-auto rounded-xl p-6 ${
                isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">All Orders</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-xl font-bold hover:text-red-500"
                >
                  ✕
                </button>
              </div>
              {renderOrders(orderHistory)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Receipt Preview */}
      <AnimatePresence>
        {showReceipt && selectedOrder && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60] p-4">
            <div
              className={`rounded-2xl shadow-2xl w-[420px] max-h-[85vh] flex flex-col border ${
                isDark
                  ? "bg-gradient-to-b from-gray-900 via-gray-950 to-black border-gray-700"
                  : "bg-gradient-to-b from-white via-gray-50 to-gray-100 border-gray-200"
              }`}
            >
              {/* --- Header --- */}
              <div className="text-center p-6 flex-shrink-0">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <img
                    src="/images/cafelogo.png"
                    alt="Café Rustic"
                    className="h-10 w-10 object-contain"
                  />
                  <h2 className="text-xl font-extrabold tracking-wide">
                    Café Rustic
                  </h2>
                </div>
                <h3 className="text-lg font-semibold text-amber-500">
                  Receipt — #{selectedOrder.order_number}
                </h3>
                <p
                  className={`text-xs mt-1 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {formatDateTime(selectedOrder.date)}
                </p>
                <div className="border-t border-dashed mt-4"></div>
              </div>

              {/* --- Scrollable Body --- */}
              <div className="overflow-y-auto px-6 py-2 flex-1 space-y-3 text-sm">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    <span>{formatINR(item.price * item.qty)}</span>
                  </div>
                ))}

                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount</span>
                    <span>-{formatINR(selectedOrder.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>CGST</span>
                  <span>{formatINR(selectedOrder.cgst || 0)}</span>
                </div>

                <div className="flex justify-between">
                  <span>SGST</span>
                  <span>{formatINR(selectedOrder.sgst || 0)}</span>
                </div>

                <div className="border-t border-dashed my-2"></div>

                <div className="flex justify-between text-lg font-bold text-amber-500">
                  <span>Total</span>
                  <span>{formatINR(selectedOrder.total)}</span>
                </div>

               
              </div>

              {/* --- Footer --- */}
              <div className="flex justify-end gap-3 p-6 flex-shrink-0">
                <button
                  onClick={() => setShowReceipt(false)}
                  className={`px-4 py-2 rounded-xl transition ${
                    theme === "dark"
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={generateReceiptPDF}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md hover:shadow-amber-500/40 transition"
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
