// components/OrderProgressModal.js
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../service/supabaseClient";
import { updateOrder } from "../../service/supabaseApi";
import { launchConfetti } from "../../utils/confetti";
import { Check } from "lucide-react";

// Images / icons (keep your existing ones or replace)
const defaultImage = "https://cdn-icons-png.flaticon.com/512/992/992700.png";
const readyImage =
  "https://img.freepik.com/free-psd/3d-rendering-hotel-icon_23-2150102372.jpg?semt=ais_hybrid&w=740&q=80";
const foodReadyImage =
  "https://static.vecteezy.com/system/resources/previews/012/751/486/non_2x/food-preparation-icon-style-vector.jpg";

const STEPS = ["Order Placed", "In Preparation", "Completed"];

// default durations (ms) for auto-advance for each step except Completed
const STEP_DURATIONS = [30_000, 240_000];

export default function OrderProgressModal({
  isOpen,
  onClose,
  orderNumber,
  theme = "light",
}) {
  const [order, setOrder] = useState(null);
  const [remaining, setRemaining] = useState(null); // ms left for current step (for UI)
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const subRef = useRef(null);

  const bgColor =
    theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

  const getStepIndex = (status) => {
    const idx = STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRemaining(null);
  };

  // Start the timer for the current step (auto-advance after duration)
  const startTimerForStep = (stepIndex) => {
    clearTimers();
    if (stepIndex >= STEP_DURATIONS.length) {
      // Completed or no further step
      return;
    }
    let duration = STEP_DURATIONS[stepIndex];

    // If in preparation and staff set prep_time, override duration
    if (order?.status === "In Preparation" && order?.prep_time) {
      duration = order.prep_time * 60 * 1000; // minutes → ms
    }

    setRemaining(duration);

    // Interval to update remaining every second
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (!prev || prev <= 1000) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    // Timeout to auto-advance when the duration finishes
    timeoutRef.current = setTimeout(async () => {
      try {
        // fetch current stepIndex from order (in case it changed)
        const current = getStepIndex(order?.status);
        if (current < STEPS.length - 1) {
          const nextStatus = STEPS[current + 1];
          // Persist the next status to DB (will be reflected by realtime subscription)
          await updateOrder(order.id, { status: nextStatus });
        }
      } catch (err) {
        console.error("Auto-advance update failed:", err);
      }
    }, duration);
  };

  // Whenever order changes, update timers & UI
  useEffect(() => {
    if (!order) return;
    // If paused, stop timers
    if (order.paused) {
      clearTimers();
      return;
    }

    // If order has a status that can auto-advance, start the timer
    const idx = getStepIndex(order.status);
    // If the order just reached final step, show confetti
    if (idx === STEPS.length - 1) {
      clearTimers();
      launchConfetti();
      setRemaining(0);
      return;
    }

    startTimerForStep(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  // Fetch order once and subscribe to realtime changes for that order_number
  useEffect(() => {
    if (!isOpen || !orderNumber) return;

    let mounted = true;

    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("order_number", orderNumber)
          .single();

        if (!error && mounted) {
          setOrder(data);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      }
    };

    fetchOrder();

    // subscribe
    const channel = supabase
      .channel(`order-progress-${orderNumber}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `order_number=eq.${orderNumber}`,
        },
        (payload) => {
          // payload.new contains the updated row
          if (payload && payload.new) {
            setOrder(payload.new);
          }
        }
      )
      .subscribe((status) => {
        // optional: log status = "SUBSCRIBED"
        // console.log("Order subscription status:", status);
      });

    subRef.current = channel;

    return () => {
      mounted = false;
      // cleanup
      clearTimers();
      if (subRef.current) supabase.removeChannel(subRef.current);
      subRef.current = null;
    };
  }, [isOpen, orderNumber]);

  const formatTime = (ms) => {
    if (ms == null) return "--:--";
    const s = Math.max(0, Math.floor(ms / 1000));
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            // allow close only when finished
            if (order?.status === "Completed") onClose();
          }}
        >
          <motion.div
            className={`${bgColor} rounded-2xl p-6 max-w-xl w-full shadow-2xl relative`}
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-semibold">
                Order #{order?.order_number ?? "—"}
              </h2>
              <div className="text-sm text-gray-500">
                {order?.date ? new Date(order.date).toLocaleString() : ""}
              </div>
            </div>

            <div className="mt-6">
              {/* Progress */}
              <div className="flex items-center mb-6">
                {STEPS.map((title, idx) => {
                  const isActive = order
                    ? idx === getStepIndex(order.status)
                    : idx === 0;
                  // isCompleted should be true for all steps before the current, and also for the current step if status is 'Completed'
                  let isCompleted = false;
                  if (order) {
                    if (order.status === "Completed") {
                      isCompleted = true;
                    } else {
                      isCompleted = idx < getStepIndex(order.status);
                    }
                  }

                  return (
                    <React.Fragment key={title}>
                      <div className="flex flex-col items-center z-10">
                        <motion.div
                          layout
                          initial={false}
                          animate={{
                            background: isCompleted
                              ? "linear-gradient(135deg,#4ade80,#22c55e)"
                              : isActive
                              ? "linear-gradient(135deg,#fbbf24,#f59e0b)"
                              : "#e5e7eb",
                            scale: isActive ? 1.12 : 1,
                          }}
                          className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-gray-300"
                        >
                          {isCompleted && title !== "Completed" ? (
                            // ✅ For completed "Order Placed" and "In Preparation"
                            <span className="p-[9px] bg-white rounded-[21px] text-black text-2xl flex items-center justify-center">
                              <Check className="w-5 h-5" strokeWidth={3} />
                            </span>
                          ) : (
                            // 🖼 For active or not-yet-completed steps + Completed final image
                            <img
                              src={
                                title === "In Preparation" && order?.paused
                                  ? foodReadyImage
                                  : title === "Completed"
                                  ? readyImage
                                  : defaultImage
                              }
                              alt={title}
                              className={`w-10 h-10 rounded-full object-cover border border-white ${
                                isActive && !isCompleted && !order?.paused
                                  ? "animate-[spin_6s_linear_infinite]"
                                  : ""
                              }`}
                            />
                          )}
                        </motion.div>
                        <span
                          className={`mt-2 text-sm font-semibold text-center ${
                            isCompleted
                              ? "text-green-600"
                              : isActive
                              ? "text-amber-500"
                              : "text-gray-400"
                          }`}
                        >
                          {title}
                        </span>
                      </div>

                      {idx !== STEPS.length - 1 && (
                        <motion.div
                          layout
                          initial={false}
                          animate={{
                            background:
                              order && idx < getStepIndex(order.status)
                                ? "#4ade80"
                                : "#f3f4f6",
                          }}
                          className="flex-1 h-1 rounded-full mx-3 -mt-6"
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Remaining countdown / paused notice */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-medium">{order?.status ?? "—"}</div>
                </div>

                <div className="text-right">
                  {!order?.paused ? (
                    order?.status === "In Preparation" && !order?.prep_time ? (
                      <div className="text-amber-600 font-semibold flex items-center gap-2">
                      <span className="inline-block animate-[spin_6s_linear_infinite]">
                        ⏳
                      </span>
                      <span className="text-sm italic">Your order will be ready soon</span>
                    </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-500">Time remaining</div>
                        <div className="font-mono">{formatTime(remaining)}</div>
                      </div>
                    )
                  ) : (
                    <div className="text-amber-600 font-semibold flex items-center gap-2">
                      <span className="inline-block animate-[spin_6s_linear_infinite]">
                        ⏳
                      </span>
                      <span className="text-sm italic">Hang tight — your order is slightly delayed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Staff-only pause/resume + Close on complete */}
              {order?.status === "Completed" && (
                <div className="mt-6">
                  <button
                    onClick={onClose}
                    className="w-full px-5 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
