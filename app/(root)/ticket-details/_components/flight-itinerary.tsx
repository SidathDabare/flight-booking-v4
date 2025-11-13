"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { PlaneIcon } from "@/components/icons/PlaneIcon";
import { format } from "date-fns";
import { FlightItineraryProps } from "@/app/(root)/ticket-details/_components/flight-itinerary-types";
import { safeParseISO } from "@/app/(root)/ticket-details/_components/flight-utils";
import { FlightHeader } from "@/app/(root)/ticket-details/_components/flight-header";
import { FlightFooter } from "@/app/(root)/ticket-details/_components/flight-footer";
import { ItinerarySection } from "@/app/(root)/ticket-details/_components/itinerary-section";
import { useTranslations } from "next-intl";

export const FlightItinerary: React.FC<FlightItineraryProps> = ({
  departure,
  returnFlight,
  locationDict,
  baggageDetails,
  connectionInsurance = true,
  checkInBaggage,
}) => {
  const t = useTranslations("ticketDetails.itinerary");
  const [isExpanded, setIsExpanded] = useState(false);

  const { departureDate, returnDate } = useMemo(
    () => ({
      departureDate: format(
        safeParseISO(departure.segments[0].departure.at),
        "EEE, MMM dd"
      ),
      returnDate: returnFlight
        ? format(
            safeParseISO(returnFlight.segments[0].departure.at),
            "EEE, MMM dd"
          )
        : "",
    }),
    [departure.segments, returnFlight]
  );

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-md border-0 overflow-hidden backdrop-blur-sm rounded-none">
      {/* <FlightHeader /> */}

      <ItinerarySection
        title={t("departure")}
        icon={<PlaneIcon className="w-4 h-4 text-blue-600 rotate-0" />}
        itinerary={departure}
        isExpanded={isExpanded}
        mainDate={departureDate}
        locationDict={locationDict}
        baggageDetails={baggageDetails}
        connectionInsurance={connectionInsurance}
        checkInBaggage={checkInBaggage}
      />

      {returnFlight && (
        <ItinerarySection
          title={t("return")}
          icon={<PlaneIcon className="w-4 h-4 text-blue-600 -rotate-180" />}
          itinerary={returnFlight}
          isExpanded={isExpanded}
          mainDate={returnDate}
          locationDict={locationDict}
          baggageDetails={baggageDetails}
          connectionInsurance={connectionInsurance}
          checkInBaggage={checkInBaggage}
        />
      )}

      <FlightFooter
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded(!isExpanded)}
        connectionInsurance={connectionInsurance}
      />
    </Card>
  );
};

export default FlightItinerary;
