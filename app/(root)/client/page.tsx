"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Calendar, CreditCard, User, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ClientDashboard() {
  const { data: session } = useSession();
  const [bookingCount, setBookingCount] = useState<number | null>(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  const fetchBookingCount = useCallback(async () => {
    try {
      const response = await fetch("/api/orders/user");
      if (response.ok) {
        const data = await response.json();
        setBookingCount(data.totalOrders || 0);
      }
    } catch (error) {
      console.error("Error fetching booking count:", error);
      setBookingCount(0);
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchBookingCount();
    }
  }, [session, fetchBookingCount]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {session?.user?.name}!
          </h1>
          <div className="text-muted-foreground mt-2">
            Manage your flight bookings and travel plans
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Search Flights
              </CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Find Your Next Trip</div>
              <p className="text-xs text-muted-foreground">
                Search and compare flights from various airlines
              </p>
              <Button asChild className="w-full mt-4">
                <Link href="/">Search Flights</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingBookings ? (
                  <Loader2 className="h-6 w-6 animate-spin inline" />
                ) : (
                  (bookingCount ?? 0)
                )}
              </div>
              <p className="text-xs text-muted-foreground">Total bookings</p>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/client/orders">View Bookings</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Profile Settings</div>
              <p className="text-xs text-muted-foreground">
                Update your personal information
              </p>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/client/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks you might want to perform
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild variant="outline" className="h-auto flex-col p-6">
                <Link href="/flights">
                  <Plane className="h-8 w-8 mb-2" />
                  Search Flights
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col p-6" asChild>
                <Link href="/client/orders">
                  <Calendar className="h-8 w-8 mb-2" />
                  View Bookings
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col p-6">
                <CreditCard className="h-8 w-8 mb-2" />
                Payment History
              </Button>
              <Button variant="outline" className="h-auto flex-col p-6" asChild>
                <Link href="/client/profile">
                  <User className="h-8 w-8 mb-2" />
                  Account Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
