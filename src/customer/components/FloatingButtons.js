import React, { useState, useEffect } from "react";

export default function FloatingButtons({ cartCount }) {
  const [positionY, setPositionY] = useState(window.innerHeight / 2); // Start center

  useEffect(() => {
    const handleResize = () => {
      // Prevent button going out of screen on resize
      setPositionY((prev) =>
        Math.min(window.innerHeight - 80, Math.max(80, prev))
      );
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startDrag = (e) => {
    e.preventDefault();

    const onMove = (moveEvent) => {
      const clientY = moveEvent.clientY || moveEvent.touches?.[0]?.clientY;
      setPositionY(
        Math.min(window.innerHeight - 80, Math.max(80, clientY)) // clamp inside screen
      );
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onMove);
    document.addEventListener("touchend", onUp);
  };

  return (
    <>
      {/* Floating Cart */}
      <button
        onClick={() => document.getElementById("cart-panel-btn")?.click()}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        className="fixed right-4 z-50 flex flex-col items-center justify-center bg-amber-500 text-white rounded-full w-14 h-14 shadow-lg hover:bg-amber-600 transition-colors cursor-grab active:cursor-grabbing"
        style={{ top: `${positionY}px`, transform: "translateY(-50%)" }}
      >
        🛒
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {cartCount}
          </span>
        )}
      </button>
    </>
  );
}
