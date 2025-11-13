import React from "react";
import { PlaneIcon } from "@/components/icons/PlaneIcon";

/**
 * FlightHeader Component
 *
 * Displays the header section of the flight itinerary card with:
 * - Gradient background styling
 * - Plane icon with visual effects
 * - Title and subtitle text
 * - Responsive design for mobile/desktop
 *
 * Purpose: Provides a consistent, visually appealing header for flight itinerary cards
 */

export const FlightHeader: React.FC = () => {
  return (
    <div className="p-2 md:p-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
      <div className="relative flex items-center gap-2 md:gap-3">
        <div className="p-0.5 md:p-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
          <PlaneIcon className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-sm" />
        </div>
        <div>
          <h4 className="text-lg md:text-xl tracking-tight">
            Flight Itinerary
          </h4>
          <p className="text-blue-100 text-xs md:text-sm font-medium">
            Your complete travel details
          </p>
        </div>
      </div>
    </div>
  );
};
