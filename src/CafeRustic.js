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
import VariantSelector from "./components/VariantSelector";
import SignInModal from "./components/SignInModal";
import SignUpModal from "./components/SignUpModal";
import ProfileModal from "./components/ProfileModal";
import { fetchMenu, fetchUserProfile, updateUserDetails , addOrder, fetchOrders} from "./supabaseApi";

export default function CafeRustic() {
  const [variantItem, setVariantItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [theme, setTheme] = useState("light");
  const [favorites, setFavorites] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState(() => localStorage.getItem("query") || "");
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cafe_cart_v2");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [redeemPoints, setRedeemPoints] = useState(0);

  const formatINR = (n) => `₹${n}`;

  // ----------- USEEFFECT HOOKS -----------------
  useEffect(() => {
    const getMenu = async () => {
      setLoading(true);
      try {
        const data = await fetchMenu();
        setMenuItems(data || []);
        const uniqueCategories = [
          "All",
          "Favorites",
          ...new Set(data.map((item) => item.category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch menu:", error);
      } finally {
        setLoading(false);
      }
    };
    getMenu();
  }, []);

  useEffect(() => {
    localStorage.setItem("category", category);
    localStorage.setItem("query", query);
  }, [category, query]);

  useEffect(() => {
    localStorage.setItem("cafe_cart_v2", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const restoreUser = async () => {
      const savedUserId = localStorage.getItem("userId");
      if (savedUserId) {
        await loadAndSetUserProfile(savedUserId);
      }
    };
    restoreUser();
  }, []); 



  // ----------- MEMOIZED VALUES -----------------
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
  const filteredMenu = useMemo(() => {
    return menuItems.filter((item) => {
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
        (item.short_desc || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q)
      );
    });
  }, [menuItems, category, query, favorites]);

  // ----------- FUNCTIONS -----------------
  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    if (userProfile) {
      await updateUserDetails(userProfile.id, { theme: newTheme });
    }
  };

  const toggleFavorite = async (id) => {
    if (!userProfile) {
      toast.warning("Please sign in to use favorites!");
      setSignInOpen(true);
      return;
    }

    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];

    setFavorites(updated);

    await updateUserDetails(userProfile.id, { favorites: updated });
  };

  const addToCart = (menuItem, qty = 1, variant = null) => {
    if (!userProfile) {
      toast.warning("Please sign in to add items to your cart!");
      setSignInOpen(true);
      return;
    }
    const idWithVariant = variant
      ? `${menuItem.id}-${variant.name.replace(/\s+/g, "")}`
      : menuItem.id;
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.id === idWithVariant);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [
        ...prev,
        {
          id: idWithVariant,
          name: variant ? `${menuItem.name} (${variant.name})` : menuItem.name,
          price: variant ? variant.price : menuItem.price,
          calories: menuItem.calories,
          image: menuItem.img,
          qty,
        },
      ];
    });
    setProfileOpen(false);
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

  const handleCheckout = async () => {
    if (cart.length === 0) return;
  
    const newOrderNumber = Math.floor(1000 + Math.random() * 9000);
    setOrderNumber(newOrderNumber);
  
    const earnedPoints = Math.floor(totalPrice / 10);
    const discount = Math.min(redeemPoints, loyaltyPoints, totalPrice);
  
    const newOrder = {
      user_id: userProfile.id,
      order_number: newOrderNumber,
      date: new Date().toISOString(),
      items: cart,
      subtotal: totalPrice,
      discount,
      total: totalPrice - discount,
      earned_points: earnedPoints,
    };
  
    // ✅ Insert into orders table
    await addOrder(newOrder);
  
    // ✅ Update loyalty points
    await updateUserDetails(userProfile.id, {
      loyalty_points: loyaltyPoints - discount + earnedPoints,
    });
    setLoyaltyPoints((prev) => prev - discount + earnedPoints);
    setRedeemPoints(0);
  
    // ✅ Reload order history from orders table
    const updatedOrders = await fetchOrders(userProfile.id);
    setOrderHistory(updatedOrders);
  
    toast.success(`You earned ${earnedPoints} points!`);
  
    clearCart();
    setOrderModalOpen(true);
    setCartOpen(false);
  };
  

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const bgImgUrl = "/images/caferusticmenu.jpg"; // Ensure correct path
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = bgImgUrl;

    img.onload = () => {
      const addBackground = () => {
        doc.addImage(img, "JPEG", 0, 0, 210, 297, "", "FAST"); // A4 full page
      };

      addBackground();

      // Start Y position just below "FOOD MENU"
      let y = 55;
      const lineHeight = 7;
      const leftMargin = 25;
      const rightMargin = 185;

      menuItems.forEach((item) => {
        // Page break with background re-add
        if (y > 270) {
          doc.addPage();
          addBackground();
          y = 55;
        }

        // Item Name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(item.name, leftMargin, y);

        if (!item.menu_item_variants || item.menu_item_variants.length === 0) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          doc.text(
            `Rs. ${item.price}`,
            rightMargin - doc.getTextWidth(`Rs. ${item.price}`),
            y
          );
        }

        y += lineHeight;

        // Short Description
        if (item.short_desc) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(10);
          doc.setTextColor(50);
          doc.text(item.short_desc, leftMargin, y, {
            maxWidth: rightMargin - leftMargin,
          });
          doc.setTextColor(0);
          y += lineHeight;
        }

        // Variants
        if (item.menu_item_variants && item.menu_item_variants.length > 0) {
          item.menu_item_variants.forEach((variant) => {
            if (y > 280) {
              doc.addPage();
              addBackground();
              y = 55;
            }
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.text(`- ${variant.name}`, leftMargin + 5, y);
            doc.text(
              `Rs. ${variant.price}`,
              rightMargin - doc.getTextWidth(`Rs. ${variant.price}`),
              y
            );
            y += lineHeight;
          });
        }

        y += 5; // small space between items
      });

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("Thank you for dining with us!", 105, 290, { align: "center" });

      doc.save("CafeRustic_Menu.pdf");
    };
  };

  const reorderOrder = (order) => {
    order.items.forEach((it) => {
      let baseId = it.id;
      let variantName = null;

      // Check if the item has a variant format: "<id>-<variant>"
      const possibleMenuItem = menuItems.find((m) => m.id === it.id);
      if (!possibleMenuItem && it.id.includes("(")) {
        // If the stored id has variant in brackets, parse it from name
        const match = it.name.match(/\(([^)]+)\)/);
        if (match) {
          variantName = match[1];
          // Remove last -Variant part to get base id
          baseId = it.id.split("-")[0];
        }
      } else if (!possibleMenuItem && it.id.includes("-")) {
        // Variant stored with dash format
        const parts = it.id.split("-");
        baseId = parts[0] + (parts.length > 2 ? `-${parts[1]}` : "");
        variantName = parts[parts.length - 1];
      }

      const menuItem = menuItems.find((m) => m.id === baseId);

      if (menuItem) {
        if (variantName) {
          const variantObj = menuItem.menu_item_variants?.find(
            (v) => v.name.toLowerCase() === variantName.toLowerCase()
          );
          addToCart(menuItem, it.qty, variantObj || null);
        } else {
          addToCart(menuItem, it.qty);
        }
      }
    });

    toast.success(`Order #${order.order_number} added to cart!`);
  };

  const loadAndSetUserProfile = async (userId) => {
    const fullProfile = await fetchUserProfile(userId);
    if (fullProfile) {
      setUserProfile(fullProfile);
      setTheme(fullProfile.theme || "light");
      setFavorites(fullProfile.favorites || []);
      setLoyaltyPoints(fullProfile.loyalty_points || 0);
      const orders = await fetchOrders(userId);
      setOrderHistory(orders);    }
  }; 
  
  const handleSignIn = async (profileData, isSignUp = false) => {
    setUserProfile(profileData);
    localStorage.setItem("userId", profileData.id);
    await loadAndSetUserProfile(profileData.id);
    // If this is from SignUp — clear history & points
    if (isSignUp) {
      setOrderHistory([]);
      setLoyaltyPoints(0);
      setCart([]);
      localStorage.removeItem("cafe_cart_v2");
    }
    setSignInOpen(false);
    setSignUpOpen(false);
  };

  const handleLogout = () => {
    setUserProfile(null);
    localStorage.removeItem("userId");   // clear saved session
    setProfileOpen(false);
    setFavorites([]);                    // clear local state
    setTheme("light");                   // reset theme locally
    setOrderHistory([]);                 // clear order history state
    setLoyaltyPoints(0);                 // reset points
    setCart([]);                         // empty cart
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
          userProfile={userProfile}
          setProfileOpen={setProfileOpen}
          setSignInOpen={setSignInOpen}
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

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900 dark:border-white"></div>
          </div>
        ) : (
          <MenuSection
            id="menu"
            categories={categories}
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
            setVariantItem={setVariantItem}
          />
        )}

        <Reviews theme={theme} />
        <OrderHistory
          orderHistory={orderHistory}
          formatINR={formatINR}
          theme={theme}
          onReorder={reorderOrder}
        />

        <Contact theme={theme} userProfile={userProfile} />

        <Footer />

        <DetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          addToCart={addToCart}
          theme={theme}
          formatINR={formatINR}
          setVariantItem={setVariantItem}
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

        {variantItem && (
          <VariantSelector
            item={variantItem}
            theme={theme}
            onSelect={(variant) => {
              addToCart(variantItem, 1, variant);
              setVariantItem(null);
            }}
            onClose={() => setVariantItem(null)}
          />
        )}

        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          theme={theme}
          userProfile={userProfile}
          loyaltyPoints={loyaltyPoints}
          onLogout={handleLogout}
        />

        <SignInModal
          isOpen={signInOpen}
          onClose={() => setSignInOpen(false)}
          onSignIn={handleSignIn}
          onSwitchToSignUp={() => {
            setSignInOpen(false);
            setSignUpOpen(true);
          }}
          theme={theme}
        />
        <SignUpModal
          isOpen={signUpOpen}
          onClose={() => setSignUpOpen(false)}
          onSignUp={(profileData) => handleSignIn(profileData, true)}
          onSwitchToSignIn={() => {
            setSignUpOpen(false);
            setSignInOpen(true);
          }}
          theme={theme}
        />
      </div>
    </>
  );
}
