import React from "react";

interface SectionHeaderProps {
  badge: string;
  title: string;
  description?: string;
  alignment?: "left" | "center";
}

/**
 * Reusable section header component with badge, title, and optional description
 * Used across all client-facing pages for consistent styling
 */
export function SectionHeader({
  badge,
  title,
  description,
  alignment = "center",
}: SectionHeaderProps) {
  const alignClass = alignment === "center" ? "text-center" : "text-left";
  const containerClass =
    alignment === "center" ? "mx-auto max-w-3xl" : "max-w-3xl";

  return (
    <div className={`mb-12 sm:mb-16 lg:mb-20 ${containerClass} ${alignClass}`}>
      <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 mb-4 shadow-sm border border-amber-200/50 dark:border-amber-800/50">
        {badge}
      </span>
      <h2
        className="font-bold tracking-tight mb-3 sm:mb-4"
        style={{ fontSize: "clamp(1.75rem, 4vw + 0.5rem, 3rem)" }}
      >
        {title}
      </h2>
      {description && (
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}
