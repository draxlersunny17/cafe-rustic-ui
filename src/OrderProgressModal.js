import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { launchConfetti } from "./utils/confetti";

// Images for steps
const defaultImage = "https://cdn-icons-png.flaticon.com/512/992/992700.png"; // fallback
const timerIcon =
  "https://media.lordicon.com/icons/wired/lineal/46-timer-stopwatch.svg";
const paymentConfirmedImage =
  "https://www.kablooe.com/wp-content/uploads/2019/08/check_mark.png";
const readyImage =
  "https://img.freepik.com/free-psd/3d-rendering-hotel-icon_23-2150102372.jpg?semt=ais_hybrid&w=740&q=80";
const foodReadyImage =
  "https://static.vecteezy.com/system/resources/previews/012/751/486/non_2x/food-preparation-icon-style-vector.jpg";

const STEPS = [
  { title: "Order Placed", img: timerIcon },
  { title: "Payment Confirmed", img: paymentConfirmedImage },
  { title: "In Preparation", img: null },
  { title: "Ready to Serve", img: readyImage },
];

// Step durations in ms
const stepDurations = [30000, 20000, 120000]; // Step 1: 30s, Step 2: 20s, Step 3: 2m
const totalTime = stepDurations.reduce((a, b) => a + b, 0); // total process time

export default function OrderProgressModal({ isOpen, onClose, theme }) {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [totalCountdown, setTotalCountdown] = useState(totalTime);



  // Reset on modal open
  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setPaused(false);
    setTotalCountdown(totalTime);
  }, [isOpen]);

  // Countdown logic
  useEffect(() => {
    if (!isOpen || paused) return;
    if (totalCountdown <= 0) return;

    const interval = setInterval(() => {
      setTotalCountdown((prev) => prev - 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [totalCountdown, paused, isOpen]);

  // Step change logic based on elapsed time
  useEffect(() => {
    if (!isOpen) return;

    const elapsed = totalTime - totalCountdown;
    let cumulative = 0;

    for (let i = 0; i < stepDurations.length; i++) {
      cumulative += stepDurations[i];
      if (elapsed < cumulative) {
        setStep(i);
        return;
      }
    }
    // Final step
    setStep(STEPS.length - 1);
  }, [totalCountdown, isOpen]);

  // Confetti on final step
  useEffect(() => {
    if (step === STEPS.length - 1 && isOpen) {
      launchConfetti();
    }
  }, [step, isOpen]);

  const bgColor =
    theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

  const Spinner = () => (
    <motion.div
      className="border-4 border-t-4 border-gray-300 border-t-amber-400 rounded-full w-16 h-16"
      animate={{ rotate: 360, scale: [1, 1.1, 1] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
    />
  );

  const formatTime = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (step >= STEPS.length - 1) {
              onClose();
            }
          }}
        >
          <motion.div
            className={`${bgColor} rounded-2xl p-8 max-w-lg w-full shadow-2xl relative`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-semibold mb-6 tracking-wide text-center select-none">
              Order Status
              {step < STEPS.length - 1 && (
                <span className="ml-4 text-lg font-mono text-amber-500">
                  {formatTime(totalCountdown)}
                </span>
              )}
            </h2>

             {/* Cancel Order button */}
            {/* {step < 2 && (
              <div className="mb-4 text-center">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 rounded-full font-semibold bg-red-500 hover:bg-red-600 text-white shadow-md transition-colors duration-300"
                >
                  Cancel Order
                </button>
              </div>
            )} */}

            {/* Progress Bar */}
            <div className="flex items-center mb-8">
              {STEPS.map((s, idx) => {
                const isActive = idx === step;
                const isCompleted =
                  idx < step || (s.title === "Ready to Serve" && step >= 3);

                return (
                  <React.Fragment key={s.title}>
                    <div className="flex flex-col items-center relative z-10 cursor-default select-none">
                      <motion.div
                        layout
                        initial={false}
                        animate={{
                          background: isCompleted
                            ? "linear-gradient(135deg, #4ade80, #22c55e)"
                            : isActive
                            ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                            : "#e5e7eb",
                          scale: isActive ? 1.2 : 1,
                          boxShadow: isActive
                            ? "0 0 15px rgba(251,191,36,0.7)"
                            : "none",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-gray-300"
                      >
                        {isActive ? (
                          s.title === "Order Placed" ||
                          s.title === "Payment Confirmed" ? (
                            <Spinner />
                          ) : s.title === "In Preparation" && !paused ? (
                            <motion.div
                              className="relative w-12 h-12 flex items-center justify-center rounded-full overflow-hidden bg-gray-100"
                              animate={{ rotate: 360 }}
                              transition={{
                                repeat: Infinity,
                                duration: 6,
                                ease: "linear",
                              }}
                            >
                              <img
                                src={defaultImage}
                                alt="Preparing"
                                className="w-8 h-8 rounded-full border border-white"
                              />
                            </motion.div>
                          ) : s.img ? (
                            <img
                              src={
                                paused && s.title === "In Preparation"
                                  ? foodReadyImage
                                  : s.img
                              }
                              alt={s.title}
                              className="w-10 h-10 rounded-full object-cover border border-white"
                            />
                          ) : (
                            <img
                              src={defaultImage}
                              alt={s.title}
                              className="w-10 h-10 rounded-full object-cover border border-white"
                            />
                          )
                        ) : isCompleted ? (
                          <img
                            src={
                              s.title === "In Preparation"
                                ? foodReadyImage
                                : s.img || defaultImage
                            }
                            alt={s.title}
                            className="w-10 h-10 rounded-full object-cover border border-white"
                          />
                        ) : (
                          <img
                            src={defaultImage}
                            alt={s.title}
                            className="w-10 h-10 rounded-full object-cover border border-gray-300"
                          />
                        )}
                      </motion.div>
                      <span
                        className={`mt-2 text-sm font-semibold select-none text-center w-full ${
                          isCompleted
                            ? "text-green-600"
                            : isActive
                            ? "text-amber-500"
                            : "text-gray-400"
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>

                    {idx !== STEPS.length - 1 && (
                      <motion.div
                        layout
                        initial={false}
                        animate={{
                          background: idx < step ? "#ffffff" : "#f3f4f6",
                        }}
                        className="flex-1 h-1 rounded-full mx-3 mt-6"
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Pause/Resume for In Preparation */}
            {step === 2 && (
              <div className="text-center mb-4">
                <button
                  onClick={() => setPaused(!paused)}
                  className={`inline-block px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${
                    paused
                      ? "bg-green-500 hover:bg-green-600 text-white shadow-lg"
                      : "bg-amber-400 hover:bg-amber-500 text-white shadow-md"
                  }`}
                >
                  {paused ? "Resume Preparation" : "Pause Preparation"}
                </button>
              </div>
            )}

            {/* Close on last step */}
            {step >= STEPS.length - 1 && (
              <button
                onClick={onClose}
                className="w-full mt-6 px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg transition-colors"
              >
                Close
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
