import React from "react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <header id="home" className="relative h-96 md:h-screen overflow-hidden">
      <img
        src="/images/cafebackground.png"
        alt="Cafe interior"
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
  );
}
