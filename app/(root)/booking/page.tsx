"use client";

import SelectedFlightCard from "./_components/selected-flight-card";
import PassengerForm from "./_components/passenger-form";
import useFlightStore, { FLIGHT_PERSISTENCE_MS } from "@/lib/store/use-flight-store";
import usePassengerStore from "@/lib/store/use-passenger-store";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  UserCircle2,
  Loader2,
  Check,
  CreditCard,
  X,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

interface TravelerData {
  id: string;
  dateOfBirth: string;
  name: {
    firstName: string;
    lastName: string;
  };
  gender: "MALE" | "FEMALE";
  travelerType: string;
  contact: {
    emailAddress: string;
    phones: {
      deviceType: string;
      countryCallingCode: string;
      number: string;
    }[];
  };

  associatedAdultId?: string;
}
export default function BookingPage() {
  const t = useTranslations("booking");
  const { data: session } = useSession();
  const selectedFlight = useFlightStore((state) => state.selectedFlight);
  const getTimeRemaining = useFlightStore((state) => state.getTimeRemaining);
  const clearExpiredFlight = useFlightStore((state) => state.clearExpiredFlight);
  const { passengers, clearPassengers, deletePassenger } = usePassengerStore();
  const persistedAt = usePassengerStore((state) => state.persistedAt);
  const clearExpiredPassengers = usePassengerStore((state) => state.clearExpiredPassengers);
  const router = useRouter();
  const { toast } = useToast();
  const [activePassenger, setActivePassenger] = useState<string | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    status: "idle" | "checking" | "available" | "unavailable" | "error";
    message?: string;
  }>({ status: "idle" });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [availabilityCheckedAt, setAvailabilityCheckedAt] = useState<
    number | null
  >(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [flightSelectionTimeRemaining, setFlightSelectionTimeRemaining] = useState<number | null>(null);

  // Constants
  const AVAILABILITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

  const requiredPassengers = selectedFlight?.travelerPricings?.length || 0;
  const progress = (passengers.length / requiredPassengers) * 100;

  // Helper function to check if availability has expired
  const isAvailabilityExpired = (): boolean => {
    if (!availabilityCheckedAt) return true;
    const now = Date.now();
    return now - availabilityCheckedAt > AVAILABILITY_TIMEOUT_MS;
  };

  // Format time remaining in MM:SS format
  const formatTimeRemaining = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleDeletePassenger = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deletePassenger(id);
    setActivePassenger(null);
    toast({
      title: t("toast.removed.title"),
      description: t("toast.removed.description"),
    });
  };

  const handleAddPassenger = () => {
    if (passengers.length >= requiredPassengers) {
      toast({
        title: t("toast.maxReached.title"),
        description: t("toast.maxReached.description", { count: requiredPassengers }),
        variant: "destructive",
      });
      return;
    }
    setActivePassenger("new");
  };

  const handleGoBackToFlights = () => {
    window.history.go(-2);
  };

  const handleProceedToPayment = async () => {
    if (passengers.length !== requiredPassengers) {
      toast({
        title: t("toast.missingPassengers.title"),
        description: t("toast.missingPassengers.description", { count: requiredPassengers }),
        variant: "destructive",
      });
      return;
    }

    // Check availability first
    if (!selectedFlight) {
      toast({
        title: t("toast.noFlight.title"),
        description: t("toast.noFlight.description"),
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if availability status has expired (more than 10 minutes old)
      const needsRecheck =
        availabilityStatus.status === "available" && isAvailabilityExpired();

      if (needsRecheck) {
        toast({
          title: t("toast.availabilityExpired.title"),
          description: t("status.rechecking"),
        });
      }

      // If already available and not expired, proceed to payment
      if (
        availabilityStatus.status === "available" &&
        !isAvailabilityExpired()
      ) {
        setIsProcessingPayment(true);
      } else {
        // Need to check or recheck availability
        setAvailabilityStatus({ status: "checking" });

        // Check availability using the existing API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/create-booking-amadeus`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                flightOffers: [selectedFlight],
                travelers: [
                  {
                    // Dummy traveler for availability check
                    id: "1",
                    dateOfBirth: "1990-01-01",
                    name: { firstName: "Test", lastName: "User" },
                    gender: "MALE",
                    travelerType: "ADULT",
                    contact: {
                      emailAddress: "test@example.com",
                      phones: [
                        {
                          deviceType: "MOBILE",
                          countryCallingCode: "34",
                          number: "123456789",
                        },
                      ],
                    },
                  },
                ],
                checkAvailabilityOnly: true,
              },
            }),
          }
        );

        const availabilityResult = await response.json();

        if (availabilityResult.length > 0 && availabilityResult[0].error) {
          setAvailabilityStatus({
            status: "unavailable",
            message: availabilityResult[0].detail || "Flight not available",
          });
          toast({
            title: t("toast.unavailable.title"),
            description:
              availabilityResult[0].detail ||
              t("toast.unavailable.description"),
            variant: "destructive",
          });
          return;
        } else if (!availabilityResult.available) {
          setAvailabilityStatus({
            status: "unavailable",
            message: t("toast.unavailable.description"),
          });
          toast({
            title: t("toast.unavailable.title"),
            description: t("toast.unavailable.description"),
            variant: "destructive",
          });
          return;
        }

        setAvailabilityStatus({ status: "available", message: "Available" });
        setAvailabilityCheckedAt(Date.now()); // Record the timestamp when availability was checked
        // Just checked availability, show the available state for user to confirm
        return;
      }

      // If we reach here, we're proceeding with payment (either skipped availability check or confirmed available)
      if (!isProcessingPayment) {
        setIsProcessingPayment(true);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setAvailabilityStatus({
        status: "error",
        message: "Error checking availability",
      });
      setIsProcessingPayment(false);
      toast({
        title: t("toast.failedAvailability.title"),
        description: t("toast.failedAvailability.description"),
        variant: "destructive",
      });
      return;
    }

    try {
      // Log initial state
      //console.log("Starting booking process...");
      //console.log("Selected Flight:", selectedFlight);
      //console.log("Passengers:", passengers);

      // Format travelers data according to Amadeus API requirements

      const travelers = passengers.map((passenger, index) => {
        //console.log(`Processing passenger ${index + 1}:`, passenger);
        const travelerData: TravelerData = {
          id: (index + 1).toString(),
          dateOfBirth: passenger.dateOfBirth,
          name: {
            firstName: passenger.firstName,
            lastName: passenger.lastName,
          },
          gender: passenger.gender,
          travelerType: passenger.travelerType,
          contact: {
            emailAddress: passenger.email,
            phones: [
              {
                deviceType: "MOBILE",
                countryCallingCode: "34",
                number: passenger.phoneNumber.replace(/\D/g, ""),
              },
            ],
          },
        };

        // Add associatedAdultId for HELD_INFANT travelers
        if (passenger.travelerType === "HELD_INFANT") {
          // Find the last adult traveler's ID
          const lastAdultId = passengers
            .slice(0, index)
            .reverse()
            .find((p) => p.travelerType === "ADULT")?.id;

          if (lastAdultId) {
            // Convert the found ID to the correct format (1-based index)
            const adultIndex = passengers.findIndex(
              (p) => p.id === lastAdultId
            );
            travelerData.associatedAdultId = (adultIndex + 1).toString();
          }
        }

        return travelerData;
      });

      // Format the request body for Amadeus booking
      if (!selectedFlight) {
        throw new Error("No flight selected");
      }

      // Make the API call
      //console.log("Making API call to create-booking-amadeus...");
      const bookAmadeus = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/create-booking-amadeus`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              flightOffers: [selectedFlight],
              travelers: travelers,
              remarks: {
                general: [
                  {
                    subType: "GENERAL_MISCELLANEOUS",
                    text: "ONLINE BOOKING FROM INCREIBLE VIAJES",
                  },
                ],
              },
              ticketingAgreement: {
                option: "DELAY_TO_CANCEL",
                delay: "6D",
              },
              contacts: [
                {
                  addresseeName: {
                    firstName: "PABLO",
                    lastName: "RODRIGUEZ",
                  },
                  companyName: "INCREIBLE VIAJES",
                  purpose: "STANDARD",
                  phones: [
                    {
                      deviceType: "LANDLINE",
                      countryCallingCode: "34",
                      number: "480080071",
                    },
                    {
                      deviceType: "MOBILE",
                      countryCallingCode: "33",
                      number: "480080072",
                    },
                  ],
                  emailAddress: "support@increibleviajes.es",
                  address: {
                    lines: ["Calle Prado, 16"],
                    postalCode: "28014",
                    cityName: "Madrid",
                    countryCode: "ES",
                  },
                },
              ],
            },
          }),
        }
      );

      // Log the response status
      //console.log("Amadeus API response status:", bookAmadeus.status);

      const amadeusRes = await bookAmadeus.json();
      //console.log("Amadeus API response:", amadeusRes);

      if (amadeusRes.success && amadeusRes.bookingId) {
        //console.log(
        //  "Amadeus booking successful, creating Stripe checkout session..."
        //);

        // Create Stripe checkout session
        const requestBody = {
          cartItems: [
            {
              item: {
                title: "Flight Booking",
                price: amadeusRes.details.flightOffers[0].price.grandTotal,
              },
            },
          ],
          customer: {
            userId: session?.user?.id || "",
            email: session?.user?.email || "",
            name: session?.user?.name || "",
          },
          amadeusBookingId: amadeusRes.bookingId,
        };

        //console.log("Stripe checkout request body:", requestBody);

        const stripeRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/checkout`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        //console.log("Stripe API response status:", stripeRes.status);

        const stripeResJson = await stripeRes.json();
        //console.log("Stripe API response:", stripeResJson);

        if (stripeResJson.url) {
          //console.log("Redirecting to Stripe checkout...");

          // Clear passenger data before redirecting to payment
          // Data is no longer needed and shouldn't persist after booking initiated
          clearPassengers();

          window.location.href = stripeResJson.url;
        } else {
          //console.log("No checkout URL received from Stripe");
          setIsProcessingPayment(false);
        }
      } else {
        //console.log("Amadeus booking failed:", amadeusRes);
        toast({
          title: t("toast.failedBooking.title"),
          description: t("toast.failedBooking.description"),
          variant: "destructive",
        });
        setIsProcessingPayment(false);
      }
    } catch (error) {
      //console.log("Booking error:", error);
      toast({
        title: t("toast.failedBooking.title"),
        description: error instanceof Error ? error.message : t("toast.failedBooking.description"),
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };
  // Countdown timer effect - updates every second to show remaining time
  useEffect(() => {
    if (availabilityStatus.status === "available" && availabilityCheckedAt) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - availabilityCheckedAt;
        const remaining = AVAILABILITY_TIMEOUT_MS - elapsed;

        if (remaining <= 0) {
          // Availability has expired
          setAvailabilityStatus({ status: "idle" });
          setAvailabilityCheckedAt(null);
          setTimeRemaining(null);
          toast({
            title: t("toast.availabilityExpired.title"),
            description: t("toast.availabilityExpired.description"),
            variant: "destructive",
          });
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000); // Update every second

      return () => clearInterval(interval);
    } else {
      setTimeRemaining(null);
    }
  }, [
    availabilityStatus.status,
    availabilityCheckedAt,
    AVAILABILITY_TIMEOUT_MS,
    toast,
  ]);

  // Check flight selection expiration (20 minutes)
  useEffect(() => {
    if (!selectedFlight) {
      return;
    }

    // Update flight selection time remaining every second
    const flightExpirationInterval = setInterval(() => {
      const remaining = getTimeRemaining();

      if (remaining === null || remaining <= 0) {
        // Flight selection expired
        clearExpiredFlight();
        toast({
          title: "Flight Selection Expired",
          description: "Your flight selection has expired after 20 minutes. Please search for flights again.",
          variant: "destructive",
        });
        router.push("/flights");
      } else {
        setFlightSelectionTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(flightExpirationInterval);
  }, [selectedFlight, getTimeRemaining, clearExpiredFlight, router, toast]);

  // Check passenger data expiration (20 minutes)
  useEffect(() => {
    if (passengers.length === 0) return;

    const passengerExpirationInterval = setInterval(() => {
      const expired = clearExpiredPassengers();
      if (expired) {
        toast({
          title: "Passenger Data Expired",
          description: "Your passenger details have expired after 20 minutes and have been cleared.",
          variant: "destructive",
        });
      }
    }, 1000);

    return () => clearInterval(passengerExpirationInterval);
  }, [passengers.length, clearExpiredPassengers, toast]);

  useEffect(() => {
    if (!selectedFlight) {
      //router.push("/flights");
      //console.log("No flight selected");
    }
    //return () => clearPassengers();
  }, [selectedFlight, router, clearPassengers]);
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-2 px-0 sm:px-2 lg:p-8">
      <div className="container mx-auto px-0 py-0">
        <div className="mx-auto max-w-full space-y-8">
          {/* Header Section */}
          {/* <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Complete Your Booking
            </h1>
            <p className="text-muted-foreground">
              Review your flight details and add passenger information
            </p>
          </div> */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Flight Details Section */}
            <section className="space-y-6 lg:sticky lg:top-4 lg:h-fit">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl px-1 py-2 shadow-lg border border-white/20">
                <h2 className="text-md font-semibold mb-4 flex items-center gap-2 px-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  {t("section.flight")}
                </h2>
                <SelectedFlightCard />

                {/* Flight Selection Expiration Timer */}
                {flightSelectionTimeRemaining !== null && selectedFlight && (
                  <div className="mt-3 px-3">
                    <div
                      className={cn(
                        "flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs transition-colors",
                        flightSelectionTimeRemaining < 5 * 60 * 1000
                          ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                          : flightSelectionTimeRemaining < 10 * 60 * 1000
                            ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800"
                            : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                      )}
                    >
                      <span className="font-medium">Flight selection expires in:</span>
                      <span className="font-mono font-bold">
                        {formatTimeRemaining(flightSelectionTimeRemaining)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Passenger Details Section */}
            <section className="space-y-6">
              {/* Security Warning Banner */}
              {passengers.length > 0 && persistedAt && (
                <div className="rounded-lg border border-yellow-200 dark:border-yellow-800/50 bg-yellow-50 dark:bg-yellow-900/20 p-3 md:p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        Sensitive Information Stored
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        Your passenger details are temporarily saved for convenience. They will be automatically cleared in 20 minutes or after booking completion.
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                        Data saved: {Math.floor((Date.now() - persistedAt) / 1000 / 60)} minute(s) ago
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        clearPassengers();
                        toast({
                          title: "Passenger data cleared",
                          description: "All passenger information has been removed.",
                        });
                      }}
                      className="text-yellow-700 hover:text-yellow-900 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl px-2 md:px-4 py-2 md:py-4 shadow-lg border border-white/20">
                <div className="space-y-4 px-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-md font-semibold hidden md:flex items-center gap-2 ">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      {t("section.passenger")}
                    </h2>
                    <div className="text-sm text-muted-foreground bg-slate-100 dark:bg-slate-700 px-0 md:px-3 py-1 rounded-full">
                      {t("passenger.count", { current: passengers.length, total: requiredPassengers })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Progress
                      value={progress}
                      className="h-[2px] bg-slate-200 dark:bg-slate-700"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("progress.label")}</span>
                      <span className="font-medium">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {passengers.map((passenger, index) => (
                  <Card
                    key={passenger.id}
                    className="overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-white/20 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Accordion
                      type="single"
                      value={activePassenger === passenger.id ? "details" : ""}
                      onValueChange={(value) =>
                        setActivePassenger(value ? passenger.id : null)
                      }
                    >
                      <AccordionItem value="details" className="border-none">
                        <div className="flex items-center justify-between px-2 md:px-3 py-1">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div
                                className={cn(
                                  "flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110",
                                  passenger.travelerType === "CHILD"
                                    ? "bg-blue-100 dark:bg-blue-900/30"
                                    : passenger.travelerType === "HELD_INFANT"
                                      ? "bg-pink-100"
                                      : "bg-primary/10"
                                )}
                              >
                                <UserCircle2
                                  className={cn(
                                    "h-5 w-5",
                                    passenger.travelerType === "CHILD"
                                      ? "text-green-600 "
                                      : passenger.travelerType === "HELD_INFANT"
                                        ? "text-purple-600 "
                                        : "text-primary"
                                  )}
                                />
                              </div>
                              {/* <span className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                {index + 1}
                              </span> */}
                            </div>
                            <div className="text-left relative">
                              <div className="flex items-center gap-3 mb-0">
                                <div className="font-semibold text-foreground truncate">
                                  {passenger.firstName} {passenger.lastName}
                                </div>
                                {/* <div className="absolute -bottom-4 -left-5 ">
                                  {passenger.travelerType === "CHILD" && (
                                    <span className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-3 py-0.5 font-small font-medium text-blue-600 dark:text-blue-400">
                                      Child
                                    </span>
                                  )}
                                  {passenger.travelerType === "HELD_INFANT" && (
                                    <span className="rounded-full bg-pink-100 dark:bg-pink-900/50 px-3 py-1 font-small font-medium text-pink-600 dark:text-pink-400">
                                      Infant
                                    </span>
                                  )}
                                </div> */}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <AccordionTrigger className="hover:no-underline group p-2"></AccordionTrigger>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) =>
                                handleDeletePassenger(passenger.id, e)
                              }
                              className="opacity-80 hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <AccordionContent className="border-t border-white/10 px-6 py-6 bg-slate-50/50 dark:bg-slate-700/50">
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActivePassenger(null)}
                              className="absolute top-1 right-1 w-8 h-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors z-10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <PassengerForm
                              passengerId={passenger.id}
                              onComplete={() => setActivePassenger(null)}
                              travelerType={passenger.travelerType}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </Card>
                ))}

                {passengers.length < requiredPassengers && (
                  <Card
                    className={cn(
                      "overflow-hidden transition-all duration-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-dashed border-2 hover:shadow-lg hover:bg-white/90 dark:hover:bg-slate-800/90",
                      activePassenger === "new"
                        ? "ring-2 ring-primary shadow-lg bg-white/95 dark:bg-slate-800/95"
                        : "border-slate-300 dark:border-slate-600 hover:border-primary/50"
                    )}
                  >
                    {activePassenger === "new" ? (
                      <div className="p-6 bg-slate-50/50 dark:bg-slate-700/50 relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActivePassenger(null)}
                          className="absolute top-2 right-2 w-8 h-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors z-10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <PassengerForm
                          onComplete={() => setActivePassenger(null)}
                          travelerType={
                            selectedFlight?.travelerPricings?.[
                              passengers.length
                            ]?.travelerType || "ADULT"
                          }
                        />
                      </div>
                    ) : (
                      <Button
                        onClick={handleAddPassenger}
                        className="h-auto w-full gap-3 p-8 text-base font-medium hover:scale-[1.02] transition-all duration-200"
                        variant="ghost"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20">
                          <Plus className="h-5 w-5 text-primary" />
                        </div>
                        <span>{t("button.addPassenger", { number: passengers.length + 1 })}</span>
                        {selectedFlight?.travelerPricings?.[passengers.length]
                          ?.travelerType === "CHILD" && (
                          <span className="ml-2 rounded-full bg-blue-100 dark:bg-blue-900/50 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                            {t("badges.child")}
                          </span>
                        )}
                        {selectedFlight?.travelerPricings?.[passengers.length]
                          ?.travelerType === "HELD_INFANT" && (
                          <span className="ml-2 rounded-full bg-pink-100 dark:bg-pink-900/50 px-3 py-1 text-xs font-medium text-pink-600 dark:text-pink-400">
                            {t("badges.infant")}
                          </span>
                        )}
                      </Button>
                    )}
                  </Card>
                )}
              </div>

              {passengers.length > 0 && (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-2 md:p-6 shadow-lg border border-white/20">
                  <Button
                    onClick={
                      availabilityStatus.status === "unavailable"
                        ? handleGoBackToFlights
                        : handleProceedToPayment
                    }
                    className={cn(
                      "w-full transition-all duration-300 ease-in-out min-h-14 text-sm sm:text-base md:text-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
                      availabilityStatus.status === "unavailable"
                        ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                        : "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    )}
                    size="lg"
                    disabled={
                      availabilityStatus.status === "unavailable"
                        ? false
                        : passengers.length !== requiredPassengers ||
                          availabilityStatus.status === "checking" ||
                          isProcessingPayment ||
                          availabilityStatus.status === "error"
                    }
                    aria-live="polite"
                    aria-busy={
                      availabilityStatus.status === "checking" ||
                      isProcessingPayment
                    }
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-1">
                      {availabilityStatus.status === "checking" ? (
                        <>
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          <span className="text-center">
                            {t("button.checkingAvailability")}
                          </span>
                        </>
                      ) : isProcessingPayment ? (
                        <>
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          <span className="text-center">
                            {t("button.processingPayment")}
                          </span>
                        </>
                      ) : availabilityStatus.status === "available" ? (
                        <>
                          <div className="flex items-center gap-1.5">
                            <Check
                              className="h-4 w-4 text-green-400 animate-pulse"
                              aria-hidden="true"
                            />
                            <span className="font-medium">{t("button.available")}</span>
                          </div>
                          <span className="hidden sm:inline text-white/40">
                            •
                          </span>
                          <div className="flex items-center gap-1.5">
                            <CreditCard
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            <span>{t("button.proceedPayment")}</span>
                          </div>
                        </>
                      ) : availabilityStatus.status === "unavailable" ? (
                        <>
                          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                          <span className="text-center">
                            {t("button.goBackToFlights")}
                          </span>
                        </>
                      ) : availabilityStatus.status === "error" ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="text-2xl leading-none"
                            role="img"
                            aria-label="Warning"
                          >
                            ⚠️
                          </span>
                          <span className="text-center">
                            {availabilityStatus.message || t("toast.failedAvailability.description")}
                          </span>
                        </div>
                      ) : passengers.length === requiredPassengers ? (
                        <>
                          <CreditCard className="h-4 w-4" aria-hidden="true" />
                          <span className="text-center">
                            {t("button.checkAvailabilityProceed")}
                          </span>
                        </>
                      ) : (
                        <span className="text-center">
                          {t("passenger.addMore", { count: requiredPassengers - passengers.length })}
                        </span>
                      )}
                    </div>
                  </Button>

                  {/* Countdown timer when availability is confirmed */}
                  {availabilityStatus.status === "available" &&
                    timeRemaining !== null && (
                      <div className="mt-3 flex items-center justify-center gap-2 text-xs sm:text-sm px-2">
                        <div
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                            timeRemaining < 2 * 60 * 1000
                              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                              : timeRemaining < 5 * 60 * 1000
                                ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                                : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                          )}
                        >
                          <span className="font-medium">{t("countdown.label")}</span>
                          <span className="font-mono font-bold text-base">
                            {formatTimeRemaining(timeRemaining)}
                          </span>
                        </div>
                      </div>
                    )}

                  {/* if unavailable show message */}
                  {availabilityStatus.status === "unavailable" && (
                    <div
                      className="mt-3 text-xs sm:text-sm text-red-600 dark:text-red-400 text-center font-medium px-2"
                      role="alert"
                    >
                      {availabilityStatus.message ||
                        t("toast.unavailable.description")}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
