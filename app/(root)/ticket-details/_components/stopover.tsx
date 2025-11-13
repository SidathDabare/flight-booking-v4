import React from "react";
import { useTranslations } from "next-intl";
import { formatIfFirstLetterUppercase } from "@/lib/utils";
import { Location } from "./flight-itinerary-types";
import { formatDuration } from "./flight-utils";

/**
 * Stopover Component
 *
 * Displays layover information between connecting flights including:
 * - Stopover duration in human-readable format
 * - Airport location with full name and city
 * - Airline change indicator when switching carriers
 * - Visual timeline connector with distinctive styling
 * - Connection insurance status
 *
 * Props:
 * - duration: ISO duration string for layover time
 * - location: IATA code of the stopover airport
 * - hasConnectionInsurance: Whether connection is protected
 * - isChangingAirlines: Indicates if switching airlines during layover
 * - locationDict: Pre-loaded airport information for display
 *
 * Purpose: Provides clear information about layovers and connections
 * between flight segments in a multi-stop journey
 */

interface StopoverProps {
  duration: string;
  location: string;
  hasConnectionInsurance?: boolean;
  isChangingAirlines?: boolean;
  locationDict?: Record<string, Location>;
}

export const Stopover: React.FC<StopoverProps> = ({
  duration,
  location,
  hasConnectionInsurance = true,
  isChangingAirlines = false,
  locationDict,
}) => {
  const t = useTranslations("ticketDetails.stopover");
  // Get airport information for the stopover location
  const airportInfo = locationDict?.[location];
  const airportName = airportInfo?.name
    ? formatIfFirstLetterUppercase(airportInfo.name)
    : null;
  const cityName = airportInfo?.city
    ? formatIfFirstLetterUppercase(airportInfo.city)
    : null;

  return (
    <div className="flex items-start gap-3 md:gap-1 py-0 md:py-0 px-2 md:px-3 ml-3">
      <div className="flex flex-col items-center">
        <div className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-br from-blue-400 to-orange-500 rounded-full border-2 border-white shadow-lg ring-2 ring-blue-100"></div>
        <div className="w-0.5 h-8 md:h-12 bg-gradient-to-b from-blue-300 to-blue-200 mt-2 rounded-full"></div>
      </div>

      <div className="flex-1 pl-2 md:pl-4 min-w-0">
        <div className="text-sm md:text-base font-semibold text-orange-500 mb-1 md:mb-2">
          {t("duration")}: {formatDuration(duration)}
        </div>

        <div className="space-y-1 md:space-y-1.5">
          {isChangingAirlines && (
            <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-700">
              <span className="text-gray-500 text-sm">✈</span>
              <span>{t("changingAirlines")}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-700 flex-wrap">
            <span className="text-orange-600">📍</span>
            <span className="font-medium">{t("stopoverAt")}:</span>
            <span className="text-blue-600 font-semibold">
              {airportName
                ? `${location} - ${airportName}${cityName ? ` (${cityName})` : ""}`
                : `${location} ${t("airport")}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
