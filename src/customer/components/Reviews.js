import React, { useEffect, useState } from "react";
import { SiZomato } from "react-icons/si";
import { FaGoogle } from "react-icons/fa";
import { fetchFeedback } from "../../service/supabaseApi";

export default function Reviews({ theme, onGiveFeedback }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const loadFeedback = async () => {
      const data = await fetchFeedback();
      setFeedbacks(data);

      if (data.length > 0) {
        const avg =
          data.reduce((sum, f) => sum + (f.rating || 0), 0) / data.length;
        setAvgRating(avg.toFixed(1));
      }
    };
    loadFeedback();
  }, []);

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
        <div className="flex items-center justify-center gap-1 mt-4">
          {[...Array(5)].map((_, i) => {
            const fullStar = i + 1 <= Math.floor(avgRating || 0);
            const halfStar =
              !fullStar && i < (avgRating || 0) && (avgRating || 0) % 1 !== 0;

            return (
              <span key={i} className="text-yellow-400 text-xl">
                {fullStar ? "★" : halfStar ? "☆" : "☆"}
              </span>
            );
          })}
          <span
            className={`ml-2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            ({avgRating || "0.0"} / 5)
          </span>
        </div>

        {/* INVITE TO FEEDBACK */}
        <p className="mt-3 text-lg font-medium">
          ✨ Think we deserve more stars? Tell us why!
        </p>
        <button
          onClick={onGiveFeedback}
          className="mt-5 inline-flex items-center gap-2 px-6 py-2 
             rounded-full font-medium text-base
             bg-gradient-to-r from-yellow-400 to-orange-400 
             text-gray-900 shadow-md
             hover:shadow-lg hover:scale-105 transition-transform
             animate-pulse-slow"
        >
          <span className="text-lg">💬</span>
          <span>Give Feedback</span>
        </button>

        {/* REVIEW BUTTONS */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
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

        {/* CUSTOMER FEEDBACKS FROM SUPABASE */}
        <div className="mt-12 relative">
          {feedbacks.length > 0 && (
            <div className="flex items-center">
              {/* Prev Button */}
              {currentPage > 0 && (
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2 rounded-full shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  ←
                </button>
              )}

              {/* Feedback Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full px-10">
                {feedbacks
                  .slice(currentPage * 3, currentPage * 3 + 3)
                  .map((f, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border p-5 transition-colors duration-300
                ${
                  theme === "dark"
                    ? "bg-gray-900 border-gray-800 text-white"
                    : "bg-white border-gray-200 text-gray-800"
                }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold">
                          {f.name || "Anonymous"}
                        </div>
                        <div className="text-yellow-400 text-sm">
                          {"★".repeat(f.rating)}
                        </div>
                      </div>

                      <p
                        className={`mt-2 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {f.feedback}
                      </p>
                    </div>
                  ))}
              </div>

              {/* Next Button */}
              {(currentPage + 1) * 3 < feedbacks.length && (
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2 rounded-full shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
