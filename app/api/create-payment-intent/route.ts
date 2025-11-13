// TEST

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

if (process.env.STRIPE_SECRET_KEY === undefined) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

if (process.env.NEXT_PUBLIC_CURRENCY === undefined) {
  throw new Error("NEXT_PUBLIC_CURRENCY is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: process.env.NEXT_PUBLIC_CURRENCY as string,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Internal Error:", error);
    // Handle other errors (e.g., network issues, parsing errors)
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
