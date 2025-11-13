import React from "react";
import { format } from "date-fns";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { formatIfFirstLetterUppercase, cn } from "@/lib/utils";
import {
  FlightSegment,
  BaggageDetail,
  Location,
} from "./flight-itinerary-types";
import {
  useAirportData,
  formatDuration,
  safeParseISO,
  getCheckedBagWeightBySegmentId,
  getCabinBySegmentId,
} from "./flight-utils";
import { AirportDisplay } from "./airport-display";
import FlightLogoImage from "./flight-logo-image";

/**
 * FlightLeg Component
 *
 * Displays a single flight segment with detailed information including:
 * - Departure and arrival times, dates, and airport information
 * - Flight duration with visual timeline indicator
 * - Airline information and flight number
 * - Cabin class and baggage information
 * - Responsive mobile and desktop layouts
 * - Loading states for airport data fetching
 * - Connecting line to next segment (unless it's the last segment)
 *
 * Props:
 * - segment: Flight segment data (departure, arrival, airline details)
 * - isLast: Whether this is the final segment (controls visual connectors)
 * - locationDict: Pre-loaded airport information for faster display
 * - baggageDetails: Baggage allowance information for this segment
 *
 * Purpose: Reusable component for displaying individual flight segments
 * within a multi-segment journey
 */

interface FlightLegProps {
  segment: FlightSegment;
  isLast?: boolean;
  locationDict?: Record<string, Location>;
  baggageDetails?: BaggageDetail[];
  stops?: number;
}

export const FlightLeg: React.FC<FlightLegProps> = ({
  segment,
  isLast,
  locationDict,
  baggageDetails,
  stops,
}) => {
  const t = useTranslations("ticketDetails.leg");
  const {
    airportData: departureData,
    loading: departureLoading,
    error: departureError,
  } = useAirportData(segment.departure.iataCode, locationDict);

  const {
    airportData: arrivalData,
    loading: arrivalLoading,
    error: arrivalError,
  } = useAirportData(segment.arrival.iataCode, locationDict);

  return (
    <div className="flex items-start gap-3 md:gap-4 py-3 md:py-4 transition-all duration-300 hover:bg-gray-50/50 px-2 md:px-0">
      <div className="flex flex-col items-center mt-1 md:mt-1.5">
        <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white shadow-lg ring-2 ring-blue-100"></div>
        {!isLast && (
          <div className="w-0.5 h-12 md:h-16 bg-gradient-to-b from-blue-300 to-blue-200 mt-2 rounded-full"></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Mobile Layout */}
        <div className="block md:hidden space-y-3">
          {/* Mobile: Departure & Arrival Row */}
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-1 min:w-1/3 max:1/3">
              <div className="text-base text-gray-900/80">
                {format(
                  safeParseISO(segment.departure.at),
                  "HH:mm"
                ).toLowerCase()}
              </div>
              <div className="text-xs text-gray-500">
                {format(safeParseISO(segment.departure.at), "MMM dd yy")}
              </div>
              <AirportDisplay
                airportData={departureData}
                loading={departureLoading}
                error={departureError}
                iataCode={segment.departure.iataCode}
                className="text-gray-600 truncate pr-2"
              />
            </div>

            <div className="flex flex-col items-center justify-center px-2 min:w-1/3 max:1/3">
              <div className="text-xs text-gray-500 mb-1">
                {formatDuration(segment.duration)}
              </div>

              <div className="flex items-center w-full relative">
                <div className="h-[0.5px] bg-gradient-to-r from-blue-300 to-blue-400 flex-1 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-end">
                  <div className="flex items-center space-x-1">
                    {Array.from(
                      { length: Math.max((stops ?? 0) + 1, 1) },
                      (_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-2 h-2 rounded-full shadow-sm",
                            i === 0 || i === (stops ?? 0)
                              ? "bg-gradient-to-br from-blue-500/75 to-blue-700/75"
                              : "bg-gradient-to-br from-blue-300/75 to-blue-500/75"
                          )}
                        ></div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 text-right space-y-1 min:w-1/3 max:1/3">
              <div className="text-base text-gray-900/80">
                {format(
                  safeParseISO(segment.arrival.at),
                  "HH:mm"
                ).toLowerCase()}
              </div>
              <div className="text-xs text-gray-500">
                {format(safeParseISO(segment.arrival.at), "MMM dd yy")}
              </div>
              <AirportDisplay
                airportData={arrivalData}
                loading={arrivalLoading}
                error={arrivalError}
                iataCode={segment.arrival.iataCode}
                className="text-gray-600 truncate pl-2"
              />
              <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs rounded-lg border border-blue-200 shadow-sm truncate justify-end">
                {getCheckedBagWeightBySegmentId(
                  baggageDetails || [],
                  segment.id
                ) || t("noBaggageInfo")}
              </div>
            </div>
          </div>

          {/* Mobile: Flight Details */}
          <div className="bg-gradient-to-r from-blue-50/40 to-indigo-50/40 rounded-xs p-2 md:p-3 border border-blue-100 flex items-center justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlightLogoImage
                  segment={segment}
                  width={18}
                  height={16}
                  cssClass="-mt-0.5 h-4 w-auto [transform:rotateY(3.142rad)]"
                />
                <span className="text-xs md:text-sm font-medium text-gray-700">
                  {segment.airlineName || segment.carrierCode} {segment.number}
                </span>
              </div>
            </div>
            <div className="text-xs text-blue-500 flex items-center justify-end gap-1.5 border">
              {/* <span className="text-gray-400">💺</span> */}
              <span className="inline-flex items-center gap-2 px-3 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200 shadow-sm">
                {getCabinBySegmentId(baggageDetails || [], segment.id)}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-3 gap-6 lg:gap-4">
          {/* Departure */}
          <div>
            <div className="text-lg lg:text-xl text-gray-700/80 tracking-tight">
              {format(
                safeParseISO(segment.departure.at),
                "HH:mm"
              ).toLowerCase()}
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {format(safeParseISO(segment.departure.at), "MMM dd yy")}
            </div>
            <AirportDisplay
              airportData={departureData}
              loading={departureLoading}
              error={departureError}
              iataCode={segment.departure.iataCode}
              className="text-sm text-gray-600 leading-relaxed"
            />
          </div>

          {/* Arrival */}
          <div className="text-right">
            <div className="text-lg lg:text-xl text-gray-700/80 tracking-tight">
              {format(safeParseISO(segment.arrival.at), "HH:mm").toLowerCase()}
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {format(safeParseISO(segment.arrival.at), "MMM dd yy")}
            </div>
            <AirportDisplay
              airportData={arrivalData}
              loading={arrivalLoading}
              error={arrivalError}
              iataCode={segment.arrival.iataCode}
              className="text-sm text-gray-600 leading-relaxed"
            />
          </div>

          {/* Duration and Airline */}
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200 shadow-sm">
              <span className="text-blue-500">⏱</span>
              <span>{formatDuration(segment.duration)}</span>
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full px-2">
                <FlightLogoImage
                  segment={segment}
                  width={13}
                  height={13}
                  cssClass="-mt-0.5 h-4 w-auto [transform:rotateY(3.142rad)]"
                />
                <span className="text-xs font-medium text-gray-700">
                  {segment.airlineName || segment.carrierCode}{" "}
                </span>

                <span className="text-xs font-medium text-gray-700">
                  {segment.number}
                </span>
              </div>
              <div className="text-xs text-blue-700 flex items-center justify-end gap-1.5">
                {/* <span className="text-gray-400">💺</span> */}
                <span className="inline-flex items-center gap-2 px-3 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200 shadow-sm">
                  {getCabinBySegmentId(baggageDetails || [], segment.id)}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs rounded-lg border border-blue-200 shadow-sm truncate justify-end">
                {getCheckedBagWeightBySegmentId(
                  baggageDetails || [],
                  segment.id
                ) || t("noBaggageInfo")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
