import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaRobot } from "react-icons/fa";
import { Bot, Send } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import OrderProgressModal from "../OrderProgressModal";
import { toast } from "react-toastify";

export default function AIChatAssistant({
  menuItems,
  onAddToCart,
  onCheckout,
  onConfirmPayment,
  theme,
  userProfile,
  pendingOrder,
  cart,
  orderNumber,
}) {

  const messagesEndRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi 👋 I’m Aromi, your digital barista. Ask me anything—I’ve got the menu wired.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderProgressOpen, setOrderProgressOpen] = useState(false);
  // Conversation state machine
  const [checkoutStep, setCheckoutStep] = useState(null);
  // null | "method" | "tip" | "split" | "confirm"
  const [tempPayment, setTempPayment] = useState("upi");
  const [tempTip, setTempTip] = useState(0);
  const [tempSplit, setTempSplit] = useState(1);
  const [pendingVariant, setPendingVariant] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  

  // Parse simple "add item" phrases
  const handleAddToCartIntent = (text) => {
    const lower = text.toLowerCase();

    // Find matching menu item
    const found = menuItems.find((it) => lower.includes(it.name.toLowerCase()));

    if (found) {
      // Extract quantity (default 1)
      const qtyMatch = lower.match(/(\d+)/);
      const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

      return { item: found, qty };
    }
    return null;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };

   // === If waiting for a variant choice ===
   if (pendingVariant) {
    const chosen = pendingVariant.item.menu_item_variants.find((v) =>
      userMsg.content.toLowerCase().includes(v.name.toLowerCase())
    );

    if (chosen) {
      onAddToCart({
        ...pendingVariant.item,
        name: `${pendingVariant.item.name} (${chosen.name})`,
        price: chosen.price,
        qty: pendingVariant.qty,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ Added ${pendingVariant.qty} × ${pendingVariant.item.name} (${chosen.name}) to your cart. Say "checkout" when you're ready!`,
        },
      ]);
      setPendingVariant(null);
      setInput("");
      setLoading(false);
      return;
    } else {
      // if user answer doesn’t match directly, ask AI to re-prompt nicely
      try {
        const res = await fetch("/api/aiMenuAssistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            menuItems,
            context: { step: "variant", item: pendingVariant.item },
          }),
        });
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ Please choose a valid option." },
        ]);
      }
      setLoading(false);
      return;
    }
  }

  // === Handle "Add to Cart" intent ===
  const addIntent = handleAddToCartIntent(userMsg.content);
  if (addIntent) {
    const foundItem = addIntent.item;

    // If item has variants → let AI ask instead of hardcoding
    if (foundItem.menu_item_variants && foundItem.menu_item_variants.length > 0) {
      try {
        const res = await fetch("/api/aiMenuAssistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            menuItems,
            context: { step: "variant", item: foundItem, qty: addIntent.qty },
          }),
        });
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);

        setPendingVariant({ item: foundItem, qty: addIntent.qty });
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ Error fetching AI variant response." },
        ]);
      }
      setInput("");
      setLoading(false);
      return;
    }

    // No variants → add directly
    onAddToCart({ ...foundItem, qty: addIntent.qty });
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `✅ Added ${addIntent.qty} × ${foundItem.name} to your cart. Say "checkout" when you're ready!`,
      },
    ]);
    setInput("");
    setLoading(false);
    return;
  }

  // === Normal chat flow ===
  setMessages((prev) => [...prev, userMsg]);
  setInput("");
  setLoading(true);

    try {
      // === STEP: Payment Method ===
      if (checkoutStep === "method") {
        const method = userMsg.content.toLowerCase();
        if (["upi", "card", "wallet", "cash"].some((m) => method.includes(m))) {
          const selected = ["upi", "card", "wallet", "cash"].find((m) =>
            method.includes(m)
          );
          setTempPayment(selected);
          setCheckoutStep("tip");

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `💳 Got it! Payment by ${selected.toUpperCase()}. Would you like to add a tip? (No, 5%, 10% or enter amount)`,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "⚠️ Please choose: UPI, Card, Wallet, or Cash.",
            },
          ]);
        }
        setLoading(false);
        return;
      }

      // === STEP: Tip ===
      if (checkoutStep === "tip") {
        const tipText = userMsg.content.toLowerCase();
        let tipValue = 0;
        if (tipText === "no" || tipText === "0") {
          tipValue = 0;
        } else if (tipText === "5" || tipText === "5%") {
          tipValue = 5;
        } else if (tipText === "10" || tipText === "10%") {
          tipValue = 10;
        } else if (!isNaN(Number(tipText))) {
          tipValue = Number(tipText); // treat plain number as fixed ₹
        }
        

        setTempTip(tipValue);
        setCheckoutStep("split");

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `👍 Tip set to ${
              tipValue <= 10 ? tipValue + "%" : "₹" + tipValue
            }. How many people are splitting the bill?`,
          },
        ]);
        setLoading(false);
        return;
      }

      // === STEP: Split ===
      if (checkoutStep === "split") {
        const num = parseInt(userMsg.content, 10);
        if (!isNaN(num) && num > 0) {
          setTempSplit(num);
          setCheckoutStep("confirm");
  
          try {
            const res = await fetch("/api/aiMenuAssistant", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [...messages, userMsg],
                menuItems,
                cart,
                pendingOrder,
                context: {
                  step: "split",
                  paymentMethod: tempPayment,
                  tip: tempTip,
                  splitCount: num,
                },
              }),
            });
            const data = await res.json();
  
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: data.reply },
            ]);
          } catch (err) {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: "⚠️ Error calculating bill with AI." },
            ]);
          }
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "⚠️ Please enter a valid number of people." },
          ]);
        }
        setLoading(false);
        return;
      }
      

      // === STEP: Confirm ===
      if (checkoutStep === "confirm") {
        const confirmText = userMsg.content.toLowerCase();
        if (confirmText.includes("yes")) {
          setCheckoutStep(null);

          const subtotal = cart.reduce(
            (s, it) => s + (it.price || 0) * (it.qty || 1),
            0
          );
          const sgst = subtotal * 0.025;
          const cgst = subtotal * 0.025;
          const discount = pendingOrder?.discount || 0;
          const appliedTip =
            tempTip <= 10 ? (subtotal * tempTip) / 100 : tempTip;
          const grandTotal = subtotal + sgst + cgst + appliedTip - discount;

          onConfirmPayment({
            paymentMethod: tempPayment,
            tip: tempTip,
            splitCount: tempSplit,
            totalWithGST: grandTotal,
            sgst,
            cgst,
            fromAIChatAssistant: true,
          });
          const pdfUrl = await generateReceiptPDF({
            cart,
            userProfile,
            sgst,
            cgst,
            discount,
            appliedTip,
            grandTotal,
            paymentMethod: tempPayment,
            splitCount: tempSplit,
          });

          // Show initial confirmation message
          setTimeout(() => {
            toast.success(`Your order placed successfully.`);
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: (
                  <>
                    ✅ Order confirmed! Payment processed.
                    <br />
                    <a
                      href={pdfUrl}
                      download={`Receipt_${Date.now()}.pdf`}
                      className="text-blue-600 underline"
                    >
                      Click here to download your receipt
                    </a>
                  </>
                ),
              },
            ]);

            // Open order progress modal 4 seconds after the message appears
            setTimeout(() => setOrderProgressOpen(true), 4000);
          }, 2000);
        } else if (confirmText.includes("no")) {
          setCheckoutStep(null);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "❌ Order canceled. You can restart by saying 'checkout'.",
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "⚠️ Please reply with 'yes' or 'no'.",
            },
          ]);
        }
        setLoading(false);
        return;
      }

      // === Checkout Trigger ===
      if (
        checkoutStep === null &&
        /checkout|place order|buy/i.test(userMsg.content)
      ) {
        if (!userProfile) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "⚠️ Please sign in first to place an order.",
            },
          ]);
          setLoading(false);
          return;
        }

        if (!cart || cart.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "🛒 Your cart is empty. Add some items first!",
            },
          ]);
          setLoading(false);
          return;
        }
        onCheckout({ fromAIChatAssistant: true });
        setCheckoutStep("method");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "🛒 Got your cart! How would you like to pay? (UPI, Card, Wallet, Cash)",
          },
        ]);
        setLoading(false);
        return;
      }

      // === Normal Q&A (fallback to AI API) ===
      const res = await fetch("/api/aiMenuAssistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], menuItems }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error fetching AI response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateReceiptPDF = async ({
    cart,
    userProfile,
    sgst,
    cgst,
    discount,
    appliedTip,
    grandTotal,
    paymentMethod,
    splitCount,
  }) => {
    const doc = new jsPDF();

    // ===== Logo =====
    const logo = "/images/cafelogo.png";
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
    if (userProfile.address) doc.text(`${userProfile.address}`, 14, 68);

    // ===== Invoice Info (top-right) =====
    const invoiceNo = Math.floor(10000 + Math.random() * 90000);
    const invoiceDate = new Date().toLocaleString();
    doc.text(`Invoice No. ${invoiceNo}`, 190, 40, { align: "right" });
    doc.text(`${invoiceDate}`, 190, 47, { align: "right" });
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
    doc.setDrawColor(180);
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
    doc.addImage(qrImage, "PNG", 14, y + 50, 40, 40);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("Scan QR to give feedback", 14, y + 95);

    // ===== Footer =====
    let footerY = y + 55;
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(10, footerY - 10, 200, footerY - 10);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.text("We hope to see you again soon!", 105, y + 60, {
      align: "center",
    });

    // ===== Watermark =====
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(40);
      doc.setTextColor(150);
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.1 }));
      doc.text("Powered by Café Rustic", 35, 150, { angle: 45 });
      doc.restoreGraphicsState();
    }

    // Return a blob URL instead of saving
    const pdfBlob = doc.output("blob");
    return URL.createObjectURL(pdfBlob);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition"
      >
        <FaRobot size={22} />
      </button>

      {/* Chat Panel */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-20 right-6 w-80 h-[28rem] rounded-2xl shadow-2xl flex flex-col border ${
            theme === "dark"
              ? "bg-gray-900 text-white border-gray-700"
              : "bg-white text-gray-900 border-gray-200"
          }`}
        >
          {/* Header */}
          <div
            className={`p-3 rounded-t-2xl font-semibold flex items-center gap-2 ${
              theme === "dark" ? "bg-gray-800" : "bg-blue-600 text-white"
            }`}
          >
            <Bot /> Café Chatbot
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 p-3 scrollbar-thin scrollbar-thumb-gray-400">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-end gap-2 ${
                  msg.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                {/* Assistant Avatar */}
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white">
                    <img
                      src="images/cafebot.svg"
                      alt="Bot"
                      className="w-6 h-6"
                    />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm shadow ${
                    msg.role === "assistant"
                      ? theme === "dark"
                        ? "bg-gray-700 text-gray-100"
                        : "bg-gray-200 text-gray-900"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {msg.content}
                </div>

                {/* User Avatar */}
                {msg.role === "user" && userProfile && (
                  <img
                    src={`images/avatars/${userProfile.avatar}`}
                    alt="User"
                    className="w-8 h-8 rounded-full border"
                  />
                )}
              </motion.div>
            ))}
            {loading && (
              <div className="italic text-sm text-gray-500 flex items-center gap-2">
                <FaRobot className="text-blue-500" /> Thinking...
              </div>
            )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 flex gap-2 border-t border-gray-300 dark:border-gray-700 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 rounded-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Ask about the menu..."
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`p-2 rounded-full shadow transition flex items-center justify-center 
      ${
        input.trim()
          ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90"
          : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50"
      } text-white`}
            >
              <Send size={18} />
            </button>
          </div>
        </motion.div>
      )}

      <OrderProgressModal
        isOpen={orderProgressOpen}
        onClose={() => setOrderProgressOpen(false)}
        orderNumber={orderNumber}
        theme={theme}
      />
    </>
  );
}
