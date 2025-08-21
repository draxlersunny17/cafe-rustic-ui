import React, { useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
export default function CheckoutPanel({
  cart = [],
  onConfirm,
  onClose,
  theme,
  pendingOrder,
  userProfile
}) {
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [splitCount, setSplitCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ✅ Calculate totals
  const discount = pendingOrder.discount || 0;
  const taxableAmount = pendingOrder.total || 0;
  const sgst = taxableAmount * 0.025;
  const cgst = taxableAmount * 0.025;
  const subtotal = taxableAmount + sgst + cgst;

  const appliedTip = Math.max(
    0,
    customTip ? Number(customTip) : (subtotal * tip) / 100
  );
  const grandTotal = subtotal + appliedTip;
  const perPerson = grandTotal / splitCount;

  // ✅ Theme classes
  const isDark = theme === "dark";
  const bgClass = isDark
    ? "bg-gray-900 text-gray-100"
    : "bg-white text-gray-800";
  const borderClass = isDark ? "border-gray-700" : "border-gray-200";
  const inputClass = isDark
    ? "bg-gray-800 text-gray-100 border border-gray-700"
    : "bg-gray-50 text-gray-800 border border-gray-300";
  const mutedText = isDark ? "text-gray-400" : "text-gray-600";
  const buttonInactive = isDark
    ? "bg-gray-700 text-gray-300"
    : "bg-gray-200 text-gray-700";

  // ✅ Handle confirm with animation
  const handleConfirm = () => {
    setLoading(true);
    setSuccess(false);
  
    // Step 1: Processing for 10s
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
  
      // Step 2: After showing success, generate PDF
      generateReceiptPDF();
  
      // Step 3: Reset + callback (optional after 2-3s)
      setTimeout(() => {
        setSuccess(false);
        onConfirm({ paymentMethod, tip: appliedTip, splitCount, totalWithGST: grandTotal, sgst, cgst });
      }, 2000);
  
    }, 10000); // 10s wait before success
  };
  

  const generateReceiptPDF = async() => {
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

   // ===== Billed To =====
   doc.setFontSize(12);
   doc.setFont("helvetica", "bold");
   doc.text("Billed To:", 14, 40);
 
   doc.setFont("helvetica", "normal");
   doc.text(`${userProfile.name}`, 14, 47);
   doc.text(`${userProfile.email}`, 14, 54);
   doc.text(`${userProfile.phone}`, 14, 61);
   if (userProfile.address) {
     doc.text(`${userProfile.address}`, 14, 68);
   }
 
   // ===== Invoice Info (top-right corner) =====
   doc.setFontSize(12);
   doc.setFont("helvetica", "normal");
   const invoiceNo = Math.floor(10000 + Math.random() * 90000);
   const invoiceDate = new Date().toLocaleString();
   doc.text(`Invoice No. ${invoiceNo}`, 190, 40, { align: "right" });
   doc.text(`${invoiceDate}`, 190, 47, { align: "right" });
 
   // ===== Order Info (below invoice info) =====
   doc.text(`Payment Mode: ${paymentMethod.toUpperCase()}`, 150, 61);
   doc.text(`No of Person: ${splitCount}`, 150, 68);

    // ===== Table =====
    const tableData = cart.map((item) => [
      item.name,
      item.qty,
      `Rs.${item.price.toFixed(2)}`,
      `Rs.${(item.price * item.qty).toFixed(2)}`,
    ]);

    autoTable(doc, {
      head: [["Item", "Qty", "Price", "Total"]],
      body: tableData,
      startY: 75,
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
    doc.text(`Rs. ${sgst.toFixed(2)}`, 190, y, { align: "right" });

    doc.text(`CGST (2.5%): `, 150, y + 8);
    doc.text(`Rs. ${cgst.toFixed(2)}`, 190, y + 8, { align: "right" });

    if (discount > 0) {
      doc.text(`Discount: `, 150, y + 16);
      doc.text(`Rs. ${discount.toFixed(2)}`, 190, y + 16, { align: "right" });
    }

    if (appliedTip > 0) {
      doc.text(`Tip: `, 150, y + 24);
      doc.text(`Rs. ${appliedTip.toFixed(2)}`, 190, y + 24, { align: "right" });
    }
    // ===== Grand Total =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Total:`, 150, y + 40);
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, 190, y + 40, { align: "right" });

     // ===== QR Code (bottom left) =====
  const qrData = `https://cafe-rustic-ui.vercel.app/feedback`;
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div
        className={`relative rounded-2xl shadow-2xl max-w-lg w-full h-[90vh] flex flex-col transition-colors duration-300 ${bgClass}`}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl font-bold text-gray-400 hover:text-gray-600"
        >
          ×
        </button>

        {/* HEADER */}
        <h2
          className={`text-3xl font-extrabold p-4 pb-2 text-center font-serif border-b ${borderClass}`}
        >
          Checkout
        </h2>

        {/* BODY (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* CART SUMMARY */}
          <div className={`pb-4 border-b ${borderClass}`}>
            {cart.length === 0 ? (
              <p className={`text-sm ${mutedText}`}>Your cart is empty.</p>
            ) : (
              <div className="space-y-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    <span>₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            )}

            {discount > 0 && (
              <div className="flex justify-between text-sm text-red-500 mt-2">
                <span>Discount</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm mt-1">
              <span>SGST (2.5%)</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>CGST (2.5%)</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-semibold mt-3">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* PAYMENT METHODS */}
          <div>
            <h3 className="font-semibold mb-2">Payment Method</h3>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={`w-full p-2 rounded-xl ${inputClass}`}
            >
              <option value="upi">UPI</option>
              <option value="card">Credit/Debit Card</option>
              <option value="wallet">Wallet</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          {/* TIPS */}
          <div>
            <h3 className="font-semibold mb-2">Add a Tip</h3>
            <div className="flex gap-2 mb-2">
              {[0, 5, 10].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setTip(p);
                    setCustomTip("");
                  }}
                  className={`px-3 py-1 rounded-full transition ${
                    tip === p ? "bg-green-600 text-white" : buttonInactive
                  }`}
                >
                  {p === 0 ? "No Tip" : `${p}%`}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="0"
              placeholder="Custom Tip (₹)"
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              className={`w-full p-2 rounded-xl ${inputClass}`}
            />
          </div>

          {/* SPLIT BILL */}
          <div>
            <h3 className="font-semibold mb-2">Split Bill</h3>
            <div className="flex items-center">
              <input
                type="number"
                min="1"
                value={splitCount}
                onChange={(e) => setSplitCount(Number(e.target.value))}
                className={`w-20 p-2 rounded-xl ${inputClass}`}
              />
              <span className={`ml-2 text-sm ${mutedText}`}>people</span>
            </div>
            {splitCount > 1 && (
              <p className={`text-sm mt-1 ${mutedText}`}>
                Each pays: <strong>₹{perPerson.toFixed(2)}</strong>
              </p>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className={`border-t p-6 space-y-4 ${borderClass}`}>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>

          {/* Buttons */}


            <button
              onClick={handleConfirm}
              disabled={loading || success}
              className={`w-full py-3 rounded-2xl font-semibold transition text-white ${
                success
                  ? "bg-green-700"
                  : loading
                  ? "bg-green-500 animate-pulse"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading
                ? "Processing..."
                : success
                ? "✔ Payment Successful"
                : "Confirm & Pay"}
            </button>
        </div>
      </div>

     
    </div>
  );
}
