import { NextResponse, NextRequest } from "next/server";

import amadeusToken from "@/lib/amadeusToken";

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  try {
    const searchParams = new URL(req.url).searchParams;
    const latitude = parseFloat(searchParams.get("latitude") || "");
    const longitude = parseFloat(searchParams.get("longitude") || "");

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: "Invalid latitude or longitude provided" },
        { status: 400, headers }
      );
    }

    //console.log(`Searching for airports near: ${latitude}, ${longitude}`);

    const response = await amadeusToken.referenceData.locations.airports.get({
      longitude,
      latitude,
    });

    return NextResponse.json(JSON.parse(response.body), { headers });
  } catch (err: any) {
    //console.error("Amadeus API Error:", err);

    // Handle specific Amadeus errors
    if (err.response?.status === 401) {
      return NextResponse.json(
        { error: "Authentication failed with Amadeus API" },
        { status: 401, headers }
      );
    }
    
    if (err.response?.status === 400) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400, headers }
      );
    }

    return NextResponse.json(
      { 
        error: err.message || "Internal server error",
        details: err.response?.data || err.response?.body || null
      },
      { status: 500, headers }
    );
  }
}
