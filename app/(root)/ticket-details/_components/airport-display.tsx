import React from "react";
import { formatIfFirstLetterUppercase } from "@/lib/utils";
import { Location } from "./flight-itinerary-types";

/**
 * AirportDisplay Component
 *
 * A reusable component for displaying airport information with the new data structure.
 * Handles loading states, error states, and graceful fallbacks.
 *
 * Features:
 * - Displays airport name, city, and country information
 * - Shows IATA code as fallback when data is unavailable
 * - Handles loading and error states
 * - Supports custom styling via className prop
 * - Truncates long text to prevent layout issues
 *
 * Data structure expected:
 * {
 *   "name": "Goroka",
 *   "city": "Goroka",
 *   "country": "Papua New Guinea",
 *   "IATA": "GKA",
 *   "ICAO": "AYGA",
 *   "lat": "-6.081689834590001",
 *   "lon": "145.391998291",
 *   "timezone": "10"
 * }
 */

interface AirportDisplayProps {
  airportData: Location | null;
  loading: boolean;
  error: string | null;
  iataCode: string;
  className?: string;
}

export const AirportDisplay: React.FC<AirportDisplayProps> = ({
  airportData,
  loading,
  error,
  iataCode,
  className = "",
}) => {
  if (loading) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        Loading...
      </div>
    );
  }

  if (error || !airportData) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        {iataCode}
      </div>
    );
  }

  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      <div className="truncate">
        {formatIfFirstLetterUppercase(airportData?.name ?? "")}
      </div>
      <div className="truncate">
        {[
          airportData?.city
            ? `(${formatIfFirstLetterUppercase(airportData.city)})`
            : "",
          airportData?.country || "",
        ]
          .filter(Boolean)
          .join(" ")}
      </div>
    </div>
  );
};