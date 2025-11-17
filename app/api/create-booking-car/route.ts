import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { carBookingSchema } from "@/lib/zod/car-search";
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
    const validatedData = carBookingSchema.parse(body);

    console.log("Creating car rental booking:", validatedData);

    // 3. Verify vehicle availability (call Amadeus Car Booking API)
    // Note: In production, you would call Amadeus API to verify availability
    // For now, we'll proceed with the booking

    try {
      // Amadeus Car Booking API call (when integrated)
      // const carOffer = await amadeusToken.booking.carRentals.post({
      //   data: {
      //     offerId: body.offerId,
      //     driver: validatedData.driver,
      //   }
      // });

      // For now, assuming availability is confirmed
      const confirmationNumber = `CAR${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;

      // 4. Connect to database
      await connectDB();

      // 5. Create order in database
      const orderData = {
        bookingType: "car-rental",
        data: {
          type: "car-rental",
          id: validatedData.vehicleId,
          queuingOfficeId: "N/A", // Not applicable for car rentals
          // Store the complete rental data
          vehicle: body.vehicle || {}, // Vehicle details from frontend
          vendor: body.vendor || {}, // Vendor details
          rental: {
            pickupLocation: body.pickupLocationDetails || validatedData.pickupLocation,
            dropoffLocation: body.dropoffLocationDetails || validatedData.dropoffLocation,
            pickupDate: validatedData.pickupDate,
            dropoffDate: validatedData.dropoffDate,
            durationDays: body.durationDays || 1,
            isOneWay: validatedData.pickupLocation !== validatedData.dropoffLocation,
          },
          driver: validatedData.driver,
          additionalDrivers: validatedData.additionalDrivers || [],
          insurance: validatedData.insurance,
          additionalServices: validatedData.additionalServices || [],
          specialRequests: validatedData.specialRequests || "",
          pricing: body.pricing || {}, // Pricing details from frontend
          terms: body.terms || {}, // Rental terms
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

      console.log("Car rental booking created successfully:", order._id);

      // 6. Return response with confirmation
      return NextResponse.json(
        {
          success: true,
          orderId: order._id.toString(),
          confirmationNumber: confirmationNumber,
          voucherUrl: `/api/car-voucher/${order._id}`, // For future implementation
          rental: {
            vehicleId: validatedData.vehicleId,
            pickupDate: validatedData.pickupDate,
            dropoffDate: validatedData.dropoffDate,
            pickupLocation: validatedData.pickupLocation,
            dropoffLocation: validatedData.dropoffLocation,
            driver: {
              name: `${validatedData.driver.firstName} ${validatedData.driver.lastName}`,
              email: validatedData.driver.email,
            },
            totalPrice: body.pricing?.totalPrice || 0,
            currency: body.pricing?.currency || "USD",
          },
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to create rental booking in database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Car rental booking error:", error);

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
          error: "Car rental booking failed",
          details: amadeusError.description || amadeusError.message,
        },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "An error occurred while creating the car rental booking" },
      { status: 500 }
    );
  }
}

// GET endpoint for testing (remove in production)
export async function GET() {
  return NextResponse.json(
    {
      message: "Car Rental Booking API - Use POST method with booking data",
      example: {
        vehicleId: "CAR123",
        vendorCode: "HERTZ",
        pickupLocation: "JFK",
        dropoffLocation: "JFK",
        pickupDate: "2025-12-01T10:00",
        dropoffDate: "2025-12-05T10:00",
        driver: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "+1234567890",
          dateOfBirth: "1990-01-01",
          age: 35,
          licenseNumber: "D1234567",
          licenseIssuingCountry: "US",
          licenseExpiryDate: "2028-01-01",
        },
        insurance: [
          {
            code: "CDW",
            name: "Collision Damage Waiver",
            price: 15,
          },
        ],
        vehicle: {
          make: "Toyota",
          model: "Camry",
          category: "STANDARD",
        },
        pricing: {
          currency: "USD",
          dailyRate: 50,
          totalPrice: 200,
        },
      },
    },
    { status: 200 }
  );
}
