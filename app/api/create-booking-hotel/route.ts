import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { hotelBookingSchema } from "@/lib/zod/hotel-search";
import { z } from "zod";
import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";
import amadeusToken from "@/lib/amadeusToken";

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await req.json();
    const validatedData = hotelBookingSchema.parse(body);

    console.log("Creating hotel booking:", validatedData);

    // 3. Verify hotel availability (call Amadeus Hotel Booking API)
    // Note: In production, you would call Amadeus API to verify availability
    // For now, we'll proceed with the booking

    try {
      // Amadeus Hotel Booking API call (when integrated)
      // const hotelOffer = await amadeusToken.shopping.hotelOfferSearch.get({
      //   offerId: body.offerId // You'll need to pass the hotel offer ID
      // });

      // For now, assuming availability is confirmed
      const confirmationNumber = `HTL${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;

      // 4. Connect to database
      await connectDB();

      // 5. Create order in database
      const orderData = {
        bookingType: "hotel-booking",
        data: {
          type: "hotel-booking",
          id: validatedData.hotelId,
          queuingOfficeId: "N/A", // Not applicable for hotels
          // Store the complete booking data
          hotel: body.hotel || {}, // Hotel details from frontend
          room: body.room || {}, // Room details
          stay: {
            checkInDate: validatedData.checkInDate,
            checkOutDate: validatedData.checkOutDate,
            numberOfNights: validatedData.numberOfNights,
            numberOfGuests: validatedData.numberOfGuests,
            numberOfRooms: validatedData.numberOfRooms,
          },
          guests: validatedData.guests,
          specialRequests: validatedData.specialRequests || "",
          pricing: body.pricing || {}, // Pricing details from frontend
        },
        dictionaries: {},
        metadata: {
          userId: session.user.id,
          customerEmail: session.user.email,
          customerName: session.user.name,
          bookingDate: new Date().toISOString(),
          confirmationNumber: confirmationNumber,
          totalAmount: body.pricing?.totalPrice || 0,
          currency: body.pricing?.currency || "USD",
        },
        status: "pending",
        ticketSent: false,
      };

      const order = await Order.create(orderData);

      console.log("Hotel booking created successfully:", order._id);

      // 6. Return response with confirmation
      return NextResponse.json(
        {
          success: true,
          orderId: order._id.toString(),
          confirmationNumber: confirmationNumber,
          booking: {
            hotelId: validatedData.hotelId,
            checkInDate: validatedData.checkInDate,
            checkOutDate: validatedData.checkOutDate,
            guests: validatedData.guests,
            totalPrice: body.pricing?.totalPrice || 0,
            currency: body.pricing?.currency || "USD",
          },
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to create booking in database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Hotel booking error:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid booking data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle Amadeus API errors
    if (error && typeof error === "object" && "description" in error) {
      const amadeusError = error as any;
      return NextResponse.json(
        {
          error: "Hotel booking failed",
          details: amadeusError.description || amadeusError.message,
        },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "An error occurred while creating the hotel booking" },
      { status: 500 }
    );
  }
}

// GET endpoint for testing (remove in production)
export async function GET() {
  return NextResponse.json(
    {
      message: "Hotel Booking API - Use POST method with booking data",
      example: {
        hotelId: "HOTEL123",
        roomId: "ROOM456",
        checkInDate: "2025-12-01",
        checkOutDate: "2025-12-05",
        numberOfNights: 4,
        numberOfGuests: 2,
        numberOfRooms: 1,
        guests: [
          {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            isMainGuest: true,
          },
        ],
        hotel: {
          name: "Grand Plaza Hotel",
          address: "123 Main St",
          city: "New York",
        },
        room: {
          name: "Deluxe King Room",
          bedType: "King",
        },
        pricing: {
          currency: "USD",
          nightlyRate: 150,
          totalPrice: 600,
        },
      },
    },
    { status: 200 }
  );
}
