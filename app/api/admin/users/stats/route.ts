import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    // Total users by role
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly registration trends
    const monthlyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last6Months }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Recent activity
    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Approval stats
    const approvalStats = await User.aggregate([
      {
        $match: { role: "agent" }
      },
      {
        $group: {
          _id: "$isApproved",
          count: { $sum: 1 }
        }
      }
    ]);

    // This month vs last month growth
    const thisMonthUsers = await User.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth }
    });

    const growthRate = lastMonthUsers > 0 
      ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 
      : 0;

    return NextResponse.json({
      userStats: userStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>),
      monthlyRegistrations,
      recentUsers,
      approvalStats: {
        approved: approvalStats.find(s => s._id === true)?.count || 0,
        pending: approvalStats.find(s => s._id === false)?.count || 0
      },
      growth: {
        thisMonth: thisMonthUsers,
        lastMonth: lastMonthUsers,
        rate: growthRate
      }
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}