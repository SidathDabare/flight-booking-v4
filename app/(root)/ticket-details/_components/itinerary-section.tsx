"use client";

import React, { useMemo } from "react";
import { format } from "date-fns";
import { CircleOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatIfFirstLetterUppercase } from "@/lib/utils";
import { Itinerary, BaggageDetail, Location } from "./flight-itinerary-types";
import {
  useAirportData,
  formatDuration,
  safeParseISO,
  calculateStopoverDuration,
} from "./flight-utils";
import { FlightLeg } from "./flight-leg";
import { Stopover } from "./stopover";
import { AirportDisplay } from "./airport-display";

/**
 * ItinerarySection Component
 *
 * Displays a complete flight itinerary section (departure or return) with:
 * - Section title, icon, and travel date
 * - Collapsed view: Summary with departure/arrival times, duration, stops, and baggage info
 * - Expanded view: Detailed breakdown of all flight segments and stopovers
 * - Responsive mobile and desktop layouts
 * - Flight path visualization with stop indicators
 * - Airport information with loading states
 * - Baggage status and connection insurance information
 *
 * Features:
 * - Toggleable expanded/collapsed states
 * - Automatic stopover duration calculation
 * - Airline change detection for connecting flights
 * - Optimized rendering with useMemo for expensive calculations
 *
 * Props:
 * - title: Section title (e.g., "Departure", "Return")
 * - icon: React node for section icon
 * - itinerary: Complete flight data with segments
 * - isExpanded: Controls detailed view visibility
 * - mainDate: Formatted travel date for display
 * - baggageInfo: Baggage allowance description
 * - locationDict: Pre-loaded airport information
 * - baggageDetails: Detailed baggage data per segment
 * - checkInBaggage: Whether checked baggage is included
 * - connectionInsurance: Connection protection status
 *
 * Purpose: Main container component for displaying flight journey details
 * with collapsible detailed information
 */

interface ItinerarySectionProps {
  title: string;
  icon: React.ReactNode;
  itinerary: Itinerary;
  isExpanded: boolean;
  mainDate: string;
  locationDict?: Record<string, Location>;
  baggageDetails?: BaggageDetail[];
  connectionInsurance?: boolean;
  checkInBaggage?: boolean;
}

export const ItinerarySection: React.FC<ItinerarySectionProps> = ({
  title,
  icon,
  itinerary,
  isExpanded,
  mainDate,
  locationDict,
  baggageDetails,
  connectionInsurance,
  checkInBaggage,
}) => {
  const t = useTranslations("ticketDetails.itinerary");
  const { firstSegment, lastSegment, stops, formattedDuration } =
    useMemo(() => {
      const first = itinerary.segments[0];
      const last = itinerary.segments[itinerary.segments.length - 1];
      const stopCount = itinerary.segments.length - 1;
      const duration = formatDuration(itinerary.duration, itinerary.segments);

      return {
        firstSegment: first,
        lastSegment: last,
        stops: stopCount,
        formattedDuration: duration,
      };
    }, [itinerary.segments, itinerary.duration]);

  const {
    airportData: departureAirportData,
    loading: departureLoading,
    error: departureError,
  } = useAirportData(firstSegment.departure.iataCode, locationDict);

  const {
    airportData: arrivalAirportData,
    loading: arrivalLoading,
    error: arrivalError,
  } = useAirportData(lastSegment.arrival.iataCode, locationDict);

  return (
    <div className="border-b border-gray-100 last:border-b-0 rounded-none">
      <div className="p-2 md:p-6 rounded-none">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="p-1.5 md:p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            {icon}
          </div>
          <div>
            <span className="text-base md:text-md font-bold text-gray-700/80 tracking-tight">
              {title}
            </span>
            <div className="text-xs md:text-sm text-gray-600 font-medium">
              {mainDate}
            </div>
          </div>
        </div>

        {!isExpanded ? (
          <>
            {/* Mobile Collapsed View */}
            <div className="block md:hidden from-gray-50/10 to-blue-50/10 rounded-xs">
              <div className="bg-gradient-to-r rounded-xs p-4 border border-blue-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <div className="text-lg text-gray-700 min:w-1/3 max:1/3">
                      {format(
                        safeParseISO(firstSegment.departure.at),
                        "HH:mm"
                      ).toLowerCase()}
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {firstSegment.departure.iataCode}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(
                        safeParseISO(firstSegment.departure.at),
                        "MMM dd yy"
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center py-2 lg:py-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      {formattedDuration}
                    </div>
                    <div className="flex items-center w-full">
                      {/* Start empty circle */}
                      <div className="w-2 h-2 rounded-full shadow-sm bg-white dark:bg-gray-800 border-2 border-blue-400 dark:border-blue-500 mr-1"></div>

                      {/* Line with stop circles */}
                      <div className="flex items-center flex-1 relative">
                        <div className="h-0.5 bg-gradient-to-r from-blue-300 to-blue-400 dark:from-blue-600 dark:to-blue-500 flex-1 rounded-full"></div>
                        {stops > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: stops }, (_, i) => (
                                <div
                                  key={i}
                                  className="w-2 h-2 rounded-full shadow-sm bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600"
                                ></div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="h-0.5 bg-gradient-to-r from-blue-400 to-blue-300 dark:from-blue-500 dark:to-blue-600 flex-1 rounded-full"></div>
                      </div>

                      {/* End empty circle */}
                      <div className="w-2 h-2 rounded-full shadow-sm bg-white dark:bg-gray-800 border-2 border-blue-400 dark:border-blue-500 ml-1"></div>
                    </div>
                    <div className="text-sm font-medium text-blue-600 mt-2">
                      {stops === 0
                        ? t("directFlight")
                        : t("stops", { count: stops })}
                    </div>
                  </div>

                  <div className="text-right space-y-1 min:w-1/3 max:1/3">
                    <div className="text-lg text-gray-900">
                      {format(
                        safeParseISO(lastSegment.arrival.at),
                        "HH:mm"
                      ).toLowerCase()}
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {lastSegment.arrival.iataCode}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(
                        safeParseISO(lastSegment.arrival.at),
                        "MMM dd yy"
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-end w-full md:w-1/3">
                  {checkInBaggage ? (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full w-fit text-xs border border-teal-500/50">
                      <div className="w-4 h-4 rounded-sm flex items-center justify-center">
                        <span className="text-teal-600 text-xs">✓</span>
                      </div>
                      <span className="text-teal-700 font-medium">
                        {t("baggageIncluded")}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full w-fit text-xs border border-red-500/50">
                      <div className="w-4 h-4 rounded-sm flex items-center justify-center">
                        <CircleOff
                          size={14}
                          strokeWidth={1.5}
                          className="text-red-700"
                        />
                      </div>
                      <span className="text-red-600 font-medium">
                        {t("noBaggage")}
                      </span>
                    </div>
                  )}
                </div>

                {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r text-green-700 text-xs font-medium rounded-full border border-green-200">
                  <div className="truncate max-w-[100px] lg:max-w-none border-r border-green-500 pr-3">
                    {isCheckedBagIncluded(baggageDetails || []) ? (
                      <div className="inline-flex items-center gap-2">
                        <Check size={16} strokeWidth={1.25} />
                        <Briefcase size={16} strokeWidth={1.25} />
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-red-700 ">
                        <CircleOff size={16} strokeWidth={1.25} />
                        <Briefcase size={16} strokeWidth={1.25} />
                      </div>
                    )}
                  </div>
                  <div className="truncate max-w-[100px] lg:max-w-none">
                    {isCabinBagIncluded(baggageDetails || []) ? (
                      <div className="inline-flex items-center gap-2">
                        <Check size={16} strokeWidth={1.25} />
                        <BriefcaseBusiness size={16} strokeWidth={1.25} />
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-red-700 ">
                        <CircleOff size={16} strokeWidth={1.25} />

                        <BriefcaseBusiness size={16} strokeWidth={1.25} />
                      </div>
                    )}
                  </div>
                </div> */}
              </div>
            </div>

            {/* Desktop/Tablet Collapsed View */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-[1fr_2fr_1fr_auto] gap-4 lg:gap-6 items-center">
              {/* Departure Info */}
              <div className="lg:justify-self-start">
                <div className="text-lg font-semibold text-gray-900/80 tracking-tight">
                  {format(safeParseISO(firstSegment.departure.at), "HH:mm")}
                </div>
                <div className="text-sm lg:text-base font-medium text-gray-700">
                  {firstSegment.departure.iataCode}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">
                  {format(safeParseISO(firstSegment.departure.at), "MMM dd yy")}
                </div>
                <AirportDisplay
                  airportData={departureAirportData}
                  loading={departureLoading}
                  error={departureError}
                  iataCode={firstSegment.departure.iataCode}
                  className="max-w-[120px] lg:max-w-[150px]"
                />
              </div>

              {/* Flight Path Visualization */}
              <div className="flex flex-col items-center py-2 lg:py-3">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {formattedDuration}
                </div>
                <div className="flex items-center w-full">
                  {/* Start empty circle */}
                  <div className="w-3 h-3 rounded-full shadow-sm bg-white dark:bg-gray-800 border-2 border-blue-400 dark:border-blue-500 mr-2"></div>

                  {/* Line with stop circles */}
                  <div className="flex items-center flex-1 relative">
                    <div className="h-0.5 bg-gradient-to-r from-blue-300 to-blue-400 dark:from-blue-600 dark:to-blue-500 flex-1 rounded-full"></div>
                    {stops > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                          {Array.from({ length: stops }, (_, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-full shadow-sm bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600"
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="h-0.5 bg-gradient-to-r from-blue-400 to-blue-300 dark:from-blue-500 dark:to-blue-600 flex-1 rounded-full"></div>
                  </div>

                  {/* End empty circle */}
                  <div className="w-3 h-3 rounded-full shadow-sm bg-white dark:bg-gray-800 border-2 border-blue-400 dark:border-blue-500 ml-2"></div>
                </div>
                <div className="text-sm font-medium text-blue-600 mt-2">
                  {stops === 0
                    ? t("directFlight")
                    : t("stops", { count: stops })}
                </div>
              </div>

              {/* Arrival Info */}
              <div className="lg:justify-self-end text-right">
                <div className="text-lg font-semibold text-gray-900/80 tracking-tight">
                  {format(safeParseISO(lastSegment.arrival.at), "HH:mm")}
                </div>
                <div className="text-sm lg:text-base font-medium text-gray-700">
                  {lastSegment.arrival.iataCode}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">
                  {format(safeParseISO(lastSegment.arrival.at), "MMM dd yy")}
                </div>
                <AirportDisplay
                  airportData={arrivalAirportData}
                  loading={arrivalLoading}
                  error={arrivalError}
                  iataCode={lastSegment.arrival.iataCode}
                  className="max-w-[120px] lg:max-w-[150px]"
                />
              </div>

              {/* Baggage Info */}

              {checkInBaggage ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full w-fit text-xs border border-teal-500/50">
                  <div className="w-4 h-4 rounded-sm flex items-center justify-center">
                    <span className="text-teal-600 text-xs">✓</span>
                  </div>
                  <span className="text-teal-700 font-medium">
                    {t("baggageIncluded")}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full w-fit text-xs border border-red-500/50">
                  <div className="w-4 h-4 rounded-sm flex items-center justify-center">
                    <CircleOff
                      size={14}
                      strokeWidth={1.5}
                      className="text-red-700"
                    />
                  </div>
                  <span className="text-red-600 font-medium">
                    {t("noBaggage")}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          // Expanded view
          <div className="bg-gradient-to-br from-gray-50/10 to-blue-50/10 rounded-xs p-3 md:p-4 border">
            <div className="space-y-1 md:space-y-2">
              {itinerary.segments.map((segment, index) => {
                const nextSegment = itinerary.segments[index + 1];
                const currentCarrier = segment.carrierCode;
                const nextCarrier = nextSegment?.carrierCode;
                const isChangingAirlines = Boolean(
                  nextCarrier && currentCarrier !== nextCarrier
                );

                // Calculate actual layover duration between segments
                const layoverDuration = nextSegment
                  ? calculateStopoverDuration(segment, nextSegment)
                  : "";

                return (
                  <React.Fragment key={index}>
                    <FlightLeg
                      segment={segment}
                      isLast={index === itinerary.segments.length - 1}
                      locationDict={locationDict}
                      baggageDetails={baggageDetails}
                    />
                    {index < itinerary.segments.length - 1 && (
                      <Stopover
                        duration={layoverDuration}
                        location={segment.arrival.iataCode}
                        hasConnectionInsurance={connectionInsurance}
                        isChangingAirlines={isChangingAirlines}
                        locationDict={locationDict}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
