import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import dbConnect from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";

if (process.env.STRIPE_SECRET_KEY === undefined) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { items, currency = "USD", metadata = {} } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: items array is required" },
        { status: 400 }
      );
    }

    // 3. Calculate total amount from cart items
    let totalAmount = 0;
    const itemDetails = items.map((item: any) => {
      let itemPrice = 0;

      if (item.type === "flight") {
        // Flight price is a string
        itemPrice = Math.round(parseFloat(item.data.price?.grandTotal || "0") * 100);
      } else if (item.type === "hotel") {
        // Hotel price is a number
        itemPrice = Math.round((item.data.pricing?.totalPrice || 0) * 100);
      } else if (item.type === "car") {
        // Car price is a number
        itemPrice = Math.round((item.data.pricing?.totalPrice || 0) * 100);
      }

      totalAmount += itemPrice;

      return {
        type: item.type,
        id: item.id,
        price: itemPrice,
      };
    });

    // 4. Validate total amount
    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount: Total must be greater than 0" },
        { status: 400 }
      );
    }

    // 5. Generate groupId for multi-booking transaction
    const groupId = `grp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // 6. Create booking orders in database (pending status)
    await dbConnect();

    const orderPromises = items.map(async (item: any) => {
      let confirmationNumber = "";
      let orderData: any = {};

      if (item.type === "flight") {
        confirmationNumber = `FLT${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        orderData = {
          bookingType: "flight-offer",
          data: item.data,
          metadata: {
            userId: session.user.id,
            confirmationNumber,
            totalAmount: parseFloat(item.data.price?.grandTotal || "0"),
            currency: item.data.price?.currency || currency,
          },
          groupId,
          status: "pending",
        };
      } else if (item.type === "hotel") {
        confirmationNumber = `HTL${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        orderData = {
          bookingType: "hotel-booking",
          data: item.data,
          metadata: {
            userId: session.user.id,
            confirmationNumber,
            totalAmount: item.data.pricing?.totalPrice || 0,
            currency: item.data.pricing?.currency || currency,
          },
          groupId,
          status: "pending",
        };
      } else if (item.type === "car") {
        confirmationNumber = `CAR${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        orderData = {
          bookingType: "car-rental",
          data: item.data,
          metadata: {
            userId: session.user.id,
            confirmationNumber,
            totalAmount: item.data.pricing?.totalPrice || 0,
            currency: item.data.pricing?.currency || currency,
          },
          groupId,
          status: "pending",
        };
      }

      return Order.create(orderData);
    });

    const createdOrders = await Promise.all(orderPromises);
    console.log(`Created ${createdOrders.length} pending orders for groupId:`, groupId);

    // 7. Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      description: `Multi-booking: ${items.length} item(s)`,
      metadata: {
        userId: session.user.id,
        userEmail: session.user.email || "",
        userName: session.user.name || "",
        groupId: groupId,
        itemCount: items.length.toString(),
        bookingTypes: items.map((item: any) => item.type).join(","),
        ...metadata,
      },
    });

    console.log("Payment intent created:", paymentIntent.id, "for", items.length, "items");

    // 8. Return response
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      groupId: groupId,
      totalAmount: totalAmount,
      currency: currency,
      itemCount: items.length,
      itemDetails: itemDetails,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}

// GET endpoint for testing (remove in production)
export async function GET() {
  return NextResponse.json(
    {
      message: "Multi-Booking Payment Intent API - Use POST method",
      example: {
        items: [
          {
            type: "flight",
            id: "flight-123",
            data: {
              price: {
                grandTotal: "500.00",
              },
            },
          },
          {
            type: "hotel",
            id: "hotel-456",
            data: {
              pricing: {
                totalPrice: 600,
              },
            },
          },
          {
            type: "car",
            id: "car-789",
            data: {
              pricing: {
                totalPrice: 200,
              },
            },
          },
        ],
        currency: "USD",
      },
    },
    { status: 200 }
  );
}
