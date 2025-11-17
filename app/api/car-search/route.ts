import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { carSearchSchema } from "@/lib/zod/car-search";
import { z } from "zod";
import amadeusToken from "@/lib/amadeusToken";

// Simple in-memory cache (15 minutes TTL)
const cache = new Map<string, { data: any; expires: number }>();

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any, ttl: number = 15 * 60 * 1000) {
  cache.set(key, { data, expires: Date.now() + ttl });
}

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
    const validatedData = carSearchSchema.parse(body);

    // 3. Check cache
    const cacheKey = `car-search:${JSON.stringify(validatedData)}`;
    const cachedResult = getCached(cacheKey);
    if (cachedResult) {
      console.log("Returning cached car search results");
      return NextResponse.json({ ...cachedResult, cached: true }, { status: 200 });
    }

    // 4. Call Amadeus Car Rental API
    console.log("Searching cars with params:", validatedData);

    const searchParams: any = {
      originLocationCode: validatedData.pickupLocation,
      pickupDate: validatedData.pickupDate,
      dropoffDate: validatedData.dropoffDate,
      currency: validatedData.currency,
    };

    // Add dropoff location if different from pickup (one-way rental)
    if (validatedData.dropoffLocation && validatedData.dropoffLocation !== validatedData.pickupLocation) {
      searchParams.destinationLocationCode = validatedData.dropoffLocation;
    }

    // Add optional filters
    if (validatedData.category) {
      searchParams.vehicleCategory = validatedData.category;
    }

    if (validatedData.transmission) {
      searchParams.transmission = validatedData.transmission;
    }

    if (validatedData.minSeating) {
      searchParams.seats = validatedData.minSeating;
    }

    if (validatedData.maxPrice) {
      searchParams.maxPrice = validatedData.maxPrice;
    }

    if (validatedData.vendorCodes && validatedData.vendorCodes.length > 0) {
      searchParams.provider = validatedData.vendorCodes.join(",");
    }

    // Note: Amadeus Shopping Car API
    // For production, you'll use the appropriate Amadeus car rental API endpoint
    // Documentation: https://developers.amadeus.com/self-service/category/cars
    // TODO: Implement actual Amadeus car rental search when available

    // Placeholder: Return mock data for now
    // const response = await amadeusToken.shopping.carRentals.get(searchParams);

    const result = {
      data: [],
      meta: {
        count: 0,
        links: {
          self: req.url,
        },
      },
    };

    // 5. Cache the result
    setCache(cacheKey, result, 15 * 60 * 1000); // 15 minutes

    // 6. Return response
    return NextResponse.json({ ...result, cached: false }, { status: 200 });
  } catch (error) {
    console.error("Car search error:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid search parameters",
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
          error: "Car search failed",
          details: amadeusError.description || amadeusError.message,
        },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "An error occurred while searching for cars" },
      { status: 500 }
    );
  }
}

// GET endpoint for testing (remove in production)
export async function GET() {
  return NextResponse.json(
    {
      message: "Car Search API - Use POST method with search parameters",
      example: {
        pickupLocation: "JFK",
        dropoffLocation: "JFK",
        pickupDate: "2025-12-01T10:00",
        dropoffDate: "2025-12-05T10:00",
        driverAge: 25,
        currency: "USD",
      },
    },
    { status: 200 }
  );
}
