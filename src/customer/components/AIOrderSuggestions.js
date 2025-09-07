// components/AIOrderSuggestions.js
import React, { useEffect, useState, useMemo, useRef } from "react";
import { Coffee, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import CoffeeSipLoader from "../../loaders/CoffeeSipLoader";

const headingTemplates = [
  (item) => `Because you love ${item}…`,
  (item) => `Your ${item} obsession inspired these picks ✨`,
  (item) => `Craving something beyond ${item}?`,
  (item) => `Since you’re a fan of ${item}…`,
  (item) => `Inspired by your taste for ${item} ☕`,
  (item) => `People who enjoy ${item} often love these too…`,
  (item) => `A perfect match for your ${item} cravings 😋`,
  (item) => `If ${item} is your vibe, you’ll love these 💛`,
  (item) => `Let’s pair your ${item} love with something new 🍰`,
  (item) => `Taking your ${item} journey to the next level…`,
  (item) => `Here’s what complements ${item} perfectly 🌟`,
  (item) => `Our baristas suggest these with ${item}…`,
  (item) => `Because life’s better with ${item} and friends 🥂`,
  (item) => `Since ${item} is your go-to, how about these?`,
  (item) => `${item} lovers often can’t resist these picks 🔥`,
];

export default function AIOrderSuggestions({
  orderHistory,
  menuItems,
  theme,
  onAddToCart,
}) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [, setSuggestedItems] = useState([]);
  // Define heading templates

  // ✅ Prevent multiple API calls in StrictMode
  const hasFetched = useRef(false);

  // ✅ Pick a "favorite" dynamically (rotates daily)
  const topItem = useMemo(() => {
    if (!orderHistory || orderHistory.length === 0) return null;
    const counts = {};
    orderHistory.forEach((order) => {
      order.items.forEach((item) => {
        counts[item.name] = (counts[item.name] || 0) + item.qty;
      });
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) return null;

    const dayIndex = new Date().getDate() % sorted.length;
    return sorted[dayIndex][0];
  }, [orderHistory]);

  const dynamicHeading = useMemo(() => {
    if (!topItem) return "Barista’s Picks Just for You";
    const index = Math.floor(Math.random() * headingTemplates.length);
    return headingTemplates[index](topItem);
  }, [topItem]);
  useEffect(() => {
    if (!orderHistory || orderHistory.length === 0) return;
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/aiMenuAssistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content:
                  "Based on my past order history, what menu items would you recommend I try next? Please mention the item names clearly.",
              },
            ],
            menuItems,
            orderHistory,
            context: "recommendations",
          }),
        });

        const data = await res.json();
        if (data.reply) {
          setSuggestions(data.reply);

          const detected = menuItems.filter((item) =>
            data.reply.toLowerCase().includes(item.name.toLowerCase())
          );
          setSuggestedItems(detected);
        }
      } catch (err) {
        console.error("AI Suggestion error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [orderHistory, menuItems]);

  if (!orderHistory || orderHistory.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`mt-6 mb-10 p-6 shadow-2xl backdrop-blur-md ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-800/90 to-gray-900/90 text-white"
          : "bg-gradient-to-br from-amber-50 to-yellow-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="w-7 h-7 text-yellow-500 drop-shadow-md" />
        </motion.div>
        <h2
          className={`text-2xl font-extrabold tracking-wide ${
            theme === "dark"
              ? "bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent"
              : "bg-gradient-to-r from-yellow-700 to-orange-500 bg-clip-text text-transparent"
          }`}
        >
          {dynamicHeading}
        </h2>
      </div>

      {/* Suggestions */}
      {loading ? (
        <CoffeeSipLoader
          size={200}
          theme={theme}
          message="Brewing personalized picks..."
          className="drop-shadow-lg"
        />
      ) : (
        <div className="space-y-6">
          {suggestions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className={`p-5 rounded-2xl shadow-inner leading-relaxed text-sm ${
                theme === "dark"
                  ? "bg-gray-800/70 border border-gray-700"
                  : "bg-white/80 border border-amber-200"
              }`}
            >
              <div className="flex items-start gap-2">
                <Coffee className="w-5 h-5 mt-1 text-brown-600 dark:text-amber-400" />
                <p>{suggestions}</p>
              </div>
            </motion.div>
          )}

          {/* {suggestedItems.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {suggestedItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`rounded-2xl overflow-hidden shadow-lg flex flex-col ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-32 w-full object-cover"
                    />
                  )}
                  <div className="p-5 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="text-lg font-bold tracking-wide mb-2">
                        {item.name}
                      </h3>

                      {item.short_desc && (
                        <p
                          className={`text-sm leading-relaxed mb-3 ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {item.short_desc}
                        </p>
                      )}

                      {item.price && (
                        <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                          ₹{item.price}
                        </p>
                      )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>

                    <button
                      onClick={() => onAddToCart(item, 1)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full 
               bg-gradient-to-r from-green-500 to-emerald-600 
               text-white text-sm font-semibold shadow-md hover:shadow-lg 
               hover:from-green-600 hover:to-emerald-700 transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )} */}
        </div>
      )}
    </motion.div>
  );
}
