"use client";

import { Card } from "@/components/ui/card";
import useFlightStore from "@/lib/store/use-flight-store";
import usePassengerStore from "@/lib/store/use-passenger-store";
import { format, parseISO } from "date-fns";
import {
  ArrowRight,
  Clock,
  Plane,
  ArrowLeftRight,
  UserCircle2,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDuration } from "../../ticket-details/_components/flight-utils";
import { cn } from "@/lib/utils";

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
}

function FlightSegment({ itinerary, isReturn }: FlightSegmentProps) {
  const firstSegment = itinerary.segments[0];
  const lastSegment = itinerary.segments[itinerary.segments.length - 1];
  const stops = itinerary.segments.length - 1;

  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-4 rounded-lg border p-4",
        isReturn ? "bg-slate-50" : "bg-white"
      )}
    >
      <div className="flex items-center gap-2">
        <Plane
          className={cn(
            "h-5 w-5 transition-transform",
            isReturn && "rotate-180"
          )}
        />
        <span className="text-lg font-semibold">
          {firstSegment.carrierCode || "N/A"}
        </span>
        {isReturn && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            Return Flight
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div>
            <p className="font-medium text-lg">
              {firstSegment.departure.iataCode}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(parseISO(firstSegment.departure.at), "HH:mm")}
            </p>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="h-[2px] flex-1 bg-slate-200" />
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="h-[2px] flex-1 bg-slate-200" />
          </div>
          <div className="text-right">
            <p className="font-medium text-lg">
              {lastSegment.arrival.iataCode}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(parseISO(lastSegment.arrival.at), "HH:mm")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Duration: {formatDuration(itinerary.duration)}</span>
          <span>•</span>
          <span>
            {stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""}`}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          {format(parseISO(firstSegment.departure.at), "MMM d, yyyy")}
        </p>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  const selectedFlight = useFlightStore((state) => state.selectedFlight);
  const { passengers } = usePassengerStore();
  const router = useRouter();

  useEffect(() => {
    if (!selectedFlight || !passengers.length) {
      router.push("/flights");
    }
  }, [selectedFlight, passengers, router]);

  if (!selectedFlight || !passengers.length) {
    return null;
  }

  const hasReturnFlight = selectedFlight.itineraries.length > 1;
  const adultCount = passengers.filter(
    (p) => p.travelerType === "ADULT"
  ).length;
  const childCount = passengers.filter(
    (p) => p.travelerType === "CHILD"
  ).length;
  const infantCount = passengers.filter(
    (p) => p.travelerType === "HELD_INFANT"
  ).length;

  const handleDownloadTicket = () => {
    // Implement ticket download functionality
    // console.log("Download ticket");
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for booking with us.
            </p>
          </div>
          <Button onClick={handleDownloadTicket} className="gap-2">
            <Download className="h-4 w-4" />
            Download Ticket
          </Button>
        </div>

        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">
              {hasReturnFlight ? "Round Trip" : "One Way"}
            </h3>
          </div>

          <div
            className={cn(
              "flex gap-4",
              hasReturnFlight ? "flex-col md:flex-row" : ""
            )}
          >
            <FlightSegment itinerary={selectedFlight.itineraries[0]} />
            {hasReturnFlight && (
              <FlightSegment
                itinerary={selectedFlight.itineraries[1]}
                isReturn
              />
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Passenger Details</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Passport</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passengers.map((passenger) => (
                  <TableRow key={passenger.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCircle2
                          className={cn(
                            "h-4 w-4",
                            passenger.travelerType === "CHILD"
                              ? "text-blue-500"
                              : passenger.travelerType === "HELD_INFANT"
                                ? "text-pink-500"
                                : "text-primary"
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            passenger.travelerType === "CHILD"
                              ? "bg-blue-100 text-blue-600"
                              : passenger.travelerType === "HELD_INFANT"
                                ? "bg-pink-100 text-pink-600"
                                : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {passenger.travelerType === "HELD_INFANT"
                            ? "Infant"
                            : passenger.travelerType === "CHILD"
                              ? "Child"
                              : "Adult"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {passenger.firstName} {passenger.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(passenger.dateOfBirth),
                            "MMM d, yyyy"
                          )}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{passenger.passportNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{passenger.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {passenger.phoneNumber}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Passengers
                </p>
                <p className="text-sm">
                  {adultCount > 0 &&
                    `${adultCount} Adult${adultCount > 1 ? "s" : ""}`}
                  {childCount > 0 &&
                    ` • ${childCount} Child${childCount > 1 ? "ren" : ""}`}
                  {infantCount > 0 &&
                    ` • ${infantCount} Infant${infantCount > 1 ? "s" : ""}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">
                  {selectedFlight.price.currency} {selectedFlight.price.total}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.push("/flights")}
            className="gap-2"
          >
            Book Another Flight
          </Button>
        </div>
      </div>
    </main>
  );
}
