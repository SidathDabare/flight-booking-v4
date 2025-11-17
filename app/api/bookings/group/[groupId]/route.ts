import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await params;

    await dbConnect();

    // Fetch all orders with this groupId
    const orders = await Order.find({ groupId })
      .sort({ createdAt: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: "No bookings found for this group" },
        { status: 404 }
      );
    }

    // Calculate total amount
    const totalAmount = orders.reduce((sum, order) => {
      return sum + (order.metadata?.totalAmount || 0);
    }, 0);

    // Format booking details
    const bookings = orders.map((order) => ({
      type: order.bookingType,
      confirmationNumber: order.metadata?.confirmationNumber || order._id,
      details: order.data,
      status: order.status,
      createdAt: order.createdAt,
    }));

    const response = {
      groupId,
      paymentIntentId: orders[0]?.metadata?.paymentIntentId || "",
      totalAmount: Math.round(totalAmount * 100), // Convert to cents
      currency: orders[0]?.metadata?.currency || "USD",
      bookings,
      createdAt: orders[0]?.createdAt || new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching booking group:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking details" },
      { status: 500 }
    );
  }
}
