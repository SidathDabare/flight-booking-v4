"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
  EllipsisVertical,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
}

type SortField = "createdAt" | "customerName" | "status" | "price";
type SortOrder = "asc" | "desc";

interface BookingsTableProps {
  bookings: Booking[];
  currentPage: number;
  totalPages: number;
  totalBookings: number;
  pageSize: number;
  searchTerm: string;
  statusFilter: string;
  bookingRefFilter: string;
  sortField: SortField;
  sortOrder: SortOrder;
  onSearchTermChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onBookingRefFilterChange: (value: string) => void;
  onSortChange: (field: SortField) => void;
  onPageChange: (page: number) => void;
  onBookingSelect: (booking: Booking) => void;
}

export function BookingsTable({
  bookings,
  currentPage,
  totalPages,
  totalBookings,
  pageSize,
  searchTerm,
  statusFilter,
  bookingRefFilter,
  sortField,
  sortOrder,
  onSearchTermChange,
  onStatusFilterChange,
  onBookingRefFilterChange,
  onSortChange,
  onPageChange,
  onBookingSelect,
}: BookingsTableProps) {
  const handleSort = (field: SortField) => {
    onSortChange(field);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <SortAsc className="ml-1 h-4 w-4" />
    ) : (
      <SortDesc className="ml-1 h-4 w-4" />
    );
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Bookings</CardTitle>
        <CardDescription>
          View and manage all flight bookings from all users in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name, email, PNR, or office ID..."
              value={searchTerm}
              onChange={(e) => {
                onSearchTermChange(e.target.value);
                onPageChange(1);
              }}
              className="flex-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="relative">
              {/* <Input
                placeholder="PNR or Office ID"
                value={bookingRefFilter}
                onChange={(e) => {
                  onBookingRefFilterChange(e.target.value);
                  onPageChange(1);
                }}
                className="w-36 pr-8"
              /> */}
              {bookingRefFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                  onClick={() => {
                    onBookingRefFilterChange("");
                    onPageChange(1);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                onStatusFilterChange(value);
                onPageChange(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, totalBookings)} of {totalBookings}{" "}
          bookings
        </div>

        {/* Bookings Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Ref</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("customerName")}
                >
                  <div className="flex items-center">
                    Customer
                    {getSortIcon("customerName")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 text-center"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center text-center">
                    Status
                    {getSortIcon("status")}
                  </div>
                </TableHead>
                <TableHead>Ticket</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No bookings found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    className="hover:bg-muted/50 cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-mono text-sm text-foreground">
                          {booking.bookingReference ||
                            booking.queuingOfficeId ||
                            "N/A"}
                        </div>
                        {booking.bookingReference &&
                          booking.queuingOfficeId &&
                          booking.bookingReference !==
                            booking.queuingOfficeId && (
                            <div className="text-xs text-muted-foreground font-mono">
                              Office: {booking.queuingOfficeId}
                            </div>
                          )}
                        <div className="text-xs text-muted-foreground">
                          {booking.amadeusBookingId
                            ? `${booking.amadeusBookingId}`
                            : "No Booking ID"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {booking.customerName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.customerEmail}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="capitalize text-left">
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="capitalize text-left">
                      {booking.ticketSent ? (
                        <Badge variant="default" className="text-xs">
                          Sent
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookingSelect(booking);
                        }}
                      >
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({totalBookings} total
              bookings)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(1)}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(totalPages)}
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
