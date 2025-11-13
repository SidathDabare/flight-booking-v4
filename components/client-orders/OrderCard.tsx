"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plane,
  Calendar,
  MapPin,
  Users,
  Clock,
  Mail,
  Download,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface OrderCardProps {
  order: {
    id: string;
    status: string;
    createdAt: string;
    ticketSent: boolean;
    ticketSentAt?: string;
    bookingReference?: string;
    customerName?: string;
    departure: {
      airport: string;
      city?: string;
      country?: string;
      time: string;
    } | null;
    arrival: {
      airport: string;
      city?: string;
      country?: string;
      time: string;
    } | null;
    airline?: string;
    flightNumber?: string;
    price?: string;
    currency?: string;
    travelers: number;
    isReturn: boolean;
  };
  onResendTicket?: (orderId: string) => void;
}

export function OrderCard({ order, onResendTicket }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30";
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30";
      case "cancelled":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30";
      default:
        return "bg-secondary text-secondary-foreground border-border";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  return (
    <Card className="w-full shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary overflow-hidden group">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">
                {order.flightNumber || "Flight Booking"}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Booked{" "}
                {formatDistanceToNow(new Date(order.createdAt), {
                  addSuffix: true,
                })}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              className={`${getStatusColor(order.status)} border font-medium`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            {order.ticketSent && (
              <Badge
                variant="outline"
                className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30"
              >
                <Mail className="h-3 w-3 mr-1" />
                Ticket Sent
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-5">
        {/* Flight Route */}
        {order.departure && order.arrival && (
          <div className="relative p-4 sm:p-5 bg-gradient-to-br from-secondary/30 via-secondary/20 to-transparent rounded-xl border border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Departure */}
              <div className="text-center sm:text-left flex-1">
                <div className="font-bold text-xl sm:text-2xl text-foreground">
                  {order.departure.airport}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {order.departure.city && `${order.departure.city}, `}
                  {order.departure.country}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {formatDateTime(order.departure.time).date}
                  </div>
                  <div className="font-mono text-sm sm:text-base font-semibold text-primary">
                    {formatDateTime(order.departure.time).time}
                  </div>
                </div>
              </div>

              {/* Flight Direction */}
              <div className="flex sm:flex-col items-center justify-center px-4 sm:px-6">
                <div className="hidden sm:flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center mb-2">
                  <Plane className="h-6 w-6 text-primary rotate-45" />
                </div>
                <Plane className="sm:hidden h-5 w-5 text-primary rotate-90 mx-3" />
                <div className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {order.isReturn ? "Round Trip" : "One-way"}
                </div>
              </div>

              {/* Arrival */}
              <div className="text-center sm:text-right flex-1">
                <div className="font-bold text-xl sm:text-2xl text-foreground">
                  {order.arrival.airport}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {order.arrival.city && `${order.arrival.city}, `}
                  {order.arrival.country}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {formatDateTime(order.arrival.time).date}
                  </div>
                  <div className="font-mono text-sm sm:text-base font-semibold text-primary">
                    {formatDateTime(order.arrival.time).time}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {order.bookingReference && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Reference</div>
                <div className="font-semibold text-sm truncate">
                  {order.bookingReference}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
            <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs text-muted-foreground">Travelers</div>
              <div className="font-semibold text-sm">{order.travelers}</div>
            </div>
          </div>

          {order.price && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className="w-full">
                <div className="text-xs text-muted-foreground">Total Price</div>
                <div className="font-bold text-sm text-primary">
                  {order.price} {order.currency}
                </div>
              </div>
            </div>
          )}

          {order.ticketSent && order.ticketSentAt && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Ticket Sent</div>
                <div className="font-semibold text-xs truncate">
                  {formatDistanceToNow(new Date(order.ticketSentAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
          {/* <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full sm:w-auto hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Link href={`/ticket-details?orderId=${order.id}`}>
              <MapPin className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button> */}

          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full sm:w-auto hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Link href={`/api/pdf-download/${order.id}`} target="_blank">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Link>
          </Button>

          {order.status === "confirmed" && onResendTicket && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResendTicket(order.id)}
              className="w-full sm:w-auto hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Mail className="h-4 w-4 mr-2" />
              Resend Ticket
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
