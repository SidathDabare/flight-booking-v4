import { stripe } from "@/lib/stripe";
import { format } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { cartItems, customer, amadeusBookingId } = await req.json();

    if (!cartItems || !customer) {
      return new NextResponse("Not enough data to checkout", { status: 400 });
    }

    // Create a price for the flight booking
    const price = await stripe.prices.create({
      unit_amount: cartItems[0].item.price * 100, // Convert to cents
      currency: "usd",
      product_data: {
        name: cartItems[0].item.title,
        metadata: {
          amadeusBookingId: amadeusBookingId,
          userId: customer.userId,
          customerEmail: customer.email,
          customerName: customer.name,
          bookingDate: format(new Date().toISOString(), "yyyy-MM-dd HH:mm"),
        },
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      client_reference_id: customer.userId,
      customer_email: customer.email,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        amadeusBookingId: amadeusBookingId,
        userId: customer.userId,
        customerEmail: customer.email,
        customerName: customer.name,
        bookingDate: format(new Date().toISOString(), "yyyy-MM-dd HH:mm"),
      },
      success_url: `${process.env.NEXT_PUBLIC_API_URL}/payment-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/booking`,
    });
    //console.log("Session:", session);
    return NextResponse.json(session, { headers: corsHeaders });
  } catch (err) {
    //console.log("[checkout_POST]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
