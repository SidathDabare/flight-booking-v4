"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Plane,
  Users,
  Calendar,
  RefreshCw,
  CircleDollarSign,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { deleteFlightOrder } from "@/lib/actions/delete-flight-order";
import { BookingDetailsModal } from "./booking-details-modal";
import { BookingsTable } from "./bookings-table";

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
  }>;
}

interface BookingStats {
  statusStats: Record<string, { count: number; revenue: number }>;
  growth: {
    bookings: { thisMonth: number; lastMonth: number; rate: number };
    revenue: { thisMonth: number; lastMonth: number; rate: number };
  };
}

type SortField = "createdAt" | "customerName" | "status" | "price";
type SortOrder = "asc" | "desc";

export function BookingManagement() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bookingRefFilter, setBookingRefFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const pageSize = 8;

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy: sortField,
        sortOrder: sortOrder,
      });

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (bookingRefFilter) {
        params.append("bookingReference", bookingRefFilter);
      }

      const response = await fetch(`/api/admin/bookings?${params}`);
      const data = await response.json();

      if (response.ok) {
        setBookings(data.orders);
        setTotalPages(data.pagination.pages);
        setTotalBookings(data.pagination.total);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch bookings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    sortField,
    sortOrder,
    statusFilter,
    searchTerm,
    bookingRefFilter,
    toast,
  ]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/bookings/stats");
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching booking stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: bookingId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Booking ${newStatus} successfully`,
        });
        fetchBookings();
        fetchStats();
        // Update the selected booking if it's currently displayed
        if (selectedBooking && selectedBooking.id === bookingId) {
          setSelectedBooking({ ...selectedBooking, status: newStatus as any });
        }
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to update booking",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating booking",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      setIsDeleting(true);
      const result = await deleteFlightOrder(bookingId);

      if (result.success) {
        toast({
          title: "Success",
          description: "Flight order deleted successfully",
        });
        fetchBookings();
        fetchStats();
        setShowBookingModal(false);
        setSelectedBooking(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete flight order",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting booking",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleBookingSelect = async (booking: Booking) => {
    try {
      // Fetch complete booking data with flightOffers
      const response = await fetch(`/api/admin/bookings/${booking.id}`);
      const data = await response.json();

      if (response.ok && data.success) {
        // Merge the complete booking data with the existing summary data
        const completeBooking = {
          ...booking,
          flightOffers: data.booking.flightOffers
        };
        setSelectedBooking(completeBooking);
        setShowBookingModal(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to load booking details",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while loading booking details",
        variant: "destructive",
      });
    }
  };


  if (loading && bookings.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-md font-semibold tracking-tight text-foreground">
            Booking Management
          </h1>
          <p className="text-muted-foreground text-xs">
            Manage all flight bookings and reservations from all users in the
            system
          </p>
        </div>
        <Button
          onClick={() => {
            fetchBookings();
            fetchStats();
          }}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Plane className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(stats.statusStats).reduce(
                  (sum, stat) => sum + stat.count,
                  0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.growth.bookings.rate > 0 ? "+" : ""}
                {stats.growth.bookings.rate.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.statusStats.confirmed?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue: $
                {(stats.statusStats.confirmed?.revenue || 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.statusStats.pending?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Potential: $
                {(stats.statusStats.pending?.revenue || 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {session?.user?.role !== "agent" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <CircleDollarSign className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {Object.values(stats.statusStats)
                    .reduce((sum, stat) => sum + stat.revenue, 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.growth.revenue.rate > 0 ? "+" : ""}
                  {stats.growth.revenue.rate.toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Bookings Table */}
      <BookingsTable
        bookings={bookings}
        currentPage={currentPage}
        totalPages={totalPages}
        totalBookings={totalBookings}
        pageSize={pageSize}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        bookingRefFilter={bookingRefFilter}
        sortField={sortField}
        sortOrder={sortOrder}
        onSearchTermChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onBookingRefFilterChange={setBookingRefFilter}
        onSortChange={handleSort}
        onPageChange={setCurrentPage}
        onBookingSelect={handleBookingSelect}
      />

      {/* Enhanced Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onUpdateStatus={updateBookingStatus}
        onDeleteBooking={handleDeleteBooking}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />
    </div>
  );
}
