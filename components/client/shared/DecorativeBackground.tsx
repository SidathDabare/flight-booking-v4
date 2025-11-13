import React from "react";

interface DecorativeBackgroundProps {
  variant?: "amber" | "orange" | "mixed";
  className?: string;
}

/**
 * Decorative background component with animated blur elements
 * Provides consistent visual depth across client pages
 */
export function DecorativeBackground({
  variant = "mixed",
  className = "",
}: DecorativeBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {variant === "mixed" && (
        <>
          <div className="absolute top-20 right-10 w-72 h-72 bg-amber-300/20 dark:bg-amber-900/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 left-10 w-96 h-96 bg-orange-200/20 dark:bg-orange-900/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </>
      )}
      {variant === "amber" && (
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-300/20 dark:bg-amber-900/10 rounded-full blur-3xl animate-pulse" />
      )}
      {variant === "orange" && (
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200/20 dark:bg-orange-900/10 rounded-full blur-3xl animate-pulse" />
      )}
    </div>
  );
}
