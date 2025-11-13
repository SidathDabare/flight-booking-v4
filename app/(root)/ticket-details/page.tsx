"use client";

import { Card } from "@/components/ui/card";
import useFlightStore from "@/lib/store/use-flight-store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import FareRules from "./_components/fare-rules";
import { FlightItinerary } from "@/app/(root)/ticket-details/_components/flight-itinerary";
import { getCurrencyCode } from "@/lib/utils/currency";
import { useTranslations } from "next-intl";

export default function TicketDetailsPage() {
  const t = useTranslations("ticketDetails");
  const selectedFlight = useFlightStore((state) => state.selectedFlight);
  const router = useRouter();
  const { data: session } = useSession();

  const handleContinueBooking = () => {
    if (!session) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent("/ticket-details");
      router.push(`/auth/signin?callbackUrl=${returnUrl}`);
      return;
    }

    // User is authenticated, proceed to booking
    router.push("/booking");
  };

  if (!selectedFlight) {
    return (
      <div className="container mx-auto p-8 text-center w-full min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-4">{t("noFlightSelected")}</h1>
        <Button onClick={() => router.push("/flights")}>
          {t("returnToSearch")}
        </Button>
      </div>
    );
  }

  const outboundItinerary = selectedFlight.itineraries[0];
  const returnItinerary = selectedFlight.itineraries[1];
  const isRoundTrip = selectedFlight.itineraries.length > 1;
  const rawBaggageDetails =
    selectedFlight.travelerPricings?.[0]?.fareDetailsBySegment || [];

  // Transform the data to match BaggageDetail interface
  const baggageDetails = rawBaggageDetails.map((detail) => ({
    segmentId: detail.segmentId,
    cabin: detail.cabin || "",
    fareBasis: detail.fareBasis || "",
    brandedFare: detail.brandedFare || "",
    class: detail.class || "",
    includedCabinBags: (detail as any).includedCabinBags?.quantity
      ? {
          quantity: (detail as any).includedCabinBags.quantity,
        }
      : undefined,
    includedCheckedBags:
      detail.includedCheckedBags && detail.includedCheckedBags.weight
        ? {
            weight: detail.includedCheckedBags.weight,
            weightUnit: detail.includedCheckedBags.weightUnit || "KG",
            quantity: detail.includedCheckedBags.quantity ?? 0,
          }
        : undefined,
  }));
  const checkInBaggage = selectedFlight.pricingOptions?.includedCheckedBagsOnly;

  return (
    <div className="container w-full h-full mx-auto p-0 py-2 md:p-4 space-y-8">
      {/* <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Flight Details</h1>
        <p className="text-gray-600">Review your selected flight itinerary</p>
      </div> */}

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Enhanced Flight Itinerary */}
        <div className="xl:w-2/3">
          <FlightItinerary
            departure={{
              segments: outboundItinerary.segments,
              duration: outboundItinerary.duration,
            }}
            returnFlight={
              isRoundTrip && returnItinerary
                ? {
                    segments: returnItinerary.segments,
                    duration: returnItinerary.duration,
                  }
                : undefined
            }
            connectionInsurance={true}
            checkInBaggage={checkInBaggage}
            baggageDetails={baggageDetails}
          />
        </div>
        {/* Price Information */}
        <Card className="xl:w-1/3 h-fit shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-semibold text-gray-900/80">
                {t("priceBreakdown")}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {t("perPassengerPricing")}
              </p>
            </div>

            {/* Passenger Pricing Details */}
            <div className="space-y-1">
              {selectedFlight.travelerPricings?.map((pricePer, travelerId) => (
                <div
                  key={travelerId}
                  className="flex justify-between items-center py-1 px-4 bg-gray-50/50 rounded-xs border border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900/80 capitalize">
                      {pricePer?.travelerType === "ADULT"
                        ? t("adult")
                        : pricePer?.travelerType === "HELD_INFANT"
                          ? t("infant")
                          : pricePer?.travelerType === "CHILD"
                            ? t("child")
                            : pricePer?.travelerType?.toLowerCase()}
                    </span>
                    <span className="text-xs text-gray-500">{t("perPerson")}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900/80">
                      {pricePer?.price?.currency} {pricePer?.price?.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xs border border-blue-100">
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-gray-900/80">
                    {t("totalAmount")}
                  </span>
                  <span className="text-xs text-gray-600">
                    {t("allPassengersIncluded")}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-semibold text-blue-600">
                    {getCurrencyCode(selectedFlight.price.currency)}{" "}
                    {selectedFlight.price.grandTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button
                onClick={handleContinueBooking}
                size="lg"
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {t("continueToBooking")}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Fare Rules Section */}
      <div>
        <FareRules selectedFlight={selectedFlight} />
      </div>
    </div>
  );
}
