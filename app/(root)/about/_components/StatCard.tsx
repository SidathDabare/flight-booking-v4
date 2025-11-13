import React from "react";

interface StatCardProps {
  value: string;
  label: string;
  className?: string;
}

/**
 * Reusable stat card component for displaying metrics
 */
export function StatCard({ value, label, className = "" }: StatCardProps) {
  return (
    <div
      className={`text-center p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}
    >
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
        {label}
      </div>
    </div>
  );
}
