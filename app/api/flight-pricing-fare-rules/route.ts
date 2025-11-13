import { NextRequest, NextResponse } from "next/server";
import { ResponseError } from "amadeus-ts";
import amadeus from "@/lib/amadeusToken";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    //console.log("Received body:", JSON.stringify(body, null, 2));

    if (!body?.flightOffers || !Array.isArray(body.flightOffers)) {
      //console.log("Validation failed:", {
      //  hasFlightOffers: !!body?.flightOffers,
      //  isArray: Array.isArray(body?.flightOffers),
      //  bodyKeys: Object.keys(body || {}),
      //});
      return NextResponse.json(
        {
          error: "flightOffers array required",
          received: {
            hasFlightOffers: !!body?.flightOffers,
            isArray: Array.isArray(body?.flightOffers),
            bodyKeys: Object.keys(body || {}),
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const response = await amadeus.shopping.flightOffers.pricing.post(
      {
        data: {
          type: "flight-offers-pricing",
          flightOffers: body.flightOffers,
        },
      },
      {
        include: ["detailed-fare-rules"],
      }
    );

    return NextResponse.json(response.result);
  } catch (error: unknown) {
    //console.error("Pricing API error:", error);

    if (error instanceof ResponseError) {
      return NextResponse.json(
        { error: "Amadeus API error", details: error.description },
        { status: 502, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// export async function GET() {
//   return NextResponse.json(
//     {
//       message: "Flight Pricing Test API",
//       usage: "POST with { flightOffers: [...] }",
//     },
//     { headers: corsHeaders }
//   );
// }
