export default function RewardBoxLoader({
  size = 160,
  message = "Unlocking your rewards…",
  className = "",
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      style={{ width: "100%" }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Box base */}
        <rect
          x="50"
          y="90"
          width="100"
          height="70"
          rx="8"
          fill="#facc15"
          stroke="#92400e"
          strokeWidth="4"
        />

        {/* Box lid */}
        <rect
          x="45"
          y="70"
          width="110"
          height="30"
          rx="6"
          fill="#f59e0b"
          stroke="#92400e"
          strokeWidth="4"
          className="lid"
        />

        {/* Ribbon */}
        <rect x="95" y="70" width="10" height="90" fill="#dc2626" />
        <rect x="50" y="120" width="100" height="10" fill="#dc2626" />

        {/* Sparkles */}
        <circle cx="70" cy="50" r="5" fill="#fcd34d" className="sparkle sparkle1" />
        <circle cx="100" cy="40" r="4" fill="#fcd34d" className="sparkle sparkle2" />
        <circle cx="130" cy="55" r="6" fill="#fcd34d" className="sparkle sparkle3" />
      </svg>

      {message && (
        <div
          style={{
            fontSize: Math.max(12, Math.round(size / 9)),
            color: "#92400e",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          {message}
        </div>
      )}

      <style>{`
        /* Lid bounce */
        .lid {
          transform-origin: center bottom;
          animation: lidBounce 2s ease-in-out infinite;
        }
        @keyframes lidBounce {
          0%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
          60% { transform: translateY(0); }
        }

        /* Sparkle float */
        .sparkle {
          opacity: 0;
        }
        .sparkle1 { animation: floatUp 2s infinite; }
        .sparkle2 { animation: floatUp 2s infinite 0.4s; }
        .sparkle3 { animation: floatUp 2s infinite 0.8s; }

        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { opacity: 1; }
          60% { transform: translateY(-25px) scale(1.2); opacity: 1; }
          100% { opacity: 0; transform: translateY(-40px) scale(0.5); }
        }
      `}</style>
    </div>
  );
}
