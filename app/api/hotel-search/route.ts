import { NextRequest, NextResponse } from "next/server";
import { searchHotelsWithOffers, searchHotelsByCity, searchHotelsByGeocode } from "@/lib/actions/hotel-search";
import { hotelSearchSchema } from "@/lib/zod/hotel-search";

/**
 * GET /api/hotel-search
 * Search for hotels with offers
 *
 * Query parameters:
 * - cityCode: City code (3 letters)
 * - latitude: Latitude for geo search
 * - longitude: Longitude for geo search
 * - checkInDate: Check-in date (YYYY-MM-DD)
 * - checkOutDate: Check-out date (YYYY-MM-DD)
 * - adults: Number of adults
 * - children: Number of children
 * - rooms: Number of rooms
 * - radius: Search radius
 * - radiusUnit: KM or MILE
 * - currency: Currency code
 * - max: Maximum results
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const params = {
      cityCode: searchParams.get("cityCode") || undefined,
      latitude: searchParams.get("latitude") ? parseFloat(searchParams.get("latitude")!) : undefined,
      longitude: searchParams.get("longitude") ? parseFloat(searchParams.get("longitude")!) : undefined,
      checkInDate: searchParams.get("checkInDate") || "",
      checkOutDate: searchParams.get("checkOutDate") || "",
      adults: searchParams.get("adults") ? parseInt(searchParams.get("adults")!) : 1,
      children: searchParams.get("children") ? parseInt(searchParams.get("children")!) : 0,
      rooms: searchParams.get("rooms") ? parseInt(searchParams.get("rooms")!) : 1,
      radius: searchParams.get("radius") ? parseInt(searchParams.get("radius")!) : undefined,
      radiusUnit: searchParams.get("radiusUnit") as "KM" | "MILE" | undefined,
      currency: searchParams.get("currency") || "USD",
      max: searchParams.get("max") ? parseInt(searchParams.get("max")!) : 20,
      boardType: searchParams.get("boardType") as any,
    };

    // Validate required parameters
    if (!params.checkInDate || !params.checkOutDate) {
      return NextResponse.json(
        { error: "Check-in and check-out dates are required" },
        { status: 400 }
      );
    }

    if (!params.cityCode && (!params.latitude || !params.longitude)) {
      return NextResponse.json(
        { error: "Either cityCode or coordinates (latitude/longitude) are required" },
        { status: 400 }
      );
    }

    // Validate with Zod schema
    try {
      hotelSearchSchema.parse(params);
    } catch (validationError: any) {
      return NextResponse.json(
        { error: "Validation failed", details: validationError.errors },
        { status: 400 }
      );
    }

    // Search hotels with offers
    const result = await searchHotelsWithOffers(params);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      hotelsCount: (result as any).hotelsCount,
      warning: (result as any).warning,
      hotelsOnly: (result as any).hotelsOnly,
    });

  } catch (error) {
    console.error("Hotel search API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
