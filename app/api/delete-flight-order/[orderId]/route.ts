import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";
import amadeusToken from "@/lib/amadeusToken";

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    // Check authentication - require admin or agent role
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "admin" && session.user.role !== "agent")) {
      return NextResponse.json(
        { error: "Unauthorized: Admin or agent access required" },
        { status: 401, headers }
      );
    }

    // Connect to database
    await connectDB();

    // Get orderId from params
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400, headers }
      );
    }

    // Find the order in database first
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found in database" },
        { status: 404, headers }
      );
    }

    // Check if order is already cancelled
    if (order.status === "cancelled") {
      return NextResponse.json(
        {
          error: "Order is already cancelled",
          orderId: orderId,
          currentStatus: order.status
        },
        { status: 400, headers }
      );
    }

    // Get the Amadeus flight order ID from the stored order data
    const amadeusOrderId = order.data?.id;

    if (!amadeusOrderId) {
      return NextResponse.json(
        { error: "Amadeus order ID not found in order data" },
        { status: 400, headers }
      );
    }

    // Attempt to cancel the flight order with Amadeus API
    let amadeusDeleteResponse;
    try {
      amadeusDeleteResponse = await amadeusToken.booking.flightOrder(amadeusOrderId).delete();
    } catch (amadeusError: any) {
      console.error("Amadeus API delete error:", amadeusError);

      // Handle specific Amadeus errors
      if (amadeusError.response?.data?.errors) {
        const amadeusErrorDetail = amadeusError.response.data.errors[0];
        return NextResponse.json(
          {
            error: "Amadeus API Error",
            code: amadeusErrorDetail.code,
            title: amadeusErrorDetail.title,
            detail: amadeusErrorDetail.detail,
            orderId: orderId
          },
          { status: amadeusError.response.status || 500, headers }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to cancel flight order with Amadeus",
          details: amadeusError.message,
          orderId: orderId
        },
        { status: 500, headers }
      );
    }

    // Update order status in database to cancelled
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "cancelled",
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedOrder) {
      console.error("Failed to update order status in database");
      return NextResponse.json(
        {
          error: "Order cancelled with Amadeus but failed to update database",
          orderId: orderId,
          amadeusResponse: amadeusDeleteResponse.data
        },
        { status: 500, headers }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Flight order cancelled successfully",
        orderId: orderId,
        amadeusOrderId: amadeusOrderId,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt,
        amadeusResponse: amadeusDeleteResponse.data
      },
      { headers }
    );

  } catch (error: any) {
    console.error("[delete-flight-order] Unexpected error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message
      },
      { status: 500, headers }
    );
  }
}