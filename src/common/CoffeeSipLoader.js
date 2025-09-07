
export default function CoffeeSipLoader({
  size = 160,
  message = "Preparing your coffee…",
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
        {/* Saucer */}
        <ellipse cx="100" cy="170" rx="70" ry="10" fill="#d6c7b5" opacity="0.6" />

        {/* Cup */}
        <rect
          x="50"
          y="80"
          width="100"
          height="70"
          rx="12"
          ry="12"
          fill="#f5f5f4"
          stroke="#6b4f36"
          strokeWidth="3"
        />

        {/* Handle */}
        <path d="M150 95 a20 20 0 1 1 0 40" fill="none" stroke="#6b4f36" strokeWidth="5" />

        {/* Coffee liquid */}
        <rect
          x="50"
          y="80"
          width="100"
          height="70"
          rx="12"
          ry="12"
          fill="#6b3e2e"
          clipPath="url(#cupClip)"
          className="coffee-fill"
        />

        {/* Cup clip path */}
        <defs>
          <clipPath id="cupClip">
            <rect x="50" y="80" width="100" height="70" rx="12" ry="12" />
          </clipPath>
        </defs>

        {/* Beans dropping */}
        <circle cx="90" cy="40" r="6" fill="#4a2c1a" className="bean bean1" />
        <circle cx="110" cy="30" r="6" fill="#4a2c1a" className="bean bean2" />
        <circle cx="100" cy="20" r="6" fill="#4a2c1a" className="bean bean3" />

        {/* Steam rising */}
        <g
          stroke="#d1d5db"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          className="steam"
        >
          <path d="M80 70 c0 -10 10 -10 10 -20 s-10 -10 -10 -20" />
          <path d="M100 70 c0 -10 10 -10 10 -20 s-10 -10 -10 -20" />
          <path d="M120 70 c0 -10 10 -10 10 -20 s-10 -10 -10 -20" />
        </g>
      </svg>

      {message && (
        <div
          style={{
            fontSize: Math.max(12, Math.round(size / 9)),
            color: "#4a2c1a",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          {message}
        </div>
      )}

      <style>{`
        /* Coffee fill rising */
        .coffee-fill {
          transform-origin: center bottom;
          animation: fillUp 4s ease-in-out infinite;
        }
        @keyframes fillUp {
          0%, 25% { transform: scaleY(0); }
          40% { transform: scaleY(1); }
          80%, 100% { transform: scaleY(1); }
        }

        /* Beans drop */
        .bean {
          opacity: 0;
        }
        .bean1 { animation: dropBean 4s infinite; }
        .bean2 { animation: dropBean 4s infinite 0.4s; }
        .bean3 { animation: dropBean 4s infinite 0.8s; }

        @keyframes dropBean {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          25% { transform: translateY(60px); opacity: 1; }
          30% { opacity: 0; }
          100% { opacity: 0; }
        }

        /* Steam rising */
        .steam path {
          opacity: 0;
          animation: steamUp 4s infinite;
        }
        .steam path:nth-child(1) { animation-delay: 2.5s; }
        .steam path:nth-child(2) { animation-delay: 2.7s; }
        .steam path:nth-child(3) { animation-delay: 2.9s; }

        @keyframes steamUp {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.8; }
          60% { transform: translateY(-20px); opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
