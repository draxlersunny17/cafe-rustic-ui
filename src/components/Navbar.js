import React, { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

export default function Navbar({
  theme,
  toggleTheme,
  setMenuOpen,
  menuOpen,
  userProfile,
  setProfileOpen,
  setSignInOpen,
}) {
  const [greeting, setGreeting] = useState("");
  const [loadingGreeting, setLoadingGreeting] = useState(false);
  const firstName = userProfile?.name ? userProfile.name.split(" ")[0] : "";

  const menuItems = [
    { name: "Home", id: "home" },
    { name: "About", id: "about" },
    { name: "Menu", id: "menu" },
    { name: "Contact", id: "contact" },
  ];
  const Loader = () => (
    <span className="flex gap-1 items-end h-6">
      <span className="w-1.5 rounded-sm animate-[wave_1.2s_infinite_ease-in-out] bg-gradient-to-t from-amber-600 to-amber-300"></span>
      <span className="w-1.5 rounded-sm animate-[wave_1.2s_infinite_ease-in-out_0.2s] bg-gradient-to-t from-amber-600 to-amber-300"></span>
      <span className="w-1.5 rounded-sm animate-[wave_1.2s_infinite_ease-in-out_0.4s] bg-gradient-to-t from-amber-600 to-amber-300"></span>
      <span className="w-1.5 rounded-sm animate-[wave_1.2s_infinite_ease-in-out_0.6s] bg-gradient-to-t from-amber-600 to-amber-300"></span>
      <span className="w-1.5 rounded-sm animate-[wave_1.2s_infinite_ease-in-out_0.8s] bg-gradient-to-t from-amber-600 to-amber-300"></span>
      <style>{`
        @keyframes wave {
          0%,
          100% {
            height: 20%;
          }
          50% {
            height: 100%;
          }
        }
        .animate-[wave_1.2s_infinite_ease-in-out] {
          animation: wave 1.2s infinite ease-in-out;
        }
        .animate-[wave_1.2s_infinite_ease-in-out_0.2s] {
          animation: wave 1.2s infinite ease-in-out 0.2s;
        }
        .animate-[wave_1.2s_infinite_ease-in-out_0.4s] {
          animation: wave 1.2s infinite ease-in-out 0.4s;
        }
        .animate-[wave_1.2s_infinite_ease-in-out_0.6s] {
          animation: wave 1.2s infinite ease-in-out 0.6s;
        }
        .animate-[wave_1.2s_infinite_ease-in-out_0.8s] {
          animation: wave 1.2s infinite ease-in-out 0.8s;
        }
      `}</style>
    </span>
  );

  useEffect(() => {
    const fetchGreeting = async () => {
      setLoadingGreeting(true);
      try {
        const res = await fetch("/api/aiMenuAssistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Give me one short, fun, café-style greeting with the name "${firstName}" inside it. 
                - Keep it casual, friendly, and playful — not formal. 
                - Use coffee/café vibes (puns, warmth, energy, coziness). 
                - Keep it under 8 words. 
                - Make it feel like a barista greeting. 
                - Examples: "Latte vibes, ${firstName}!" | "Bean waiting for you, ${firstName}!" | "Good to see you, ${firstName}!" | "Espresso yourself, ${firstName}!"`,
              },
            ],
            menuItems: [],
            context: "greeting",
          }),
        });

        const data = await res.json();
        if (data.reply) {
          setGreeting(data.reply.replace(/###ACTION###[\s\S]*/g, ""));
        } else {
          setGreeting(`Welcome, ${firstName}!`);
        }
      } catch (err) {
        console.error("Greeting AI failed:", err);
        setGreeting(`Welcome, ${firstName}!`);
      } finally {
        setLoadingGreeting(false); // stop loader
      }
    };

    if (firstName) fetchGreeting();
  }, [firstName]);

  return (
    <nav
      className={`${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      } fixed w-full z-30 bg-opacity-60 backdrop-blur-md`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Greeting */}
        <div className="flex items-center gap-3">
          <img
            src="/images/cafelogo.png"
            alt="Logo"
            className="w-8 h-8 object-cover"
          />
          <div className="text-lg font-semibold flex flex-col sm:flex-row sm:flex-wrap sm:items-center">
            Café Rustic
            {firstName && (
              <span
                className={`mt-1 sm:mt-0 sm:ml-3 text-sm font-medium italic flex items-center gap-1
        ${
          theme === "dark" ? "text-amber-300 drop-shadow-sm" : "text-amber-700"
        }`}
              >
                {loadingGreeting ? <Loader /> : greeting}
              </span>
            )}
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                const el = document.getElementById(item.id);
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:underline"
            >
              {item.name}
            </button>
          ))}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>

          {/* Profile / Sign In */}
          <button
            onClick={() => {
              userProfile ? setProfileOpen(true) : setSignInOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-amber-400 text-gray-900 font-semibold"
          >
            {userProfile ? "Profile" : "Sign In"}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          {/* Theme Toggle on Mobile */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>

          {/* Hamburger Button */}
          <div
            className="cursor-pointer text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div
          className={`md:hidden px-6 pb-4 flex flex-col gap-3 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                const el = document.getElementById(item.id);
                if (el) el.scrollIntoView({ behavior: "smooth" });
                setMenuOpen(false);
              }}
              className="text-left hover:underline"
            >
              {item.name}
            </button>
          ))}

          {/* Profile / Sign In Button on Mobile */}
          <button
            onClick={() => {
              userProfile ? setProfileOpen(true) : setSignInOpen(true);
              setMenuOpen(false);
            }}
            className="px-4 py-2 rounded-lg bg-amber-400 text-gray-900 font-semibold mt-2"
          >
            {userProfile ? "Profile" : "Sign In"}
          </button>
        </div>
      )}
    </nav>
  );
}
