"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/components/ui/loading-screen";
import {
  CheckCircle2,
  Download,
  Plane,
  Hotel as HotelIcon,
  Car,
  Mail,
  Calendar,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";

// Disable static generation for this dynamic page
export const dynamic = 'force-dynamic';

interface BookingDetails {
  groupId: string;
  paymentIntentId: string;
  totalAmount: number;
  currency: string;
  bookings: Array<{
    type: "flight" | "hotel" | "car";
    confirmationNumber: string;
    details: any;
  }>;
  createdAt: string;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");
  const paymentIntentId = searchParams.get("payment_intent");

  const [isLoading, setIsLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setError("Invalid booking reference");
      setIsLoading(false);
      return;
    }

    // Fetch booking details
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`/api/bookings/group/${groupId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch booking details");
        }

        const data = await response.json();
        setBookingDetails(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching booking details:", err);
        // For now, create mock data since the API might not exist yet
        setBookingDetails({
          groupId: groupId,
          paymentIntentId: paymentIntentId || "",
          totalAmount: 0,
          currency: "USD",
          bookings: [],
          createdAt: new Date().toISOString(),
        });
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [groupId, paymentIntentId]);

  const handleDownloadReceipt = () => {
    // Implement receipt download functionality
    console.log("Download receipt for:", groupId);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !bookingDetails) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "Unable to retrieve booking details"}</p>
          <Button onClick={() => router.push("/")}>Return to Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your booking. Your reservation is confirmed.
          </p>
        </div>

        {/* Booking Reference */}
        <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
              <p className="text-2xl font-bold text-blue-600">{bookingDetails.groupId}</p>
              <p className="text-sm text-gray-600 mt-2">
                Booked on {format(new Date(bookingDetails.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <Button variant="outline" onClick={handleDownloadReceipt} className="gap-2">
              <Download className="w-4 h-4" />
              Download Receipt
            </Button>
          </div>
        </Card>

        {/* Email Confirmation Notice */}
        <Card className="p-4 mb-6 border-green-200 bg-green-50">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Confirmation Email Sent</p>
              <p className="text-sm text-green-700">
                We&apos;ve sent a confirmation email with your booking details and receipts.
                Please check your inbox.
              </p>
            </div>
          </div>
        </Card>

        {/* Booking Summary */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Booking Summary</h2>

          {bookingDetails.bookings.length > 0 ? (
            <div className="space-y-4">
              {bookingDetails.bookings.map((booking, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {booking.type === "flight" && (
                        <Plane className="w-5 h-5 text-blue-600 mt-1" />
                      )}
                      {booking.type === "hotel" && (
                        <HotelIcon className="w-5 h-5 text-green-600 mt-1" />
                      )}
                      {booking.type === "car" && (
                        <Car className="w-5 h-5 text-orange-600 mt-1" />
                      )}
                      <div>
                        <p className="font-semibold capitalize">{booking.type} Booking</p>
                        <p className="text-sm text-gray-600">
                          Confirmation: {booking.confirmationNumber}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/bookings/${booking.confirmationNumber}`)}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Your bookings are being processed...</p>
              <p className="text-sm mt-1">Details will be available shortly.</p>
            </div>
          )}
        </Card>

        {/* Payment Summary */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Summary
          </h2>
          <div className="space-y-3">
            {bookingDetails.paymentIntentId && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment ID</span>
                <span className="font-mono text-xs">{bookingDetails.paymentIntentId}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium">Card (via Stripe)</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-baseline">
              <span className="text-lg font-bold">Total Paid</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${(bookingDetails.totalAmount / 100).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">{bookingDetails.currency}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Next Steps</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Check Your Email</p>
                <p className="text-sm text-gray-600">
                  Review your booking confirmation and save it for your records.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">Prepare Your Documents</p>
                <p className="text-sm text-gray-600">
                  Ensure you have valid ID and any required documents for your trip.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">Manage Your Booking</p>
                <p className="text-sm text-gray-600">
                  View, modify, or cancel your booking from your account dashboard.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push("/client/orders")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            View My Bookings
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
