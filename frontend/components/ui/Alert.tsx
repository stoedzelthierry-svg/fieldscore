"use client";

import React from "react";

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  onDismiss?: () => void;
}

const variantStyles: Record<AlertVariant, string> = {
  info: "bg-data-50 border-data-300 text-data-800",
  success: "bg-eco-50 border-eco-300 text-eco-800",
  warning: "bg-warn-50 border-warn-300 text-warn-800",
  error: "bg-red-50 border-red-300 text-red-800",
};

const iconMap: Record<AlertVariant, string> = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "❌",
};

export default function Alert({
  variant = "info",
  title,
  children,
  className,
  onDismiss,
}: AlertProps) {
  return (
    <div
      className={cn(
        "border-l-4 p-4 rounded-r-xl flex gap-3 font-body",
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      <span className="text-lg flex-shrink-0" aria-hidden="true">
        {iconMap[variant]}
      </span>
      <div className="flex-1">
        {title && (
          <p className="font-semibold text-sm mb-1 font-body">{title}</p>
        )}
        <div className="text-sm">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Fermer"
        >
          ✕
        </button>
      )}
    </div>
  );
}
