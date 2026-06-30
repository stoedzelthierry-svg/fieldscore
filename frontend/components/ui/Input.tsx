"use client";

import React from "react";

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string;
}

export default function Input({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: InputProps) {
  const inputId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-[#1F2937] font-body"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "h-input px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-gray-900 text-sm placeholder:text-gray-400 transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500",
          "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
          error && "border-red-400 focus:ring-red-500/40 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600 font-body">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-gray-500 font-body">{hint}</p>
      )}
    </div>
  );
}
