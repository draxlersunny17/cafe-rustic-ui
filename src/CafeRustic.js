import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import MenuSection from "./components/MenuSection";
import Contact from "./components/Contact";
import Reviews from "./components/Reviews";
import OrderHistory from "./components/OrderHistory";
import DetailsModal from "./components/DetailsModal";
import FloatingButtons from "./components/FloatingButtons";
import CartPanel from "./components/CartPanel";
import OrderProgressModal from "./OrderProgressModal";
import Footer from "./components/Footer";
import SpecialOffersCarousel from "./components/SpecialOffersCarousel";
import { FaSun, FaMoon } from "react-icons/fa";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import menuData from './jsons/menuData.json';


// If you already have MENU elsewhere, import it and delete this block.

const MENU = menuData.menu;
const CATEGORIES = menuData.categories;


export default function CafeRustic() {

  // THEME
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // NAV
  const [menuOpen, setMenuOpen] = useState(false);

  // FILTERS (persist)
  const [category, setCategory] = useState(
    () => localStorage.getItem("category") || "All"
  );
  const [query, setQuery] = useState(() => localStorage.getItem("query") || "");
  useEffect(() => {
    localStorage.setItem("category", category);
    localStorage.setItem("query", query);
  }, [category, query]);

  // FAVORITES (persist)
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favorites")) || [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // FAVORITES pulse animation
  const [favPulse, setFavPulse] = useState(false);
  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const isFav = prev.includes(id);
      const updated = isFav ? prev.filter((f) => f !== id) : [...prev, id];
      if (!isFav) {
        setFavPulse(true);
        setTimeout(() => setFavPulse(false), 500);
      }
      return updated;
    });
  };

  // CART (persist)
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cafe_cart_v2");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("cafe_cart_v2", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (menuItem, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.id === menuItem.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [
        ...prev,
        {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          calories: menuItem.calories,
          image: menuItem.img,
          qty,
        },
      ];
    });
    setCartOpen(true);
  };
  const incQty = (id) =>
    setCart((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it))
    );
  const decQty = (id) =>
    setCart((prev) => {
      const found = prev.find((it) => it.id === id);
      if (!found) return prev;
      if (found.qty <= 1) return prev.filter((it) => it.id !== id);
      return prev.map((it) => (it.id === id ? { ...it, qty: it.qty - 1 } : it));
    });
  const removeItem = (id) =>
    setCart((prev) => prev.filter((it) => it.id !== id));
  const clearCart = () => setCart([]);

  const cartCount = useMemo(
    () => cart.reduce((s, it) => s + it.qty, 0),
    [cart]
  );
  const totalPrice = useMemo(
    () => cart.reduce((s, it) => s + it.price * it.qty, 0),
    [cart]
  );
  const totalCalories = useMemo(
    () => cart.reduce((s, it) => s + (it.calories || 0) * it.qty, 0),
    [cart]
  );
  const formatINR = (n) => `₹${n}`;

  // DETAILS MODAL
  const [selectedItem, setSelectedItem] = useState(null);

  // CART PANEL
  const [cartOpen, setCartOpen] = useState(false);

  // ORDER HISTORY (persist)
  const [orderHistory, setOrderHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("orderHistory")) || [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
  }, [orderHistory]);

  // ORDER PROGRESS MODAL
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  const [loyaltyPoints, setLoyaltyPoints] = useState(
    () => parseInt(localStorage.getItem("loyaltyPoints")) || 0
  );
  const [redeemPoints, setRedeemPoints] = useState(0);

  useEffect(() => {
    localStorage.setItem("loyaltyPoints", loyaltyPoints);
  }, [loyaltyPoints]);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newOrderNumber = Math.floor(1000 + Math.random() * 9000);
    setOrderNumber(newOrderNumber);

    // Calculate earned points BEFORE discount
    const earnedPoints = Math.floor(totalPrice / 10);

    // Calculate discount using redeemed points
    const discount = Math.min(redeemPoints, loyaltyPoints, totalPrice);

    // Update loyalty points: remove redeemed, add earned
    setLoyaltyPoints((prev) => prev - discount + earnedPoints);

    // Reset redeem input
    setRedeemPoints(0);

    // Let the user know how many points they earned
    toast.success(`You earned ${earnedPoints} points!`);

    // Save order history with discount applied
    const newOrder = {
      orderNumber: newOrderNumber,
      date: new Date().toLocaleString(),
      items: cart,
      subtotal: totalPrice,
      discount,
      total: totalPrice - discount,
      earnedPoints,
    };
    setOrderHistory((prev) => [newOrder, ...prev]);

    // Clear cart and show progress modal
    clearCart();
    setOrderModalOpen(true);
    setCartOpen(false);
  };

  // FILTERED MENU
  const filteredMenu = useMemo(() => {
    return MENU.filter((item) => {
      if (category === "Favorites" && !favorites.includes(item.id))
        return false;
      if (
        category !== "All" &&
        category !== "Favorites" &&
        item.category !== category
      )
        return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.shortDesc || "").toLowerCase().includes(q) ||
        (item.desc || "").toLowerCase().includes(q)
      );
    });
  }, [category, query, favorites]);

  //   const handleCancelOrder = () => {
  //   setOrderHistory((prev) =>
  //     prev.filter((o) => o.orderNumber !== orderNumber)
  //   );
  //   alert(`Order #${orderNumber} has been cancelled.`);
  //   setOrderModalOpen(false);
  // };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Cafe Rustic Menu", 105, 15, { align: "center" });

    // Decorative line
    doc.setDrawColor(150);
    doc.line(10, 20, 200, 20);

    let y = 30;
    const lineHeight = 7;

    MENU.forEach((item, index) => {
      // Add new page if content goes beyond page height
      if (y > 280) {
        doc.addPage();
        y = 20;
      }

      // Item name & price
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(item.name, 10, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(
        `Rs. ${item.price}`,
        200 - doc.getTextWidth(`Rs. ${item.price}`) - 10,
        y
      );

      y += lineHeight;

      // Item description (smaller, gray text)
      if (item.shortDesc) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(item.shortDesc, 10, y, { maxWidth: 180 });
        doc.setTextColor(0);
        y += lineHeight + 3;
      } else {
        y += 3;
      }

      // Divider line between items
      doc.setDrawColor(220);
      doc.line(10, y, 200, y);
      y += 5;
    });

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("Thank you for dining with us!", 105, 290, { align: "center" });

    doc.save("CafeRustic_Menu.pdf");
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} theme={theme} />
      <div
        className={
          theme === "dark"
            ? "dark bg-gray-950 text-white"
            : "bg-white text-gray-900"
        }
      >
        <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          setMenuOpen={setMenuOpen}
          menuOpen={menuOpen}
        />

        {/* MOBILE MENU (simple anchor links) */}
        {menuOpen && (
          <div
            className={`md:hidden sticky top-16 z-20 border-b border-gray-200 dark:border-gray-800 
      ${
        theme === "light" ? "bg-white text-gray-900" : "bg-gray-900 text-white"
      }`}
          >
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
              {/* Links in a row */}
              <div className="flex items-center gap-6">
                {["Home", "About", "Menu", "Contact"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="py-1 hover:underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </div>

              {/* Theme toggle button inside mobile menu */}
              <button
                onClick={() => {
                  toggleTheme();
                  setMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-1 rounded ${
                  theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-800"
                }`}
              >
                {theme === "light" ? <FaMoon /> : <FaSun />}
                <span className="hidden sm:inline">Toggle Theme</span>
              </button>
            </div>
          </div>
        )}

        <Hero />
        <About />

        <SpecialOffersCarousel theme={theme} />

        <MenuSection
          id="menu"
          categories={CATEGORIES}
          theme={theme}
          category={category}
          setCategory={setCategory}
          query={query}
          setQuery={setQuery}
          items={filteredMenu}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          addToCart={addToCart}
          setSelectedItem={setSelectedItem}
          handleDownloadPDF={handleDownloadPDF}
        />

        <Reviews theme={theme} />
        <OrderHistory
          orderHistory={orderHistory}
          formatINR={formatINR}
          theme={theme}
          onReorder={(order) => {
            order.items.forEach((it) => {
              // Rebuild the item from the MENU array so all fields exist
              const menuItem = MENU.find((m) => m.id === it.id);
              if (menuItem) {
                addToCart(menuItem, it.qty);
              }
            });
            toast.success(`Order #${order.orderNumber} added to cart!`);
          }}
        />

        <Contact theme={theme} />

        <Footer />

        <DetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          addToCart={addToCart}
          theme={theme}
          formatINR={formatINR}
        />

        {/* Hidden trigger for FloatingButtons -> Cart open */}
        <button
          id="cart-panel-btn"
          onClick={() => setCartOpen(true)}
          className="hidden"
          aria-hidden
        />

        <FloatingButtons
          cartCount={cartCount}
          favorites={favorites}
          favPulse={favPulse}
          setCategory={setCategory}
        />

        <CartPanel
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          cart={cart}
          incQty={incQty}
          decQty={decQty}
          removeItem={removeItem}
          clearCart={clearCart}
          totalPrice={totalPrice}
          totalCalories={totalCalories}
          formatINR={formatINR}
          onCheckout={handleCheckout}
          theme={theme}
          loyaltyPoints={loyaltyPoints}
          redeemPoints={redeemPoints}
          setRedeemPoints={setRedeemPoints}
        />

        <OrderProgressModal
          isOpen={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
          orderNumber={orderNumber}
          theme={theme}
        />
      </div>
    </>
  );
}
