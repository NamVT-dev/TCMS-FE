// components/UI/Loading.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * Loading component
 * Props:
 *  - fullscreen: boolean -> chiếm full screen (center) — dùng cho page-level loading
 *  - size: 'sm' | 'md' | 'lg' -> kích thước spinner
 *  - message: optional string
 *  - variant: 'glass' | 'card' -> nền của khung (glass nhẹ hoặc card)
 */
const sizeMap = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

export default function Loading({
  fullscreen = false,
  size = "md",
  message = "Đang tải...",
  variant = "glass",
}) {
  const sz = sizeMap[size] || sizeMap.md;

  const containerClass = fullscreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/60 backdrop-blur-sm"
    : "inline-flex items-center";

  const cardClass =
    variant === "card"
      ? "bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col items-center gap-4"
      : "bg-white/60 dark:bg-gray-900/60 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3";

  return (
    <div className={containerClass} role="status" aria-live="polite" aria-busy="true">
      <div className={fullscreen ? "" : cardClass}>
        {/* Spinner */}
        <div className={`flex items-center justify-center ${fullscreen ? "" : ""}`}>
          <svg
            className={`${sz} animate-spin`}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-100"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>

        {/* Shimmer message */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{message}</div>

          {/* animated dots */}
          <div className="flex items-center gap-1 mt-1" aria-hidden="true">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-600 animate-bounceDelay" />
            <span className="inline-block w-2 h-2 rounded-full bg-purple-600 animate-bounceDelay200" />
            <span className="inline-block w-2 h-2 rounded-full bg-purple-600 animate-bounceDelay400" />
          </div>
        </div>

        {/* subtle shimmer bar for large/fullscreen view */}
        {fullscreen && (
          <div className="mt-4 w-48 h-2 rounded-full bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200 opacity-60 animate-pulse" />
        )}
      </div>

      {/* Inline styles for custom delays (tailwind does not have these by default) */}
      <style>{`
        .animate-bounceDelay { animation: bounceDots 1s infinite; animation-delay: 0s; }
        .animate-bounceDelay200 { animation: bounceDots 1s infinite; animation-delay: 0.2s; }
        .animate-bounceDelay400 { animation: bounceDots 1s infinite; animation-delay: 0.4s; }

        @keyframes bounceDots {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

Loading.propTypes = {
  fullscreen: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  message: PropTypes.string,
  variant: PropTypes.oneOf(["glass", "card"]),
};
