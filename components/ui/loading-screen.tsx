import React from "react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Placeholder */}
        <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse" />

        {/* Search Form Placeholder */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Origin Input Placeholder */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-100 rounded-md animate-pulse" />
            </div>

            {/* Destination Input Placeholder */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-100 rounded-md animate-pulse" />
            </div>

            {/* Date Input Placeholder */}
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-100 rounded-md animate-pulse" />
            </div>
          </div>

          {/* Options Row */}
          <div className="flex flex-wrap gap-4 items-center mb-6">
            {/* Checkboxes */}
            <div className="flex gap-4">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Travel Class and Passengers */}
            <div className="flex gap-4 ml-auto">
              <div className="h-10 w-32 bg-gray-100 rounded-md animate-pulse" />
              <div className="h-10 w-32 bg-gray-100 rounded-md animate-pulse" />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-end">
            <div className="h-12 w-48 bg-red-200 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="fixed inset-0 navbar-bg-mobile backdrop-blur-sm z-50 flex items-center justify-center top-0">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 max-w-[400px] mx-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-gray-100">
                <div className="absolute inset-0 border-4 border-red-600 rounded-full animate-spin border-t-transparent" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">✈️</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">Searching flights</h3>
              <p className="text-sm text-gray-500">
                Please wait while we find the best options for you
              </p>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 rounded-full bg-red-600 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 rounded-full bg-red-600 animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
