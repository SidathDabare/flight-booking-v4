import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { hotelSearchSchema } from "@/lib/zod/hotel-search";
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
    const validatedData = hotelSearchSchema.parse(body);

    // 3. Check cache
    const cacheKey = `hotel-search:${JSON.stringify(validatedData)}`;
    const cachedResult = getCached(cacheKey);
    if (cachedResult) {
      console.log("Returning cached hotel search results");
      return NextResponse.json({ ...cachedResult, cached: true }, { status: 200 });
    }

    // 4. STEP 1: Get hotel IDs using Hotel List API
    console.log("Step 1: Fetching hotel list for location:", validatedData.cityCode || validatedData.location);

    let hotelsListResponse;

    if (validatedData.cityCode) {
      // Search by city code
      hotelsListResponse = await amadeusToken.referenceData.locations.hotels.byCity.get({
        cityCode: validatedData.cityCode,
        radius: validatedData.radius || 5,
        radiusUnit: "KM",
        ratings: validatedData.rating?.join(","),
        amenities: validatedData.amenities?.join(","),
      });
    } else if (validatedData.latitude && validatedData.longitude) {
      // Search by geographic coordinates
      hotelsListResponse = await amadeusToken.referenceData.locations.hotels.byGeocode.get({
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        radius: validatedData.radius || 5,
        radiusUnit: "KM",
        ratings: validatedData.rating?.join(","),
        amenities: validatedData.amenities?.join(","),
      });
    } else {
      return NextResponse.json(
        { error: "Either cityCode or latitude/longitude is required" },
        { status: 400 }
      );
    }

    if (!hotelsListResponse.data || hotelsListResponse.data.length === 0) {
      console.log("No hotels found for the given location");
      return NextResponse.json({
        data: [],
        meta: {
          count: 0,
          message: "No hotels found in this location",
          links: { self: req.url },
        },
        cached: false,
      }, { status: 200 });
    }

    console.log(`Found ${hotelsListResponse.data.length} hotels in the area`);

    // 5. STEP 2: Get hotel offers with availability and pricing
    // Limit to 50 hotels to avoid timeout and improve performance
    const hotelIds = hotelsListResponse.data
      .slice(0, 50)
      .map((hotel: any) => hotel.hotelId)
      .join(",");

    console.log(`Step 2: Fetching offers for ${hotelIds.split(",").length} hotels`);

    const offersSearchParams: any = {
      hotelIds: hotelIds,
      checkInDate: validatedData.checkInDate,
      checkOutDate: validatedData.checkOutDate,
      adults: validatedData.adults,
      roomQuantity: validatedData.rooms,
      currency: validatedData.currency || "USD",
      bestRateOnly: true, // Get only the best rate per hotel
      includeClosed: false, // Exclude hotels without availability
    };

    // Add price range filter if specified
    if (validatedData.minPrice && validatedData.maxPrice) {
      offersSearchParams.priceRange = `${validatedData.minPrice}-${validatedData.maxPrice}`;
    }

    // Add payment policy if needed
    if (validatedData.paymentPolicy) {
      offersSearchParams.paymentPolicy = validatedData.paymentPolicy;
    }

    // Add board type if needed
    if (validatedData.boardType) {
      offersSearchParams.boardType = validatedData.boardType;
    }

    const offersResponse = await amadeusToken.shopping.hotelOffersSearch.get(offersSearchParams);

    console.log(`Received ${offersResponse.data?.length || 0} hotel offers with availability`);

    const result = {
      data: offersResponse.data || [],
      meta: {
        count: offersResponse.data?.length || 0,
        totalHotelsSearched: hotelIds.split(",").length,
        totalHotelsInArea: hotelsListResponse.data.length,
        links: {
          self: req.url,
        },
      },
    };

    // 6. Cache the result
    setCache(cacheKey, result, 15 * 60 * 1000); // 15 minutes

    // 7. Return response
    return NextResponse.json({ ...result, cached: false }, { status: 200 });
  } catch (error) {
    console.error("Hotel search error:", error);

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
          error: "Hotel search failed",
          details: amadeusError.description || amadeusError.message,
        },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: "An error occurred while searching for hotels" },
      { status: 500 }
    );
  }
}

// GET endpoint for testing (remove in production)
export async function GET() {
  return NextResponse.json(
    {
      message: "Hotel Search API - Use POST method with search parameters",
      example: {
        cityCode: "NYC",
        checkInDate: "2025-12-01",
        checkOutDate: "2025-12-05",
        adults: 2,
        rooms: 1,
        currency: "USD",
      },
    },
    { status: 200 }
  );
}
