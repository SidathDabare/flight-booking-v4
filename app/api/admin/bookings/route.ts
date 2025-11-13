import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "agent")
    ) {
      //console.log("❌ Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const bookingReference = searchParams.get("bookingReference");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "dsc" ? 1 : -1;

    // Build filter query
    const filter: any = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    if (search) {
      filter.$or = [
        { "metadata.customerName": { $regex: search, $options: "i" } },
        { "metadata.customerEmail": { $regex: search, $options: "i" } },
        {
          "data.associatedRecords.0.reference": {
            $regex: search,
            $options: "i",
          },
        },
        { "data.queuingOfficeId": { $regex: search, $options: "i" } },
        { "metadata.amadeusBookingId": { $regex: search, $options: "i" } },
      ];
    }

    if (bookingReference) {
      filter.$or = [
        ...(filter.$or || []),
        {
          "data.associatedRecords.0.reference": {
            $regex: bookingReference,
            $options: "i",
          },
        },
        { "data.queuingOfficeId": { $regex: bookingReference, $options: "i" } },
      ];
    }

    if (bookingReference) {
      //console.log("🎫 Filtering by booking reference:", bookingReference);
    }

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);
    //console.log("📊 Total orders found:", totalOrders);

    // Get paginated orders
    const skip = (page - 1) * limit;
    const orders = await Order.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    //console.log("📋 Orders retrieved:", orders.length);

    // Format orders for admin display
    const formattedOrders = orders.map((order: any) => {
      try {
        const flightOffer = order.data?.flightOffers?.[0];
        const firstItinerary = flightOffer?.itineraries?.[0];
        const firstSegment = firstItinerary?.segments?.[0];
        const lastSegment =
          firstItinerary?.segments?.[firstItinerary?.segments?.length - 1];

        return {
          id: order._id.toString(),
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          ticketSent: order.ticketSent || false,
          ticketSentAt: order.ticketSentAt,
          bookingReference: order.data?.associatedRecords?.[0]?.reference,
          amadeusBookingId: order.metadata?.amadeusBookingId,
          queuingOfficeId: order.data?.queuingOfficeId,
          customerName: order.metadata?.customerName,
          customerEmail: order.metadata?.customerEmail,
          userId: order.metadata?.userId,

          // Flight details
          departure: firstSegment
            ? {
                airport: firstSegment.departure.iataCode,
                city: order.dictionaries?.locations?.[
                  firstSegment.departure.iataCode
                ]?.cityCode,
                country:
                  order.dictionaries?.locations?.[
                    firstSegment.departure.iataCode
                  ]?.countryCode,
                time: firstSegment.departure.at,
              }
            : null,

          arrival: lastSegment
            ? {
                airport: lastSegment.arrival.iataCode,
                city: order.dictionaries?.locations?.[
                  lastSegment.arrival.iataCode
                ]?.cityCode,
                country:
                  order.dictionaries?.locations?.[lastSegment.arrival.iataCode]
                    ?.countryCode,
                time: lastSegment.arrival.at,
              }
            : null,

          airline: firstSegment?.carrierCode,
          flightNumber: firstSegment
            ? `${firstSegment.carrierCode}${firstSegment.number}`
            : null,
          price: flightOffer?.price?.grandTotal,
          currency: flightOffer?.price?.currency,
          travelers: order.data?.travelers?.length || 0,
          isReturn: flightOffer?.itineraries?.length > 1,

          // Full flight offers data for detailed display
          flightOffers: order.data?.flightOffers || [],

          // Payment info
          paymentIntent: order.stripe_payment_intent,
          bookingDate: order.metadata?.bookingDate,
        };
      } catch (error) {
        //console.error(`❌ Error formatting order ${order._id}:`, error);
        //console.error(
        //  "📄 Order data structure:",
        //  JSON.stringify(order, null, 2)
        //);
        // Return minimal order data if formatting fails
        return {
          id: order._id.toString(),

          status: order.status || "pending",
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          ticketSent: order.ticketSent || false,
          ticketSentAt: order.ticketSentAt,
          customerName: order.metadata?.customerName || "Unknown",
          customerEmail: order.metadata?.customerEmail || "Unknown",
          userId: order.metadata?.userId,
          bookingReference:
            order.data?.associatedRecords?.[0]?.reference || "N/A",
          amadeusBookingId: order.metadata?.amadeusBookingId,
          queuingOfficeId: order.data?.queuingOfficeId,
          departure: null,
          arrival: null,
          airline: null,
          flightNumber: null,
          price: null,
          currency: null,
          travelers: 0,
          isReturn: false,
          paymentIntent: order.stripe_payment_intent,
          bookingDate: order.metadata?.bookingDate,
        };
      }
    });

    //console.log("✅ Successfully formatted orders:", formattedOrders.length);
    const response = {
      success: true,
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit),
      },
    };

    //console.log("📤 Sending response with pagination:", response.pagination);
    return NextResponse.json(response);
  } catch (error) {
    //console.log("💥 CRITICAL ERROR fetching admin orders:", error);
    //console.log(
    //  "🔍 Error stack:",
    //  error instanceof Error ? error.stack : "No stack trace available"
    //);
    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "agent")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { orderId, status, notes } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "confirmed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        ...(notes && { adminNotes: notes }),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    //console.error("Error updating order:", error);
    return NextResponse.json(
      {
        error: "Failed to update order",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
