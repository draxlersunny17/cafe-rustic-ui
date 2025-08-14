import React from "react";
import { SiZomato } from "react-icons/si";
import { FaGoogle } from "react-icons/fa";

const REVIEWS = [
  {
    name: "Ananya",
    text: "Best cappuccino in town! Cozy vibe and friendly staff.",
  },
  { name: "Rohit", text: "Avocado toast was spot on. Will come again." },
  { name: "Meera", text: "Love their muffins and playlists!" },
];

export default function Reviews({ theme }) {
  return (
    <section
      id="reviews"
      className={`py-16 ${
        theme === "dark" ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 text-center">
        {/* HEADER */}
        <h2 className="text-3xl font-bold">Loved your visit? 🌟</h2>
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

        {/* CUSTOMER REVIEWS */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
          {REVIEWS.map((r, i) => (
            <div
              key={i}
              className={`rounded-xl border p-5 transition-colors duration-300
        ${
          theme === "dark"
            ? "bg-gray-900 border-gray-800 text-white"
            : "bg-white border-gray-200 text-gray-800"
        }`}
            >
              <div className="font-semibold">{r.name}</div>
              <p
                className={`mt-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {r.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
