import React from "react";

export function Button({ className = "", variant = "default", ...props }) {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2";
  const variants = {
    default: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };
  return (
    <button className={`${base} ${variants[variant] || ""} ${className}`} {...props} />
  );
}
