import { NextResponse } from "next/server";

import amadeusToken from "@/lib/amadeusToken";

export const GET = async () => {
  try {
    const response = await amadeusToken.shopping.flightOffersSearch.get({
      originLocationCode: "SYD",
      destinationLocationCode: "BKK",
      departureDate: "2025-11-01",
      adults: 2,
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "An error occurred while fetching flight data" },
      { status: 500 }
    );
  }
};

// http://localhost:3000/api/flightOffersSearch
