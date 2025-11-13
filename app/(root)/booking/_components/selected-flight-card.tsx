"use client";

import { Card } from "@/components/ui/card";
import useFlightStore from "@/lib/store/use-flight-store";
import { format, parseISO } from "date-fns";
import { ArrowRight, Clock, Plane, ArrowLeftRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatDuration } from "../../ticket-details/_components/flight-utils";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Segment {
  departure: {
    iataCode: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  [key: string]: unknown;
}

interface Itinerary {
  segments: Segment[];
  duration: string;
  [key: string]: unknown;
}

interface FlightSegmentProps {
  itinerary: Itinerary;
  isReturn?: boolean;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}

function FlightSegment({ itinerary, isReturn, t }: FlightSegmentProps) {
  const firstSegment = itinerary.segments[0];
  const lastSegment = itinerary.segments[itinerary.segments.length - 1];
  const stops = itinerary.segments.length - 1;

  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-3 rounded-xl p-3 md:p-4 border transition-all duration-200 hover:shadow-md",
        "bg-gray-50/80 dark:bg-gray-800/80 border-gray-200/40 dark:border-gray-700/40"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200",
            "bg-gray-100 dark:bg-gray-700/40 text-gray-600 dark:text-gray-400"
          )}
        >
          <Plane
            className={cn(
              "h-5 w-5 transition-transform duration-300 ",
              isReturn && "rotate-180"
            )}
          />
        </div>
        <div className="flex items-center gap-3 flex-1">
          <div
            className={cn(
              "px-2.5 py-1 rounded-lg font-bold text-sm",
              "bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200"
            )}
          >
            {firstSegment.carrierCode || "N/A"}
          </div>

          {isReturn ? (
            <span className="text-xs font-semibold rounded-md border shadow-sm px-2">
              {t("flightCard.returnFlight")}
            </span>
          ) : (
            <span className="text-xs font-semibold rounded-md border shadow-sm px-2">
              {t("flightCard.departureFlight")}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-center">
            <div
              className={cn(
                "px-1.5 py-0 md:px-2 md:py-0 rounded-sm border font-semibold text-md transition-all",
                "bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              )}
            >
              {firstSegment.departure.iataCode}
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              {format(parseISO(firstSegment.departure.at), "HH:mm")}
            </p>
          </div>

          <div className="flex-1 flex items-center gap-1 px-1 md:gap-2 md:px-2">
            <div
              className={cn(
                "h-1 flex-1 rounded-full",
                "bg-gray-300 dark:bg-gray-600"
              )}
            />
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full shadow-md transition-all duration-200 hover:scale-110",
                "bg-gray-500/50 dark:bg-gray-600 text-white"
              )}
            >
              <ArrowRight className="h-4 w-4" />
            </div>
            <div
              className={cn(
                "h-1 flex-1 rounded-full",
                "bg-gray-300 dark:bg-gray-600"
              )}
            />
          </div>

          <div className="text-center">
            <div
              className={cn(
                "px-1.5 py-0 md:px-2 md:py-0 rounded-sm border font-semibold text-md transition-all",
                "bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              )}
            >
              {lastSegment.arrival.iataCode}
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-1">
              {format(parseISO(lastSegment.arrival.at), "HH:mm")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg",
                "bg-gray-100/70 dark:bg-gray-800/30"
              )}
            >
              <Clock
                className={cn("h-3 w-3", "text-gray-600 dark:text-gray-400")}
              />
              <span className="text-xs font-medium">
                {formatDuration(itinerary.duration)}
              </span>
            </div>
            <div
              className={cn(
                "px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg text-xs font-medium",
                "bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300"
              )}
            >
              {stops === 0
                ? t("flightCard.nonStop")
                : t("flightCard.stops", { count: stops })}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "text-center py-1 px-2 md:py-1.5 md:px-3 rounded-lg font-medium text-xs",
            "bg-gray-50 dark:bg-gray-800/20 text-gray-700 dark:text-gray-300"
          )}
        >
          {format(parseISO(firstSegment.departure.at), "EEEE, MMM d, yyyy")}
        </div>
      </div>
    </div>
  );
}

export default function SelectedFlightCard() {
  const t = useTranslations("booking");
  const selectedFlight = useFlightStore((state) => state.selectedFlight);
  const router = useRouter();

  if (!selectedFlight) {
    return (
      <Card className="p-4 md:p-8 bg-gray-50 dark:bg-gray-800 border-dashed border-2 border-gray-300 dark:border-gray-600">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Plane className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {t("flightCard.noFlight")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("flightCard.selectFlight")}
            </p>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
          >
            {t("flightCard.browseFlights")}
          </Button>
        </div>
      </Card>
    );
  }

  const hasReturnFlight = selectedFlight.itineraries.length > 1;
  const adultCount =
    selectedFlight.travelerPricings?.filter((t) => t.travelerType === "ADULT")
      .length || 0;
  const childCount =
    selectedFlight.travelerPricings?.filter((t) => t.travelerType === "CHILD")
      .length || 0;
  const infantCount =
    selectedFlight.travelerPricings?.filter(
      (t) => t.travelerType === "HELD_INFANT"
    ).length || 0;
  const totalPassengers = selectedFlight.travelerPricings?.length || 0;

  return (
    <Card className="overflow-hidden bg-gray-50/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50">
      <div className="space-y-4 md:space-y-6">
        {/* Header Section */}
        <div className="p-3 pb-0 md:p-6 md:pb-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-600/70 dark:bg-gray-500/50 text-white shadow-md">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-md font-semibold text-gray-800/80 dark:text-gray-200">
                {hasReturnFlight ? t("flightCard.roundTrip") : t("flightCard.oneWay")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("flightCard.itineraryDetails")}
              </p>
            </div>
          </div>
        </div>

        {/* Flight Segments */}
        <div className="px-3 md:px-6">
          <div
            className={cn(
              "flex gap-3 md:gap-6",
              hasReturnFlight ? "flex-col xl:flex-row" : ""
            )}
          >
            <FlightSegment itinerary={selectedFlight.itineraries[0]} t={t} />
            {hasReturnFlight && (
              <FlightSegment
                itinerary={selectedFlight.itineraries[1]}
                isReturn
                t={t}
              />
            )}
          </div>
        </div>

        {/* Price and Passenger Info Section */}
        <div className="bg-gray-50/80 dark:bg-gray-700/30 border-t border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="w-full md:w-1/2 space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                {t("flightCard.totalFare")}
              </div>
              <div className="flex items-baseline gap-3">
                <div className="text-md font-semibold text-gray-800 dark:text-gray-200">
                  {selectedFlight.price.currency} {selectedFlight.price.total}
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  ({selectedFlight.price.currency})
                </span>
              </div>
            </div>
            <div className="text-right w-full md:w-1/2 space-y-2">
              <div className="flex items-center gap-2">
                {/* <div className="w-1.5 h-1.5 bg-primary rounded-full"></div> */}
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("flightCard.passengers", { count: totalPassengers })}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {adultCount > 0 && (
                  <span className="bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium border border-blue-500">
                    {t("flightCard.adults", { count: adultCount })}
                  </span>
                )}
                {childCount > 0 && (
                  <span className="bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium border border-green-500">
                    {t("flightCard.children", { count: childCount })}
                  </span>
                )}
                {infantCount > 0 && (
                  <span className="bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium border border-purple-500">
                    {t("flightCard.infants", { count: infantCount })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
