"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Plane,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "client" | "agent" | "admin";
  isApproved: boolean;
  createdAt: string;
}

interface DashboardOverviewProps {
  users: User[];
  isLoading: boolean;
}

interface BookingStats {
  statusStats: Record<string, { count: number; revenue: number }>;
  monthlyBookings: Array<{
    _id: { year: number; month: number };
    count: number;
    revenue: number;
  }>;
  growth: {
    bookings: { thisMonth: number; lastMonth: number; rate: number };
    revenue: { thisMonth: number; lastMonth: number; rate: number };
  };
}

interface UserStats {
  userStats: Record<string, number>;
  monthlyRegistrations: Array<{
    _id: { year: number; month: number };
    count: number;
  }>;
  growth: {
    thisMonth: number;
    lastMonth: number;
    rate: number;
  };
}

const userRoleData = [
  { name: "Clients", value: 0, color: "#0088FE" },
  { name: "Agents", value: 0, color: "#00C49F" },
  { name: "Admins", value: 0, color: "#FFBB28" },
];

// Helper function to combine booking and user data for charts
function getChartData(bookingStats: BookingStats, userStats: UserStats) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const chartData = [];

  // Get last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const bookingData = bookingStats.monthlyBookings.find(
      (b) => b._id.year === year && b._id.month === month
    );
    const userData = userStats.monthlyRegistrations.find(
      (u) => u._id.year === year && u._id.month === month
    );

    chartData.push({
      name: months[month - 1],
      bookings: bookingData?.count || 0,
      users: userData?.count || 0,
      revenue: bookingData?.revenue || 0,
    });
  }

  return chartData;
}

export function DashboardOverview({
  users,
  isLoading,
}: DashboardOverviewProps) {
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookingRes, userRes] = await Promise.all([
          fetch("/api/admin/bookings/stats"),
          fetch("/api/admin/users/stats"),
        ]);

        if (bookingRes.ok) {
          const bookingData = await bookingRes.json();
          setBookingStats(bookingData);
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserStats(userData);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  const totalUsers = users.length;
  const totalClients = users.filter((u) => u.role === "client").length;
  const totalAgents = users.filter((u) => u.role === "agent").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const pendingApprovals = users.filter(
    (u) => u.role === "agent" && !u.isApproved
  ).length;

  // Update pie chart data with real values
  const updatedUserRoleData = [
    { name: "Clients", value: totalClients, color: "#0088FE" },
    { name: "Agents", value: totalAgents, color: "#00C49F" },
    { name: "Admins", value: totalAdmins, color: "#FFBB28" },
  ].filter((item) => item.value > 0);

  const recentRegistrations = users
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-md font-semibold tracking-tight text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground text-xs">
          Welcome to your admin dashboard. Here&apos;s what&apos;s happening
          today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {userStats?.growth.rate !== undefined
                ? `${userStats.growth.rate > 0 ? "+" : ""}${userStats.growth.rate.toFixed(1)}% from last month`
                : "Loading..."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookingStats
                ? Object.values(bookingStats.statusStats).reduce(
                    (sum, stat) => sum + stat.count,
                    0
                  )
                : "..."}
            </div>
            <p className="text-xs text-muted-foreground">
              {bookingStats?.growth.bookings.rate !== undefined
                ? `${bookingStats.growth.bookings.rate > 0 ? "+" : ""}${bookingStats.growth.bookings.rate.toFixed(1)}% from last month`
                : "Loading..."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {bookingStats
                ? Object.values(bookingStats.statusStats)
                    .reduce((sum, stat) => sum + stat.revenue, 0)
                    .toLocaleString()
                : "..."}
            </div>
            <p className="text-xs text-muted-foreground">
              {bookingStats?.growth.revenue.rate !== undefined
                ? `${bookingStats.growth.revenue.rate > 0 ? "+" : ""}${bookingStats.growth.revenue.rate.toFixed(1)}% from last month`
                : "Loading..."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Agents awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Overview Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>Bookings and revenue trends</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {bookingStats && userStats ? (
                <BarChart data={getChartData(bookingStats, userStats)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
                  <Bar dataKey="users" fill="#82ca9d" name="New Users" />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Loading chart data...
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown by user roles</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {updatedUserRoleData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={updatedUserRoleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {updatedUserRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No user data available
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
          <CardDescription>
            Latest users who joined the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRegistrations.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      user.role === "admin"
                        ? "default"
                        : user.role === "agent"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {user.role}
                  </Badge>
                  <Badge variant={user.isApproved ? "default" : "destructive"}>
                    {user.isApproved ? "Approved" : "Pending"}
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
