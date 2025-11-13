"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

import { OrderCard } from "@/components/client-orders/OrderCard";
import { OrderCardSkeleton } from "@/components/client-orders/OrderCardSkeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  RefreshCw,
  Plane,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
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
}

export default function ClientOrders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/orders/user");

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        throw new Error(data.error || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch orders"
      );
      toast({
        title: "Error",
        description: "Failed to load your bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
  };

  const handleResendTicket = async (orderId: string) => {
    try {
      toast({
        title: "Sending ticket...",
        description: "Please wait while we resend your ticket",
      });

      const response = await fetch("/api/send-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Ticket sent!",
          description: "Your ticket has been sent to your email",
        });
        // Refresh orders to update ticket status
        await fetchOrders();
      } else {
        throw new Error(data.details || "Failed to send ticket");
      }
    } catch (error) {
      console.error("Error resending ticket:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send ticket",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user.role !== "client") {
      router.push("/unauthorized");
      return;
    }

    fetchOrders();
  }, [session, status, router, fetchOrders]);

  // Filter and sort orders
  const filteredAndSortedOrders = orders
    .filter((order) => statusFilter === "all" || order.status === statusFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "price-high":
          return parseFloat(b.price || "0") - parseFloat(a.price || "0");
        case "price-low":
          return parseFloat(a.price || "0") - parseFloat(b.price || "0");
        default:
          return 0;
      }
    });

  // Calculate statistics
  const stats = {
    total: orders.length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    pending: orders.filter((o) => o.status === "pending").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          {/* Header Skeleton */}
          <div className="mb-8 lg:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="space-y-2">
                <div className="h-10 w-48 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg animate-pulse" />
                <div className="h-5 w-64 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-10 w-full sm:w-32 bg-muted rounded animate-pulse" />
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card
                  key={i}
                  className="border-l-4 border-l-primary/30 shadow-sm"
                >
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-muted animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Skeleton Cards */}
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-10 w-full bg-muted rounded animate-pulse" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-10 w-full bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:gap-6">
              {[1, 2, 3].map((i) => (
                <OrderCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "client") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Header Section */}
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                My Bookings
              </h1>
              <p className="text-muted-foreground text-sm lg:text-base">
                View and manage your flight bookings
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full sm:w-auto shadow-sm hover:shadow-md transition-all"
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          {/* Statistics Cards */}
          {orders.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                        Total Bookings
                      </p>
                      <p className="text-2xl lg:text-3xl font-bold mt-1">
                        {stats.total}
                      </p>
                    </div>
                    <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plane className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                        Confirmed
                      </p>
                      <p className="text-2xl lg:text-3xl font-bold mt-1 text-green-600">
                        {stats.confirmed}
                      </p>
                    </div>
                    <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                        Pending
                      </p>
                      <p className="text-2xl lg:text-3xl font-bold mt-1 text-yellow-600">
                        {stats.pending}
                      </p>
                    </div>
                    <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                        Cancelled
                      </p>
                      <p className="text-2xl lg:text-3xl font-bold mt-1 text-red-600">
                        {stats.cancelled}
                      </p>
                    </div>
                    <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {orders.length === 0 ? (
          <Card className="border-2 border-dashed shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16 lg:py-24">
              <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Plane className="h-10 w-10 lg:h-12 lg:w-12 text-primary" />
              </div>
              <CardTitle className="mb-3 text-xl lg:text-2xl">
                No bookings yet
              </CardTitle>
              <CardDescription className="text-center max-w-sm mb-6 text-sm lg:text-base">
                You haven&apos;t made any flight bookings yet. Start your
                journey by searching for flights!
              </CardDescription>
              <Button
                asChild
                className="shadow-md hover:shadow-lg transition-all"
              >
                <Link href="/">
                  <Plane className="h-4 w-4 mr-2" />
                  Search Flights
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Filters and Sort */}
            <Card className="shadow-sm">
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filter by Status
                    </label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All bookings" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Bookings</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">
                      Sort By
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="price-high">
                          Price: High to Low
                        </SelectItem>
                        <SelectItem value="price-low">
                          Price: Low to High
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {statusFilter !== "all" && (
                  <div className="mt-4 flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredAndSortedOrders.length} of{" "}
                      {orders.length} bookings
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStatusFilter("all")}
                      className="h-7 text-xs"
                    >
                      Clear filter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Orders List */}
            {filteredAndSortedOrders.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Plane className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground text-center">
                    No bookings found with the selected filter
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                    className="mt-4"
                  >
                    Clear filter
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:gap-6">
                {filteredAndSortedOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onResendTicket={handleResendTicket}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
