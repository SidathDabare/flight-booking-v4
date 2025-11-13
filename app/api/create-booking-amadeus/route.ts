import amadeusToken from "@/lib/amadeusToken";
import Order from "@/lib/db/models/Order";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  try {
    const { data } = await req.json();

    if (!data || !data.flightOffers || !data.travelers) {
      return NextResponse.json(
        { error: "Missing required booking information" },
        { status: 400, headers }
      );
    }

    // If this is just an availability check, skip database connection
    const isAvailabilityCheck = data.checkAvailabilityOnly;

    // Connect to database (skip for availability checks)
    if (!isAvailabilityCheck) {
      try {
        await connectDB();
      } catch (dbError) {
        console.error(
          "[create-booking-amadeus] Database connection error:",
          dbError
        );
        return NextResponse.json(
          {
            error: "Database connection failed",
            details: (dbError as Error).message,
          },
          { status: 500, headers }
        );
      }
    }

    // Verify flight availability
    const flightVerification =
      await amadeusToken.shopping.flightOffers.pricing.post({
        data: {
          type: "flight-offers-pricing",
          flightOffers: [data.flightOffers[0]],
        },
      });

    if (flightVerification.result.warnings) {
      return NextResponse.json(
        flightVerification.result.warnings.map((warning) => ({
          error: warning.title,
          detail: warning.detail,
          status: warning.status,
        })),
        { headers }
      );
    } else {
      // If this is just an availability check, return success without creating booking
      if (isAvailabilityCheck) {
        return NextResponse.json(
          {
            available: true,
            message: "Flight is available",
            priceInfo: flightVerification.data.flightOffers[0]?.price,
          },
          { headers }
        );
      }
      // Create flight order
      const order = await amadeusToken.booking.flightOrders.post({
        data: {
          type: "flight-order",
          flightOffers: [data.flightOffers[0]],
          travelers: data.travelers,
          remarks: data.remarks,
          ticketingAgreement: data.ticketingAgreement,
          contacts: data.contacts,
        },
      });

      if (order.result) {
        try {
          const createOrder = await Order.create({
            data: {
              type: "flight-order",
              id: order.data.id,
              queuingOfficeId: order.data.queuingOfficeId,
              associatedRecords: order.data.associatedRecords,
              flightOffers: [data.flightOffers[0]],
              travelers: data.travelers,
              remarks: data.remarks,
              ticketingAgreement: data.ticketingAgreement,
              contacts: data.contacts,
            },
            dictionaries: {
              locations: {},
            },
            metadata: {
              amadeusBookingId: order.data.id,
              bookingDate:
                order.data?.associatedRecords?.[0]?.creationDate || "",
              customerEmail: "",
              customerName: "",
              userId: "",
            },
          });

          if (createOrder) {
            return NextResponse.json(
              {
                success: true,
                bookingId: order.data.id,
                details: order.data,
              },
              { headers }
            );
          }
        } catch (dbError: any) {
          console.error("[create-booking-amadeus] Database error:", dbError);
          return NextResponse.json(
            {
              error: "Failed to create order on database",
              details: dbError.message,
            },
            { status: 500, headers }
          );
        }
      }

      return NextResponse.json(
        {
          success: true,
          bookingId: order.data.id,
          details: order.data,
        },
        { headers }
      );
    }
  } catch (error: any) {
    console.error("[create-booking-amadeus]", error);

    if (error.response?.data?.errors) {
      const amadeusError = error.response.data.errors[0];
      return NextResponse.json(
        {
          error: "Amadeus API Error",
          code: amadeusError.code,
          title: amadeusError.title,
          detail: amadeusError.detail,
        },
        { status: error.response.status || 500, headers }
      );
    }

    return NextResponse.json(
      { error: "Failed to create booking", details: error.message },
      { status: 500, headers }
    );
  }
}
