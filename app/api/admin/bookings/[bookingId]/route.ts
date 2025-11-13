import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "admin" && session.user.role !== "agent")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { bookingId } = await params;

    const order = await Order.findById(bookingId).lean() as any;

    if (!order) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Format the complete booking details
    const formattedOrder = {
      id: order._id.toString(),
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      ticketSent: order.ticketSent || false,
      ticketSentAt: order.ticketSentAt,
      
      // Booking identifiers
      bookingReference: order.data?.associatedRecords?.[0]?.reference,
      amadeusBookingId: order.metadata?.amadeusBookingId,
      paymentIntent: order.stripe_payment_intent,
      
      // Customer info
      customer: {
        name: order.metadata?.customerName,
        email: order.metadata?.customerEmail,
        userId: order.metadata?.userId
      },
      
      // Flight offers
      flightOffers: order.data?.flightOffers?.map((offer: any) => ({
        id: offer.id,
        source: offer.source,
        lastTicketingDate: offer.lastTicketingDate,
        price: {
          currency: offer.price?.currency,
          total: offer.price?.total,
          base: offer.price?.base,
          grandTotal: offer.price?.grandTotal,
          fees: offer.price?.fees
        },
        itineraries: offer.itineraries?.map((itinerary: any) => ({
          segments: itinerary.segments?.map((segment: any) => ({
            departure: {
              airport: segment.departure?.iataCode,
              city: order.dictionaries?.locations?.[segment.departure?.iataCode]?.cityCode,
              country: order.dictionaries?.locations?.[segment.departure?.iataCode]?.countryCode,
              time: segment.departure?.at
            },
            arrival: {
              airport: segment.arrival?.iataCode,
              city: order.dictionaries?.locations?.[segment.arrival?.iataCode]?.cityCode,
              country: order.dictionaries?.locations?.[segment.arrival?.iataCode]?.countryCode,
              time: segment.arrival?.at
            },
            airline: segment.carrierCode,
            flightNumber: `${segment.carrierCode}${segment.number}`,
            aircraft: segment.aircraft?.code,
            duration: segment.duration,
            stops: segment.numberOfStops || 0
          }))
        })),
        travelerPricings: offer.travelerPricings
      })),
      
      // Travelers
      travelers: order.data?.travelers?.map((traveler: any) => ({
        id: traveler.id,
        name: {
          firstName: traveler.name?.firstName,
          lastName: traveler.name?.lastName
        },
        dateOfBirth: traveler.dateOfBirth,
        gender: traveler.gender,
        contact: traveler.contact,
        documents: traveler.documents
      })),
      
      // Contacts
      contacts: order.data?.contacts,
      
      // Location dictionary for reference
      locations: order.dictionaries?.locations
    };

    return NextResponse.json({
      success: true,
      booking: formattedOrder
    });

  } catch (error) {
    console.error("Error fetching booking details:", error);
    return NextResponse.json({
      error: "Failed to fetch booking details",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "admin" && session.user.role !== "agent")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { bookingId } = await params;
    const { status, adminNotes, ticketSent } = await req.json();

    const updateData: any = { updatedAt: new Date() };

    if (status) {
      const validStatuses = ["pending", "confirmed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    if (ticketSent !== undefined) {
      updateData.ticketSent = ticketSent;
      if (ticketSent && !updateData.ticketSentAt) {
        updateData.ticketSentAt = new Date();
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
      booking: {
        id: updatedOrder._id.toString(),
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt,
        ticketSent: updatedOrder.ticketSent,
        ticketSentAt: updatedOrder.ticketSentAt
      }
    });

  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({
      error: "Failed to update booking",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "admin" && session.user.role !== "agent")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { bookingId } = await params;

    const deletedOrder = await Order.findByIdAndDelete(bookingId);

    if (!deletedOrder) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({
      error: "Failed to delete booking",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}