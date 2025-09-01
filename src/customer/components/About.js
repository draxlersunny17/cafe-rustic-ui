import React from "react";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-12">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">About Us</h2>
          <p className="mt-4 text-gray-700">
            We roast locally and prepare each cup with care. Our pastries arrive
            fresh from the oven every morning. Sit back, relax, and enjoy free
            Wi-Fi and a friendly atmosphere.
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
  );
}
