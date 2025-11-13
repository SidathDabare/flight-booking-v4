import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find orders for the logged-in user
    const orders = await Order.find({
      "metadata.userId": session.user.id,
    }).sort({ createdAt: -1 });

    // Format orders for client display
    const formattedOrders = orders.map(order => {
      const flightOffer = order.data?.flightOffers?.[0];
      const firstItinerary = flightOffer?.itineraries?.[0];
      const firstSegment = firstItinerary?.segments?.[0];
      const lastSegment = firstItinerary?.segments?.[firstItinerary.segments.length - 1];
      
      return {
        id: order._id.toString(),
        status: order.status,
        createdAt: order.createdAt,
        ticketSent: order.ticketSent || false,
        ticketSentAt: order.ticketSentAt,
        bookingReference: order.data?.associatedRecords?.[0]?.reference,
        amadeusBookingId: order.metadata?.amadeusBookingId,
        customerName: order.metadata?.customerName,
        customerEmail: order.metadata?.customerEmail,
        // Flight details
        departure: firstSegment ? {
          airport: firstSegment.departure.iataCode,
          city: order.dictionaries?.locations?.[firstSegment.departure.iataCode]?.cityCode,
          country: order.dictionaries?.locations?.[firstSegment.departure.iataCode]?.countryCode,
          time: firstSegment.departure.at,
        } : null,
        arrival: lastSegment ? {
          airport: lastSegment.arrival.iataCode,
          city: order.dictionaries?.locations?.[lastSegment.arrival.iataCode]?.cityCode,
          country: order.dictionaries?.locations?.[lastSegment.arrival.iataCode]?.countryCode,
          time: lastSegment.arrival.at,
        } : null,
        airline: firstSegment?.carrierCode,
        flightNumber: firstSegment ? `${firstSegment.carrierCode}${firstSegment.number}` : null,
        price: flightOffer?.price?.grandTotal,
        currency: flightOffer?.price?.currency,
        travelers: order.data?.travelers?.length || 0,
        // Determine if it's return or one-way
        isReturn: flightOffer?.itineraries?.length > 1,
      };
    });

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      totalOrders: formattedOrders.length,
    });

  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json({
      error: "Failed to fetch orders",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}