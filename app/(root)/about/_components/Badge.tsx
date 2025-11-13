import React from "react";
import { LucideIcon } from "lucide-react";

interface BadgeProps {
  icon: LucideIcon;
  text: string;
  variant?: "primary" | "secondary";
}

/**
 * Reusable badge component with icon and text
 */
export function Badge({ icon: Icon, text, variant = "primary" }: BadgeProps) {
  const variantClasses =
    variant === "primary"
      ? "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50"
      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 text-gray-700 dark:text-gray-300";

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border shadow-sm transition-colors ${variantClasses}`}
    >
      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
      <span className="font-medium">{text}</span>
    </span>
  );
}
