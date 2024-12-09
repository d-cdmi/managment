// @/components/ui/Loader.jsx
import React from "react";

export default function Loader({ className }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className="h-8 w-8 animate-spin text-blue-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8h-8v-8z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
