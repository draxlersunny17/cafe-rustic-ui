// src/FeedbackModal.js
import { motion, AnimatePresence } from "framer-motion";
import FeedbackForm from "../components/FeedbackForm";

export default function FeedbackModal({ isOpen, onClose, theme = "light", userProfile }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl ${
              theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
            }`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            {/* Feedback Form */}
            <div className="p-6">
              <FeedbackForm isModal theme={theme} userProfile={userProfile} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
