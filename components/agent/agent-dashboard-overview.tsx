"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Plane, Clock, CheckCircle, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

interface BookingStats {
  statusStats: Record<string, { count: number; revenue: number }>;
  growth: {
    bookings: { thisMonth: number; lastMonth: number; rate: number };
    revenue: { thisMonth: number; lastMonth: number; rate: number };
  };
}

interface AgentStats {
  activeBookings: number;
  pendingBookings: number;
  completedBookings: number;
  monthlyBookings: Array<{
    month: string;
    bookings: number;
    revenue: number;
  }>;
  bookingsByStatus: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: string;
  }>;
}

interface AgentDashboardOverviewProps {
  agentId: string;
}

export function AgentDashboardOverview({
  agentId,
}: AgentDashboardOverviewProps) {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch booking stats from the API
  const fetchBookingStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/bookings/stats");
      const data = await response.json();

      if (response.ok) {
        setBookingStats(data);

        // Calculate derived stats for display
        const totalBookings = Object.values(data.statusStats).reduce(
          (sum: number, stat: any) => sum + stat.count,
          0
        );
        const pendingCount = data.statusStats.pending?.count || 0;
        const confirmedCount = data.statusStats.confirmed?.count || 0;

        // Process monthly data from API
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const processedMonthlyData = data.monthlyBookings?.map((item: any) => ({
          month: monthNames[item._id.month - 1], // Convert month number to name
          bookings: item.count,
          revenue: item.revenue
        })) || [];

        const agentStats: AgentStats = {
          activeBookings: totalBookings,
          pendingBookings: pendingCount,
          completedBookings: confirmedCount,
          monthlyBookings: processedMonthlyData,
          bookingsByStatus: [
            { status: "Confirmed", count: confirmedCount, color: "#10B981" },
            { status: "Pending", count: pendingCount, color: "#F59E0B" },
            {
              status: "Cancelled",
              count: data.statusStats.cancelled?.count || 0,
              color: "#EF4444",
            },
          ],
          recentActivity: [
            {
              id: "1",
              type: "booking",
              description: "New booking created for John Doe - NYC to LAX",
              timestamp: "2 hours ago",
              status: "confirmed",
            },
            {
              id: "2",
              type: "booking",
              description: "Booking modified for Mike Johnson - Date changed",
              timestamp: "1 day ago",
              status: "updated",
            },
          ],
        };

        setStats(agentStats);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch booking statistics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching booking stats:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching stats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBookingStats();
  }, [fetchBookingStats]);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="p-6">Error loading dashboard data</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-md font-semibold tracking-tight">
            Agent Dashboard
          </h1>
          <div className="text-xs text-muted-foreground">
            Monitor and manage flight bookings efficiently
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Plane className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBookings}</div>
            <p className="text-xs text-muted-foreground">
              {bookingStats?.growth.bookings.rate !== undefined
                ? `${bookingStats.growth.bookings.rate > 0 ? "+" : ""}${bookingStats.growth.bookings.rate.toFixed(1)}% from last month`
                : "All system bookings"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedBookings}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Bookings and revenue trends</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyBookings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#3B82F6" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
            <CardDescription>Current booking distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.bookingsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) =>
                    `${status} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.bookingsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between p-3 border rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    {activity.type === "booking" ? (
                      <Plane className="h-4 w-4 text-primary" />
                    ) : (
                      <Users className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      activity.status === "confirmed" ||
                      activity.status === "active"
                        ? "default"
                        : activity.status === "updated"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
