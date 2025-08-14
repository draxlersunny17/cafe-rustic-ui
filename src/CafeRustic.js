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

// If you already have MENU elsewhere, import it and delete this block.
const MENU = [
  // ----- Coffee -----
  {
    id: "cappuccino",
    name: "Cappuccino",
    price: 180,
    category: "Coffee",
    desc: "Espresso with steamed milk and foam, topped with a sprinkle of cocoa powder.",
    shortDesc: "Smooth and frothy classic.",
    calories: 150,
    ingredients: "Espresso, steamed milk, milk foam, cocoa powder",
    prep: "Brew a shot of espresso, steam milk until velvety, then combine and top with foam.",
    origin: "Originated in Italy, popular worldwide as a breakfast coffee.",
    img: "https://lorcoffee.com/cdn/shop/articles/Cappuccino-exc.jpg?format=pjpg&v=1684870907&width=749",
  },
  {
    id: "flat-white",
    name: "Flat White",
    price: 200,
    category: "Coffee",
    desc: "Velvety steamed milk poured over a strong ristretto shot for a balanced cup.",
    shortDesc: "Creamy with bold coffee flavor.",
    calories: 170,
    ingredients: "Ristretto, steamed milk",
    prep: "Pull a ristretto shot, steam milk to a fine microfoam, pour gently to blend.",
    origin: "Developed in Australia/New Zealand in the 1980s.",
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "cold-brew",
    name: "Cold Brew",
    price: 160,
    category: "Coffee",
    desc: "Smooth, low-acidity cold brewed coffee served over ice.",
    shortDesc: "Refreshing and mellow.",
    calories: 5,
    ingredients: "Coarsely ground coffee, cold water",
    prep: "Steep coarse grounds in cold water for 12–18 hours, strain, serve over ice.",
    origin:
      "Cold-brewing has been used for centuries; modern popularity rose in specialty coffee shops.",
    img: "https://sundaytable.co/wp-content/uploads/2024/03/grind-size-for-cold-brew-coffee-concentrate-1.jpg",
  },
  {
    id: "caramel-latte",
    name: "Caramel Latte",
    price: 190,
    category: "Coffee",
    desc: "Sweet caramel syrup blended with espresso and steamed milk for a smooth, sweet latte.",
    shortDesc: "Sweet and creamy delight.",
    calories: 220,
    ingredients:
      "Espresso, steamed milk, caramel syrup, whipped cream (optional)",
    prep: "Brew espresso, add caramel syrup, steam milk and combine. Top with whipped cream if desired.",
    origin:
      "A modern coffeehouse favorite combining espresso with flavored syrup.",
    img: "https://www.chilitochoc.com/wp-content/uploads/2022/12/pouring-caramel-on-latte-with-spoon.jpg",
  },
  {
    id: "mocha",
    name: "Mocha",
    price: 210,
    category: "Coffee",
    desc: "A rich combination of espresso, steamed milk, and chocolate syrup topped with whipped cream.",
    shortDesc: "Chocolate meets coffee bliss.",
    calories: 290,
    ingredients: "Espresso, steamed milk, chocolate syrup, whipped cream",
    prep: "Brew espresso, mix with chocolate syrup, steam milk, combine, top with whipped cream.",
    origin:
      "Named after the Yemeni port of Mocha, famous for coffee and cocoa.",
    img: "https://www.thespruceeats.com/thmb/POPhcPYBWx7fNJu8Bc7YjS-Flso=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/SES-mocha-4797918-hero-01-1-f8fb7ebd74914895b61366f6fc1d4b05.jpg",
  },

  // ----- Bakery -----
  {
    id: "blueberry-muffin",
    name: "Blueberry Muffin",
    price: 120,
    category: "Bakery",
    desc: "Freshly baked muffin bursting with juicy blueberries and a buttery crumb.",
    shortDesc: "Sweet and fluffy with berries.",
    calories: 320,
    ingredients: "Flour, sugar, butter, eggs, blueberries, baking powder",
    prep: "Mix dry and wet ingredients separately, combine, fold in blueberries, bake at 180°C for ~20 mins.",
    origin: "Popular in American bakeries since the early 1900s.",
    img: "https://www.tasteofhome.com/wp-content/uploads/2024/08/Blueberry-Oatmeal-Muffins_EXPS_TOHD24_25094_DebbieWolfe_4.jpg",
  },
  {
    id: "chocolate-brownie",
    name: "Chocolate Brownie",
    price: 140,
    category: "Bakery",
    desc: "Rich, gooey chocolate brownie with a crackly top.",
    shortDesc: "Decadent chocolate indulgence.",
    calories: 400,
    ingredients: "Dark chocolate, butter, sugar, eggs, flour",
    prep: "Melt chocolate with butter, fold in sugar and eggs, add flour, bake until set.",
    origin: "An American classic — fudgy and universally loved.",
    img: "https://icecreambakery.in/wp-content/uploads/2024/12/Brownie-Recipe-with-Cocoa-Powder-821x821.jpg",
  },
  {
    id: "croissant",
    name: "Butter Croissant",
    price: 110,
    category: "Bakery",
    desc: "Flaky, buttery pastry with delicate layers and a golden crust.",
    shortDesc: "Crispy and buttery.",
    calories: 270,
    ingredients: "Flour, butter, yeast, sugar, salt",
    prep: "Layer dough with butter through repeated folding, proof, and bake until golden.",
    origin: "French pastry dating back to the 19th century.",
    img: "https://images.ricardocuisine.com/services/recipes/croissant1.jpg",
  },
  {
    id: "cinnamon-roll",
    name: "Cinnamon Roll",
    price: 150,
    category: "Bakery",
    desc: "Soft, sweet roll filled with cinnamon sugar and drizzled with icing.",
    shortDesc: "Warm and comforting.",
    calories: 420,
    ingredients: "Flour, sugar, butter, cinnamon, yeast, icing sugar",
    prep: "Prepare dough, roll with cinnamon sugar filling, bake, drizzle with icing.",
    origin: "Originated in Sweden as “kanelbulle,” popular worldwide.",
    img: "https://cambreabakes.com/wp-content/uploads/2024/03/best-cinnamon-rolls-featured.jpg",
  },

  // ----- Brunch -----
  {
    id: "avocado-toast",
    name: "Avocado Toast",
    price: 240,
    category: "Brunch",
    desc: "Smashed avocado on toasted sourdough with chili flakes and olive oil.",
    shortDesc: "Healthy and flavorful.",
    calories: 250,
    ingredients: "Sourdough, avocado, chili flakes, olive oil, salt",
    prep: "Toast bread, smash avocado with lemon and salt, assemble and finish with chili flakes and oil.",
    origin: "Modern brunch favorite with roots in California cuisine.",
    img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "eggs-benedict",
    name: "Eggs Benedict",
    price: 260,
    category: "Brunch",
    desc: "Poached eggs on toasted English muffins with ham and hollandaise sauce.",
    shortDesc: "Rich and indulgent brunch classic.",
    calories: 310,
    ingredients: "Eggs, English muffins, ham, butter, lemon juice, vinegar",
    prep: "Poach eggs, toast muffins, layer with ham, pour hollandaise sauce.",
    origin: "Created in New York in the late 1800s.",
    img: "https://www.allrecipes.com/thmb/QVMaPhXnj1HQ70C7Ka9WYtuipHg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/17205-eggs-benedict-DDMFS-4x3-a0042d5ae1da485fac3f468654187db0.jpg",
  },
  {
    id: "pancakes",
    name: "Buttermilk Pancakes",
    price: 180,
    category: "Brunch",
    desc: "Fluffy pancakes served with butter and maple syrup.",
    shortDesc: "Sweet and soft breakfast treat.",
    calories: 350,
    ingredients: "Flour, eggs, buttermilk, sugar, baking powder",
    prep: "Mix ingredients, pour batter on griddle, cook until golden.",
    origin: "Popularized in North America as a staple breakfast dish.",
    img: "https://www.allrecipes.com/thmb/UXv_24LIE376MRgVvZDBJKa856w=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/24530-ButtermilkPancakes-II-mfs-4X3-3385-b9e08648074145d18c538731c2be4215.jpg",
  },
  {
    id: "quiche-lorraine",
    name: "Quiche Lorraine",
    price: 280,
    category: "Brunch",
    desc: "Savory French tart with bacon, cheese, and creamy custard filling.",
    shortDesc: "Rich and savory tart.",
    calories: 450,
    ingredients: "Pie crust, eggs, cream, bacon, cheese",
    prep: "Blind bake crust, prepare custard with eggs and cream, add bacon and cheese, bake until set.",
    origin: "Traditional dish from the Lorraine region of France.",
    img: "https://natashaskitchen.com/wp-content/uploads/2019/11/Classic-Quiche-Lorraine-Recipe-Beautiful-flaky-pastry-crust-is-paired-with-a-delicious-savory-egg-custard.-Perfect-for-breakfast-or-brunch.-1-4.jpg",
  },
];

const CATEGORIES = ["All", "Favorites", "Coffee", "Bakery", "Brunch"];

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

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const newOrderNumber = Math.floor(1000 + Math.random() * 9000);
    setOrderNumber(newOrderNumber);

    const newOrder = {
      orderNumber: newOrderNumber,
      date: new Date().toLocaleString(),
      items: cart,
      total: totalPrice,
    };
    setOrderHistory((prev) => [newOrder, ...prev]);

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
          alert(`Order #${order.orderNumber} added to cart!`);
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
      />

      <OrderProgressModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        orderNumber={orderNumber}
        theme={theme}
      />
    </div>
  );
}
