"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Plane,
  Clock,
  CreditCard,
  User,
  MapPin,
  AlertCircle,
  Trash2,
  Copy,
  RefreshCcw,
  Download,
  ArrowRight,
  Calendar,
  Timer,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface Booking {
  id: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  ticketSent: boolean;
  ticketSentAt?: string;
  bookingReference?: string;
  amadeusBookingId?: string;
  queuingOfficeId?: string;
  customerName?: string;
  customerEmail?: string;
  userId?: string;
  departure?: {
    airport: string;
    city?: string;
    country?: string;
    time: string;
  };
  arrival?: {
    airport: string;
    city?: string;
    country?: string;
    time: string;
  };
  airline?: string;
  flightNumber?: string;
  price?: string;
  currency?: string;
  travelers: number;
  isReturn: boolean;
  paymentIntent?: string;
  bookingDate?: string;
  flightOffers?: Array<{
    id: string;
    source: string;
    price: {
      currency: string;
      total: string;
      base: string;
      grandTotal: string;
    };
    travelerPricings: Array<{
      travelerId: string;
      travelerType: string;
      price: {
        currency: string;
        total: string;
        base: string;
        refundableTaxes?: string;
      };
    }>;
    itineraries?: Array<{
      duration?: string;
      segments: Array<{
        departure: {
          iataCode: string;
          at: string;
          terminal?: string;
        };
        arrival: {
          iataCode: string;
          at: string;
          terminal?: string;
        };
        carrierCode: string;
        number: string;
        aircraft?: { code: string };
        operating?: { carrierCode: string };
        duration?: string;
        cabin?: string;
        bookingClass?: string;
      }>;
    }>;
  }>;
}

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (bookingId: string, newStatus: string) => Promise<void>;
  onDeleteBooking: (bookingId: string) => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onUpdateStatus,
  onDeleteBooking,
  isUpdating,
  isDeleting,
}: BookingDetailsModalProps) {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  console.log("Booking data:", booking);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatPrice = (price?: string, currency?: string) => {
    if (!price) return "-";
    const numPrice = parseFloat(price);
    return `${currency || "USD"} ${numPrice.toLocaleString()}`;
  };

  const calculateRefundableTaxes = () => {
    if (!booking?.flightOffers) return null;

    let totalRefundableTaxes = 0;
    let currency = "";

    booking.flightOffers.forEach((offer) => {
      offer.travelerPricings.forEach((pricing) => {
        if (pricing.price.refundableTaxes) {
          totalRefundableTaxes += parseFloat(pricing.price.refundableTaxes);
          if (!currency) currency = pricing.price.currency;
        }
      });
    });

    return totalRefundableTaxes > 0
      ? { amount: totalRefundableTaxes, currency }
      : null;
  };

  const refundableTaxes = useMemo(() => {
    return calculateRefundableTaxes();
  }, [booking?.flightOffers]);

  const RefundDisplay = () => {
    if (!refundableTaxes) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <XCircle className="h-4 w-4" />
          <span>No Refundable Taxes</span>
        </div>
      );
    }

    const formattedAmount = `${refundableTaxes.currency} ${refundableTaxes.amount.toLocaleString()}`;

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm">
          <RefreshCcw className="h-4 w-4 text-green-600" />
          <span className="text-muted-foreground">Refundable Taxes:</span>
          <span
            className="font-medium text-green-600"
            aria-label={`Refunded amount: ${formattedAmount}`}
          >
            {formattedAmount}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => copyToClipboard(formattedAmount, "Refund amount")}
          aria-label="Copy refund amount to clipboard"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBooking = async () => {
    if (booking) {
      await onDeleteBooking(booking.id);
      setShowDeleteConfirm(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!booking) return;

    try {
      const response = await fetch(`/api/pdf-download/${booking.id}`);

      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `booking-${booking.bookingReference || booking.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
    }
  };

  if (!booking) return null;

  return (
    <>
      {/* Enhanced Booking Details Modal */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] w-[95vw] p-1 overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start px-3 py-2 border-b gap-2">
            <div className="flex-0">
              <DialogTitle className="text-sm sm:text-md font-semibold flex items-center gap-2">
                <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                Booking Details
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                {booking.bookingReference || booking.id}
              </DialogDescription>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center justify-start gap-1 sm:gap-2 flex-wrap ml-8">
              {booking.status === "pending" && (
                <Button
                  size="sm"
                  onClick={() => onUpdateStatus(booking.id, "Confirmed")}
                  disabled={isUpdating || isDeleting}
                  className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                >
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">
                    {isUpdating ? "Confirming..." : "Confirm"}
                  </span>
                  <span className="sm:hidden">✓</span>
                </Button>
              )}

              {/* Delete Button with Confirmation */}
              {booking.status !== "cancelled" ? (
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isUpdating || isDeleting}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs sm:text-sm"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">
                    {isDeleting ? "Cancelling..." : "Cancel Booking"}
                  </span>
                  <span className="sm:hidden">✗</span>
                </Button>
              ) : (
                <RefundDisplay />
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-2 space-y-3">
              {/* Status Banner */}
              <div
                className={`p-3 rounded-lg border-l-4 ${
                  booking.status === "confirmed"
                    ? "bg-green-50 border-l-green-500 dark:bg-green-950"
                    : booking.status === "pending"
                      ? "bg-yellow-50 border-l-yellow-500 dark:bg-yellow-950"
                      : "bg-red-50 border-l-red-500 dark:bg-red-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {booking.status === "confirmed" && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {booking.status === "pending" && (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    {booking.status === "cancelled" && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium capitalize">
                      {booking.status} Booking
                    </span>
                  </div>
                  <Badge
                    variant={getStatusBadgeVariant(booking.status)}
                    className="text-xs capitalize"
                  >
                    {booking.status}
                  </Badge>
                </div>
              </div>

              {/* Comprehensive Flight Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Plane className="h-4 w-4" />
                    Flight Itinerary {booking.isReturn && "(Round Trip)"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  {booking.flightOffers &&
                  booking.flightOffers[0]?.itineraries ? (
                    <div className="space-y-4">
                      {booking.flightOffers[0].itineraries.map(
                        (itinerary: any, legIndex: number) => (
                          <div key={legIndex} className="border rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge
                                variant={
                                  legIndex === 0 ? "default" : "secondary"
                                }
                                className="text-xs"
                              >
                                {legIndex === 0 ? "Outbound" : "Return"} Flight
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {itinerary.segments?.length || 0} segment(s)
                              </span>
                            </div>

                            {itinerary.segments?.map(
                              (segment: any, segmentIndex: number) => (
                                <div
                                  key={segmentIndex}
                                  className={`${segmentIndex > 0 ? "mt-3 pt-3 border-t border-gray-200 dark:border-gray-700" : ""}`}
                                >
                                  {/* Mobile-first layout */}
                                  <div className="block lg:hidden">
                                    {/* Mobile Flight Header */}
                                    <div className="flex justify-between items-center mb-2">
                                      <div className="font-semibold text-sm">
                                        {segment.airline || "N/A"}
                                        {segment.aircraft || ""}
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {segment.cabin || ""}
                                      </Badge>
                                    </div>

                                    {/* Mobile Route Display */}
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="text-center flex-1">
                                        <div className="font-bold text-sm">
                                          {segment.departure?.airport || "N/A"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {segment.departure?.at &&
                                            format(
                                              new Date(segment.departure.at),
                                              "HH:mm"
                                            )}
                                        </div>
                                        {segment.departure?.terminal && (
                                          <div className="text-xs text-muted-foreground">
                                            T{segment.departure.terminal}
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex flex-col items-center px-4">
                                        <ArrowRight className="h-4 w-4 text-blue-600 mb-1" />
                                        <div className="text-xs text-center">
                                          <div className="flex items-center gap-1">
                                            <Timer className="h-2.5 w-2.5" />
                                            <span className="text-xs">
                                              {segment.duration
                                                ?.replace("PT", "")
                                                .replace("H", "h ")
                                                .replace("M", "m") || "N/A"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="text-center flex-1">
                                        <div className="font-bold text-sm">
                                          {segment.arrival?.airport || "N/A"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {segment.arrival?.at &&
                                            format(
                                              new Date(segment.arrival.at),
                                              "HH:mm"
                                            )}
                                        </div>
                                        {segment.arrival?.terminal && (
                                          <div className="text-xs text-muted-foreground">
                                            T{segment.arrival.terminal}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Mobile Additional Info */}
                                    {segment.aircraft?.code && (
                                      <div className="text-xs text-muted-foreground text-center">
                                        Aircraft: {segment.aircraft.code}
                                      </div>
                                    )}
                                  </div>

                                  {/* Desktop layout */}
                                  <div className="hidden lg:grid lg:grid-cols-5 gap-3 items-center">
                                    {/* Flight Info */}
                                    <div className="text-center">
                                      <div className="font-semibold text-sm">
                                        {segment.airline || "N/A"}
                                        {segment.aircraft || ""}
                                      </div>
                                      {/* <div className="text-xs text-muted-foreground">
                                        {segment.aircraft?.code || "N/A"}
                                      </div> */}
                                    </div>

                                    {/* Departure */}
                                    <div className="text-center">
                                      <div className="flex items-center justify-center gap-1 mb-1">
                                        <MapPin className="h-3 w-3 text-blue-600" />
                                        <span className="text-xs text-muted-foreground">
                                          From
                                        </span>
                                      </div>
                                      <div className="font-bold text-sm">
                                        {segment.departure?.airport || "N/A"}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {segment.departure?.at &&
                                          format(
                                            new Date(segment.departure.at),
                                            "MMM dd, HH:mm"
                                          )}
                                      </div>
                                      {segment.departure?.terminal && (
                                        <div className="text-xs text-muted-foreground">
                                          Terminal {segment.departure.terminal}
                                        </div>
                                      )}
                                    </div>

                                    {/* Duration & Path */}
                                    <div className="flex flex-col items-center">
                                      <div className="flex items-center w-full mb-1">
                                        <div className="h-px bg-blue-300 flex-1"></div>
                                        <ArrowRight className="mx-2 h-3 w-3 text-blue-600" />
                                        <div className="h-px bg-blue-300 flex-1"></div>
                                      </div>
                                      <div className="text-xs text-center">
                                        <div className="flex items-center gap-1 justify-center">
                                          <Timer className="h-3 w-3" />
                                          <span>
                                            {segment.duration
                                              ?.replace("PT", "")
                                              .replace("H", "h ")
                                              .replace("M", "m") || "N/A"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Arrival */}
                                    <div className="text-center">
                                      <div className="flex items-center justify-center gap-1 mb-1">
                                        <MapPin className="h-3 w-3 text-purple-600" />
                                        <span className="text-xs text-muted-foreground">
                                          To
                                        </span>
                                      </div>
                                      <div className="font-bold text-sm">
                                        {segment.arrival?.airport || "N/A"}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {segment.arrival?.at &&
                                          format(
                                            new Date(segment.arrival.at),
                                            "MMM dd, HH:mm"
                                          )}
                                      </div>
                                      {segment.arrival?.terminal && (
                                        <div className="text-xs text-muted-foreground">
                                          Terminal {segment.arrival.terminal}
                                        </div>
                                      )}
                                    </div>

                                    {/* Class & Cabin */}
                                    <div className="text-center">
                                      <div className="text-xs text-muted-foreground mb-1">
                                        Class
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {segment.cabin || "Economy"}
                                      </Badge>
                                      {segment.bookingClass && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                          Booking: {segment.bookingClass}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    /* Fallback to basic flight info */
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="text-center space-y-1">
                          <div className="flex items-center justify-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-muted-foreground">
                              Departure
                            </span>
                          </div>
                          <div className="font-bold text-lg">
                            {booking.departure?.airport}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.departure?.city}
                          </div>
                          <div className="text-xs font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                            {booking.departure?.time &&
                              format(
                                new Date(booking.departure.time),
                                "MMM dd, HH:mm"
                              )}
                          </div>
                        </div>

                        <div className="flex flex-col items-center space-y-2">
                          <div className="flex items-center w-full">
                            <div className="h-px bg-gradient-to-r from-blue-400 to-purple-400 flex-1"></div>
                            <Plane className="mx-3 h-5 w-5 text-blue-600 transform rotate-45" />
                            <div className="h-px bg-gradient-to-r from-purple-400 to-blue-400 flex-1"></div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                            {booking.flightNumber} • {booking.airline}
                          </div>
                        </div>

                        <div className="text-center space-y-1">
                          <div className="flex items-center justify-center gap-2">
                            <MapPin className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-muted-foreground">
                              Arrival
                            </span>
                          </div>
                          <div className="font-bold text-lg">
                            {booking.arrival?.airport}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.arrival?.city}
                          </div>
                          <div className="text-xs font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                            {booking.arrival?.time &&
                              format(
                                new Date(booking.arrival.time),
                                "MMM dd, HH:mm"
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Compact Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {/* Left Column: Booking & Customer Details */}
                <Card>
                  <CardHeader className="pb-1 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      Booking & Customer Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-3 space-y-2">
                    <div className="space-y-3">
                      {/* Booking Details Section */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground">
                          Booking Information
                        </h4>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Reference
                            </span>
                            <div className="flex items-center gap-1">
                              <code className="bg-muted px-1 py-0.5 rounded text-xs max-w-[120px] truncate">
                                {booking.bookingReference || "N/A"}
                              </code>
                              {booking.bookingReference && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    copyToClipboard(
                                      booking.bookingReference!,
                                      "Booking reference"
                                    )
                                  }
                                >
                                  <Copy className="h-2.5 w-2.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Created
                            </span>
                            <span className="text-xs">
                              {format(
                                new Date(booking.createdAt),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Updated
                            </span>
                            <span className="text-xs">
                              {format(
                                new Date(booking.updatedAt),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Details Section */}
                      <div className="space-y-2 border-t pt-2">
                        <h4 className="text-xs font-medium text-muted-foreground">
                          Customer Information
                        </h4>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Name
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium max-w-[120px] truncate">
                                {booking.customerName}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0"
                                onClick={() =>
                                  copyToClipboard(
                                    booking.customerName!,
                                    "Customer name"
                                  )
                                }
                              >
                                <Copy className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Email
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs max-w-[120px] truncate">
                                {booking.customerEmail}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0"
                                onClick={() =>
                                  copyToClipboard(
                                    booking.customerEmail!,
                                    "Customer email"
                                  )
                                }
                              >
                                <Copy className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              Travelers
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs h-4 px-2"
                            >
                              {booking.travelers}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Column: Payment & Ticket Status */}
                <Card>
                  <CardHeader className="pb-1 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                      <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                      Payment & Ticket Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-3">
                    <div className="text-center mb-3">
                      <div className="text-base sm:text-lg font-bold text-green-600">
                        {formatPrice(booking.price, booking.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Amount
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Ticket Status
                        </span>
                        <div className="flex items-center gap-1">
                          {booking.ticketSent ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-600">
                                Sent
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 text-orange-500" />
                              <span className="text-xs text-orange-500">
                                Pending
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {booking.ticketSentAt && (
                        <div className="text-xs text-muted-foreground text-center">
                          Sent on{" "}
                          {format(
                            new Date(booking.ticketSentAt),
                            "MMM dd, yyyy"
                          )}
                        </div>
                      )}

                      {refundableTaxes && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-muted-foreground">
                            Refundable Taxes
                          </span>
                          <div className="text-xs font-medium text-green-600">
                            {refundableTaxes.currency}{" "}
                            {refundableTaxes.amount.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Compact Technical Details */}
              <Card>
                <CardHeader className="pb-1 sm:pb-2">
                  <CardTitle className="text-xs sm:text-sm">
                    Technical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Booking ID:</span>
                      <div className="font-mono bg-muted px-2 py-1 rounded text-xs break-all">
                        {booking.id}
                      </div>
                    </div>
                    {booking.amadeusBookingId && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground">
                          Amadeus ID:
                        </span>
                        <div className="font-mono bg-muted px-2 py-1 rounded text-xs break-all">
                          {booking.amadeusBookingId}
                        </div>
                      </div>
                    )}
                    {booking.queuingOfficeId && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground">
                          Office ID:
                        </span>
                        <div className="font-mono bg-muted px-2 py-1 rounded text-xs break-all">
                          {booking.queuingOfficeId}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* PDF Download Button */}
          <div className="flex justify-center pt-3 sm:pt-4 border-t border-border">
            <Button
              onClick={handleDownloadPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm w-full sm:w-auto"
              size="sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Flight Order
            </DialogTitle>
            <div className="text-sm text-muted-foreground pt-2">
              Are you sure you want to permanently delete this flight order?
              <br />
              <br />
              <strong>This will:</strong>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Cancel the booking with Amadeus</li>
                <li>Remove it from the database</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBooking}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Yes, Delete Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
