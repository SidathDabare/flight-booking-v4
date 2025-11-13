import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "admin" && session.user.role !== "agent")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    // Total bookings by status
    const statusStats = await Order.aggregate([
      {
        $unwind: "$data.flightOffers",
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $convert: {
                input: { $ifNull: ["$data.flightOffers.price.grandTotal", "0"] },
                to: "double",
                onError: 0
              }
            },
          },
        },
      },
    ]);

    // Monthly booking trends
    const monthlyBookings = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: last6Months },
        },
      },
      {
        $unwind: "$data.flightOffers",
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $convert: {
                input: { $ifNull: ["$data.flightOffers.price.grandTotal", "0"] },
                to: "double",
                onError: 0
              }
            },
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Popular destinations
    const popularDestinations = await Order.aggregate([
      {
        $match: { status: "confirmed" },
      },
      {
        $unwind: "$data.flightOffers",
      },
      {
        $unwind: "$data.flightOffers.itineraries",
      },
      {
        $unwind: "$data.flightOffers.itineraries.segments",
      },
      {
        $group: {
          _id: "$data.flightOffers.itineraries.segments.arrival.iataCode",
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $convert: {
                input: {
                  $cond: {
                    if: { $isArray: "$data.flightOffers.price.grandTotal" },
                    then: { $arrayElemAt: ["$data.flightOffers.price.grandTotal", 0] },
                    else: { $ifNull: ["$data.flightOffers.price.grandTotal", "0"] }
                  }
                },
                to: "double",
                onError: 0
              }
            },
          },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Popular airlines
    const popularAirlines = await Order.aggregate([
      {
        $match: { status: "confirmed" },
      },
      {
        $unwind: "$data.flightOffers",
      },
      {
        $unwind: "$data.flightOffers.itineraries",
      },
      {
        $unwind: "$data.flightOffers.itineraries.segments",
      },
      {
        $group: {
          _id: "$data.flightOffers.itineraries.segments.carrierCode",
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $convert: {
                input: {
                  $cond: {
                    if: { $isArray: "$data.flightOffers.price.grandTotal" },
                    then: { $arrayElemAt: ["$data.flightOffers.price.grandTotal", 0] },
                    else: { $ifNull: ["$data.flightOffers.price.grandTotal", "0"] }
                  }
                },
                to: "double",
                onError: 0
              }
            },
          },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Recent bookings
    const recentBookings = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select({
        "metadata.customerName": 1,
        "metadata.customerEmail": 1,
        status: 1,
        createdAt: 1,
        "data.flightOffers.0.price.grandTotal": 1,
        "data.flightOffers.0.price.currency": 1,
        "data.associatedRecords.0.reference": 1,
      })
      .lean();

    // This month vs last month comparison
    const thisMonthStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonth },
        },
      },
      {
        $unwind: "$data.flightOffers",
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $convert: {
                input: { $ifNull: ["$data.flightOffers.price.grandTotal", "0"] },
                to: "double",
                onError: 0
              }
            },
          },
        },
      },
    ]);

    const lastMonthStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth, $lt: thisMonth },
        },
      },
      {
        $unwind: "$data.flightOffers",
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $convert: {
                input: { $ifNull: ["$data.flightOffers.price.grandTotal", "0"] },
                to: "double",
                onError: 0
              }
            },
          },
        },
      },
    ]);

    const thisMonthData = thisMonthStats[0] || { count: 0, revenue: 0 };
    const lastMonthData = lastMonthStats[0] || { count: 0, revenue: 0 };

    const bookingGrowth =
      lastMonthData.count > 0
        ? ((thisMonthData.count - lastMonthData.count) / lastMonthData.count) *
          100
        : 0;

    const revenueGrowth =
      lastMonthData.revenue > 0
        ? ((thisMonthData.revenue - lastMonthData.revenue) /
            lastMonthData.revenue) *
          100
        : 0;

    return NextResponse.json({
      statusStats: statusStats.reduce(
        (acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            revenue: stat.totalRevenue,
          };
          return acc;
        },
        {} as Record<string, { count: number; revenue: number }>
      ),

      monthlyBookings,
      popularDestinations,
      popularAirlines,
      recentBookings,

      growth: {
        bookings: {
          thisMonth: thisMonthData.count,
          lastMonth: lastMonthData.count,
          rate: bookingGrowth,
        },
        revenue: {
          thisMonth: thisMonthData.revenue,
          lastMonth: lastMonthData.revenue,
          rate: revenueGrowth,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch booking statistics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
