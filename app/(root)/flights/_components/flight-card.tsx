"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FlightOffer } from "amadeus-ts";
import { format, parseISO } from "date-fns";
import useFlightStore from "@/lib/store/use-flight-store";
import { useRouter } from "next/navigation";
import { CircleOff, Plane } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  currencyConvertToSymbol,
  formatDuration,
  safeParseISO,
} from "../../ticket-details/_components/flight-utils";
import { formatIfFirstLetterUppercase } from "@/lib/utils";
import FlightLogoImage from "../../ticket-details/_components/flight-logo-image";

interface Props {
  flight: FlightOffer;
  type?: "advantageous" | "cheapest" | "fastest";
}

export default function FlightCard({ flight, type = "advantageous" }: Props) {
  // console.log("FLIGHT :", flight);
  const t = useTranslations("flights.card");
  const router = useRouter();
  const setSelectedFlight = useFlightStore((state) => state.setSelectedFlight);

  // Extract itineraries and segments
  const outboundItinerary = flight.itineraries[0];
  const returnItinerary = flight.itineraries[1];
  const isRoundTrip = flight.itineraries.length > 1;

  // Get first and last segments for each itinerary
  const outboundFirstSegment = outboundItinerary.segments[0];
  const outboundLastSegment =
    outboundItinerary.segments[outboundItinerary.segments.length - 1];

  // Calculate stops for each itinerary
  const outboundStops = (outboundItinerary?.segments.length || 1) - 1;

  // Extract pricing information
  const price = flight.price.total;
  const currency = flight.price.currency;

  const isIncludeCheckInBag = flight.pricingOptions?.includedCheckedBagsOnly;

  if (!outboundFirstSegment || !outboundLastSegment) return null;

  const handleSelectFlight = () => {
    setSelectedFlight(flight);
    router.push("/ticket-details");
  };

  // Reusable function to render flight section
  const renderFlightSection = (
    itinerary: typeof outboundItinerary,
    label: string,
    firstSegment: typeof outboundFirstSegment,
    lastSegment: typeof outboundLastSegment,
    stops: number
  ) => (
    <div className="mb-6 p-2">
      <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-600">
        <div className="flex items-center">
          <span>{label}</span>
          <span className="mx-1">•</span>
          <span>{firstSegment.carrierCode}</span>
          <span className="block md:hidden ml-2">
            <FlightLogoImage
              segment={firstSegment}
              width={15}
              height={15}
              cssClass="block md:hidden ml-2"
            />
          </span>
        </div>
        <span className="flex items-center justify-end ml-auto">
          {formatIfFirstLetterUppercase(
            format(
              safeParseISO(firstSegment.departure.at),
              "MMM dd yyyy"
            ).toLowerCase()
          )}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex justify-between w-full md:w-2/3 border-0 md:border-x p-0 md:p-3">
          <div className="hidden md:flex items-center justify-start w-[50px]">
            <FlightLogoImage segment={firstSegment} width={30} height={30} />
          </div>
          <div className="w-full md:w-[calc(100%-50px)] flex justify-between px-0 md:px-2">
            <div>
              <div className="text-md font-semibold">
                {format(parseISO(firstSegment.departure.at), "HH:mm")}
              </div>
              <div className="text-sm text-gray-600">
                {firstSegment.departure.iataCode}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center justify-around gap-3 border rounded-full px-3 py-1">
                <div className="text-xs text-gray-500">
                  {formatDuration(itinerary.duration)}
                </div>
                <Plane
                  size={14}
                  strokeWidth={1}
                  className="rotate-45 mx-2 text-blue-500"
                />
                <div className="text-xs text-gray-500">
                  {stops === 0 ? t("direct") : t("stops", { count: stops })}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-md font-semibold">
                  {format(parseISO(lastSegment.arrival.at), "HH:mm")}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {lastSegment.arrival.iataCode}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center md:justify-end w-full md:w-1/3">
          {isIncludeCheckInBag ? (
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
      </div>
    </div>
  );

  return (
    <>
      <Card
        className="mb-4 overflow-hidden rounded-xs border shadow-sm p-2 md:p-2"
        onClick={handleSelectFlight}
      >
        <div className="p-0 md:p-6 bg-white pb-2 md:pb-0">
          {/* Departure Section */}
          {renderFlightSection(
            outboundItinerary,
            t("departure"),
            outboundFirstSegment,
            outboundLastSegment,
            outboundStops
          )}
          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Return Section */}
          {isRoundTrip &&
            returnItinerary &&
            (() => {
              const returnFirstSegment = returnItinerary.segments[0];
              const returnLastSegment =
                returnItinerary.segments[returnItinerary.segments.length - 1];
              const returnStops = returnItinerary.segments.length - 1;

              return renderFlightSection(
                returnItinerary,
                t("return"),
                returnFirstSegment,
                returnLastSegment,
                returnStops
              );
            })()}

          <div className="flex gap-4 justify-end">
            {/* Discounted Price */}
            <Button
              className="p-4 bg-blue-600 text-white rounded-sm relative"
              onClick={handleSelectFlight}
            >
              <div className="text-right ml-auto">
                {/* <div className="text-sm opacity-75 line-through">€ 905</div> */}
                <div className="text-md md:text-xl font-bold">
                  {" "}
                  {currencyConvertToSymbol(currency)} {price}
                </div>
                {/* <div className="text-sm opacity-90">
                  Prime fare per passenger
                </div> */}
              </div>
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
