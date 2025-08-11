import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import { SiZomato } from "react-icons/si";
import { FaSun, FaMoon } from "react-icons/fa";
import OrderProgressModal from "./OrderProgressModal";

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

const CATEGORIES = ["All", "Coffee", "Bakery", "Brunch"];

export default function CafeRustic() {
  // UI state
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [cartOpen, setCartOpen] = useState(false); // controls bottom panel expanded/collapsed
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cafe_cart_v2");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Failed to read cart from localStorage", e);
      return [];
    }
  });

  const [theme, setTheme] = useState(() => {
    // Load from localStorage or default to 'light'
    return localStorage.getItem("theme") || "light";
  });

  // Apply theme class to html tag
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Keyboard escape closes modal
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setSelectedItem(null);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cafe_cart_v2", JSON.stringify(cart));
    } catch (e) {
      console.warn("Could not persist cart", e);
    }
  }, [cart]);

  // Filtering
  const filtered = MENU.filter(
    (item) =>
      (category === "All" || item.category === category) &&
      (item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase()) ||
        item.shortDesc.toLowerCase().includes(query.toLowerCase()))
  );

  // Cart helpers
  function addToCart(menuItem, qty = 1) {
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
    setCartOpen(true); // open cart when adding
  }

  function incQty(id) {
    setCart((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it))
    );
  }
  function decQty(id) {
    setCart((prev) => {
      const found = prev.find((it) => it.id === id);
      if (!found) return prev;
      if (found.qty <= 1) return prev.filter((it) => it.id !== id);
      return prev.map((it) => (it.id === id ? { ...it, qty: it.qty - 1 } : it));
    });
  }
  function removeItem(id) {
    setCart((prev) => prev.filter((it) => it.id !== id));
  }
  function clearCart() {
    setCart([]);
  }

  const totalPrice = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const totalCalories = cart.reduce(
    (s, it) => s + (it.calories || 0) * it.qty,
    0
  );
  const cartCount = cart.reduce((s, it) => s + it.qty, 0);

  // helper to format INR
  const formatINR = (n) => `₹${n}`;


function handleCheckout() {
    console.log("Cart items before checkout:", cart);
  clearCart();
  setOrderModalOpen(true);
  setCartOpen(false);
}

  return (
    <div
      className={`min-h-screen font-sans ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* NAV */}
      <nav
        className={`${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } fixed w-full z-30 bg-opacity-60 backdrop-blur-md`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl"
             
            >
              <img
               src="/images/cafelogo.png"
              alt="Logo"
              className="w-8 h-8 object-cover"
              />
            </div>
            <div className="text-lg font-semibold">Café Rustic</div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#home" className="hover:underline">
              Home
            </a>
            <a href="#about" className="hover:underline">
              About
            </a>
            <a href="#menu" className="hover:underline">
              Menu
            </a>
            <a href="#contact" className="hover:underline">
              Contact
            </a>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-lg  hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </button>
          </div>

          <div className="md:hidden">☰</div>
        </div>
      </nav>

      {/* HERO */}
      <header id="home" className="relative h-96 md:h-screen overflow-hidden">
        <img
          alt="Cafe interior"
          src="/images/cafebackground.png"
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 h-full flex flex-col justify-center items-start text-white">
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg"
          >
            Welcome to <span className="text-amber-300">Café Rustic</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-md md:text-xl max-w-xl"
          >
            A cozy corner for coffee lovers — local beans, fresh bakes, and
            friendly vibes.
          </motion.p>

          <motion.div
            className="mt-6 flex gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <a
              href="#menu"
              className="inline-block px-4 py-2 rounded-lg shadow-lg bg-amber-400 font-semibold text-brown-900"
            >
              View Menu
            </a>
            <a
              href="#contact"
              className="inline-block px-4 py-2 rounded-lg border border-white/30"
            >
              Book a Table
            </a>
          </motion.div>
        </div>
      </header>

      {/* ABOUT */}
      <section id="about" className="py-12">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">About Us</h2>
            <p className="mt-4 text-gray-700">
              We roast locally and prepare each cup with care. Our pastries
              arrive fresh from the oven every morning. Sit back, relax, and
              enjoy free Wi-Fi and a friendly atmosphere.
            </p>

            <ul className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <li>✔️ Single origin beans</li>
              <li>✔️ Freshly baked goods</li>
              <li>✔️ Cozy seating & power outlets</li>
              <li>✔️ Outdoor seating</li>
            </ul>
          </div>

          <motion.div
            className="rounded-xl overflow-hidden shadow-lg"
            whileHover={{ scale: 1.03 }}
          >
            <img
              alt="barista"
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=60"
              className="w-full h-64 object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* MENU */}
      <section
        id="menu"
        className={`py-8 ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Our Menu</h2>
              <p
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                } mt-1`}
              >
                Curated drinks and bites — updated seasonally.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full ${
                    category === cat
                      ? "bg-amber-300"
                      : theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-4 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search menu..."
              className={`flex-1 px-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-800"
              }`}
            />
            <div className="md:hidden">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                className={`${
                  theme === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-50 text-gray-800"
                } rounded-xl overflow-hidden shadow-md`}
                whileHover={{
                  y: -6,
                  boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
                }}
                layout
              >
                <img
                  alt={item.name}
                  src={item.img}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p
                        className={`${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        } mt-1`}
                      >
                        {item.shortDesc}
                      </p>
                    </div>
                    <div className="text-amber-500 font-bold">
                      {formatINR(item.price)}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      className="px-3 py-2 rounded-md bg-amber-400 font-semibold"
                      onClick={() => addToCart(item)}
                    >
                      Add
                    </button>
                    <button
                      className={`px-3 py-2 rounded-md border ${
                        theme === "dark" ? "border-gray-600" : "border-gray-300"
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      Details
                    </button>
                    <div
                      className={`ml-auto text-sm hidden sm:block ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {item.calories} kcal
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className={`py-12 ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
        }`}
      >
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold">Contact & Bookings</h2>
          <p
            className={`${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            } mt-2`}
          >
            Drop us a message or reserve a table.
          </p>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thanks! We received your message (demo only).");
              }}
              className="space-y-4"
            >
              {["Your name", "Email", "Phone (optional)"].map(
                (placeholder, idx) => (
                  <input
                    key={idx}
                    required={idx < 2}
                    type={placeholder === "Email" ? "email" : "text"}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  />
                )
              )}
              <textarea
                placeholder="Message"
                className={`w-full px-4 py-3 rounded-lg border h-28 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
              ></textarea>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-amber-400 font-semibold"
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => alert("Demo: Call +91-98765-43210")}
                  className={`px-6 py-3 rounded-lg border ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  }`}
                >
                  Call Us
                </button>
              </div>
            </form>

            <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe
                title="map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019944013676!2d144.95373531531602!3d-37.81627917975108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d43f1f1f1f1%3A0x1!2sCoffee!5e0!3m2!1sen!2sin!4v1610000000000"
                className="w-full h-full min-h-[360px] border-0"
              />
            </div>
          </div>
        </div>
      </section>
      {/* REVIEWS */}
      <section
        id="reviews"
        className={`py-12 ${
          theme === "dark"
            ? "bg-gray-800 text-white"
            : "bg-gray-50 text-gray-800"
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold">Loved your visit? 🌟</h2>
          <p
            className={`mt-2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Share your experience and help others discover Café Rustic!
          </p>

          {/* STAR RATING */}
          <div className="flex items-center justify-center gap-1 mt-4 text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i}>★</span>
            ))}
            <span
              className={`${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              } ml-2`}
            >
              (4.6 / 5)
            </span>
          </div>

          {/* REVIEW BUTTONS */}
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://www.zomato.com/<city>/<restaurant-name>/reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
            >
              <SiZomato size={20} /> Review on Zomato
            </a>
            <a
              href="https://search.google.com/local/writereview?placeid=<YOUR_PLACE_ID>"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
            >
              <FaGoogle size={20} /> Review on Google
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>📍 Café Rustic — 123 Main Street, Your City</div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-600 transition-colors"
            >
              <FaInstagram />
            </a>

            <a
              href="https://www.facebook.com/yourprofile"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-800 transition-colors"
            >
              <FaFacebook />
            </a>

            <a
              href="https://twitter.com/yourprofile"
              aria-label="Twitter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-500 transition-colors"
            >
              <FaTwitter />
            </a>
          </div>
        </div>
      </footer>

      {/* DETAILS MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              className={`p-6 rounded-lg max-w-3xl w-full mx-4 overflow-y-auto max-h-[90vh] ${
                theme === "dark"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-800"
              }`}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={selectedItem.img}
                  alt={selectedItem.name}
                  className="w-full md:w-1/2 rounded-lg object-cover max-h-72"
                />
                <div>
                  <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                  <p
                    className={`mt-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {selectedItem.desc}
                  </p>
                  <p className="mt-3 font-semibold">
                    Calories: {selectedItem.calories} kcal
                  </p>
                  <p className="mt-1 text-lg">
                    Price: {formatINR(selectedItem.price)}
                  </p>

                  <div className="mt-4">
                    <h3 className="font-semibold">Ingredients</h3>
                    <p
                      className={`${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {selectedItem.ingredients}
                    </p>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-semibold">Preparation</h3>
                    <p
                      className={`${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {selectedItem.prep}
                    </p>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-semibold">Origin</h3>
                    <p
                      className={`${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {selectedItem.origin}
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        addToCart(selectedItem);
                        setSelectedItem(null);
                      }}
                      className={`px-4 py-2 rounded border ${
                        theme === "dark"
                          ? "border-gray-600 hover:bg-gray-700"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING CART BUTTON */}
      {!cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed top-1/2 right-4 -translate-y-1/2 z-50 flex flex-col items-center justify-center bg-amber-500 text-white rounded-full w-14 h-14 shadow-lg hover:bg-amber-600 transition-colors"
        >
          🛒
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {cartCount}
            </span>
          )}
        </button>
      )}

      {/* SLIDE-OUT CART PANEL */}
      <div
        className={`fixed top-0 right-0 h-full z-50 shadow-xl border-l transition-transform duration-300 ease-in-out ${
          theme === "dark"
            ? "bg-gray-900 border-gray-700 text-white"
            : "bg-white border-gray-200 text-gray-800"
        } ${
          cartOpen
            ? "translate-x-0 w-80"
            : "translate-x-full w-0 overflow-hidden"
        }`}
      >
        {cartOpen && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div
              className={`flex items-center justify-between p-4 border-b ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <h2 className="font-bold text-lg">Your Cart</h2>
              <button
                onClick={() => setCartOpen(false)}
                className={`${
                  theme === "dark"
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ❯
              </button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-auto p-4">
              {cart.length === 0 ? (
                <div
                  className={`text-center mt-10 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No items in cart.
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((it) => (
                    <div key={it.id} className="flex items-center gap-3">
                      <img
                        src={it.image}
                        alt={it.name}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-semibold">{it.name}</div>
                            <div
                              className={`text-sm ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              {it.calories} kcal
                            </div>
                          </div>
                          <div className="font-bold">
                            {formatINR(it.price * it.qty)}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            className={`px-2 py-1 rounded-md border text-sm ${
                              theme === "dark"
                                ? "border-gray-600 hover:bg-gray-700"
                                : "border-gray-300 hover:bg-gray-100"
                            }`}
                            onClick={() => decQty(it.id)}
                          >
                            -
                          </button>
                          <div
                            className={`px-3 py-1 border rounded text-sm ${
                              theme === "dark"
                                ? "border-gray-600"
                                : "border-gray-300"
                            }`}
                          >
                            {it.qty}
                          </div>
                          <button
                            className={`px-2 py-1 rounded-md border text-sm ${
                              theme === "dark"
                                ? "border-gray-600 hover:bg-gray-700"
                                : "border-gray-300 hover:bg-gray-100"
                            }`}
                            onClick={() => incQty(it.id)}
                          >
                            +
                          </button>
                          <button
                            className="ml-auto text-sm text-red-500 hover:text-red-600"
                            onClick={() => removeItem(it.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div
                className={`p-4 border-t ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between mb-3">
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Total Calories
                  </span>
                  <span className="font-bold">{totalCalories} kcal</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Total
                  </span>
                  <span className="font-extrabold text-xl">
                    {formatINR(totalPrice)}
                  </span>
                </div>
                <button
                  className="w-full px-4 py-3 rounded-md bg-amber-500 text-white font-semibold"
                  onClick={handleCheckout}
                >
                  Checkout
                </button>
                <button
                  className={`mt-3 w-full px-4 py-3 rounded-md border ${
                    theme === "dark"
                      ? "border-gray-600 hover:bg-gray-700"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={clearCart}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
  @media (max-width: 767px) {
    nav div.md\\:hidden {
      display: block;
    }
  }
`}</style>


<OrderProgressModal
  isOpen={orderModalOpen}
  onClose={() => setOrderModalOpen(false)}
/>
    </div>
  );
}
