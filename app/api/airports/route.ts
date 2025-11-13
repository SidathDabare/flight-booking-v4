import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Airport } from "@/lib/db/models/Airport";

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
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const city = searchParams.get("city");
    const country = searchParams.get("country");
    const iata = searchParams.get("iata");
    const icao = searchParams.get("icao");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    // Build search filter
    const filter: any = {};

    if (iata) {
      filter.IATA = { $regex: new RegExp(iata, 'i') };
    }

    if (icao) {
      filter.ICAO = { $regex: new RegExp(icao, 'i') };
    }

    if (city) {
      filter.city = { $regex: new RegExp(city, 'i') };
    }

    if (country) {
      filter.country = { $regex: new RegExp(country, 'i') };
    }

    // General text search across multiple fields
    if (query) {
      filter.$or = [
        { name: { $regex: new RegExp(query, 'i') } },
        { city: { $regex: new RegExp(query, 'i') } },
        { country: { $regex: new RegExp(query, 'i') } },
        { IATA: { $regex: new RegExp(query, 'i') } },
        { ICAO: { $regex: new RegExp(query, 'i') } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute search with pagination
    const airports = await Airport.find(filter)
      .sort({ name: 1 })
      .limit(Math.min(limit, 100)) // Cap at 100 results
      .skip(skip)
      .lean();

    // Get total count for pagination info
    const totalCount = await Airport.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      airports,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      }
    }, { headers });

  } catch (error: any) {
    console.error("Error searching airports:", error);

    return NextResponse.json(
      {
        error: "Failed to search airports",
        details: error.message || "Internal server error"
      },
      { status: 500, headers }
    );
  }
}