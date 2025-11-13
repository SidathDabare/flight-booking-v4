import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";
import { Princess_Sofia } from "next/font/google";

export async function POST(req: NextRequest) {
  try {
    const bookingData = await req.json();

    if (!bookingData) {
      return new NextResponse("Missing required data", { status: 400 });
    }

    // Validate required fields
    if (!bookingData.data || !bookingData.data.id) {
      return new NextResponse("Missing required fields: data or data.id", {
        status: 400,
      });
    }

    // Connect to database with error handling
    try {
      await connectDB();
    } catch (dbError) {
      console.error("[create-booking-db] Database connection error:", dbError);
      return new NextResponse("Database connection failed", { status: 500 });
    }

    try {
      // Format dates in the booking data
      const formattedData = {
        data: {
          ...bookingData.data,
          flightOffers: bookingData.data.flightOffers?.map((offer: any) => ({
            ...offer,
            lastTicketingDate: new Date(offer.lastTicketingDate),
            itineraries: offer.itineraries?.map((itinerary: any) => ({
              ...itinerary,
              segments: itinerary.segments?.map((segment: any) => ({
                ...segment,
                departure: {
                  ...segment.departure,
                  at: new Date(segment.departure.at),
                },
                arrival: {
                  ...segment.arrival,
                  at: new Date(segment.arrival.at),
                },
              })),
            })),
            price: {
              ...offer.price,
              fees:
                offer.price?.fees?.map((fee: any) => ({
                  amount: fee.amount || "0.00",
                  type: fee.type || "SUPPLIER",
                })) || [],
            },
            travelerPricings: offer.travelerPricings?.map((pricing: any) => ({
              ...pricing,
              price: {
                ...pricing.price,
                refundableTaxes: pricing.price.refundableTaxes
                  ? {
                      ...pricing.price.refundableTaxes,
                      amount: pricing.price.refundableTaxes.amount || "0.00",
                    }
                  : undefined,
              },
            })),
          })),

          travelers: bookingData.data.travelers?.map((traveler: any) => ({
            ...traveler,
            dateOfBirth: new Date(traveler.dateOfBirth),
            documents: traveler.documents?.map((doc: any) => ({
              ...doc,
              issuanceDate: new Date(doc.issuanceDate),
              expiryDate: new Date(doc.expiryDate),
            })),
          })),
          associatedRecords: bookingData.data.associatedRecords?.map(
            (record: any) => ({
              ...record,
              creationDate: new Date(record.creationDate),
            })
          ),
        },
        dictionaries: bookingData.dictionaries || {},
        metadata: bookingData.metadata || {},

        status: "pending", // Set default status
      };

      // Create the order
      const order = await Order.create(formattedData);

      return NextResponse.json(order);
    } catch (orderError: any) {
      console.error("[create-booking-db] Order creation error:", orderError);

      // Handle validation errors
      // if (orderError.name === "ValidationError") {
      //   return new NextResponse(
      //     JSON.stringify({
      //       error: "Validation Error",
      //       details: Object.values(orderError.errors).map(
      //         (err: any) => err.message
      //       ),
      //     }),
      //     { status: 400 }
      //   );
      // }

      // Handle duplicate key errors
      // if (orderError.code === 11000) {
      //   return new NextResponse(
      //     JSON.stringify({
      //       error: "Duplicate Error",
      //       details: "A booking with this ID already exists",
      //     }),
      //     { status: 409 }
      //   );
      // }

      return new NextResponse(
        JSON.stringify({
          error: "Failed to create order",
          details: orderError.message,
        }),
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[create-booking-db] General error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to process request",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
