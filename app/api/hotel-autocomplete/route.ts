import { NextRequest, NextResponse } from "next/server";
import { autocompleteHotel } from "@/lib/actions/hotel-search";
import { hotelAutocompleteSchema } from "@/lib/zod/hotel-search";

/**
 * GET /api/hotel-autocomplete
 * Autocomplete hotel/city search
 *
 * Query parameters:
 * - keyword: Search keyword (min 2 characters)
 * - subType: HOTEL_LEISURE, HOTEL_GDS, or CITY (default: HOTEL_GDS)
 * - max: Maximum results (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const keyword = searchParams.get("keyword");
    const subType = searchParams.get("subType") || "HOTEL_GDS";
    const max = searchParams.get("max") ? parseInt(searchParams.get("max")!) : 10;

    // Validate keyword
    if (!keyword || keyword.length < 2) {
      return NextResponse.json(
        { error: "Keyword must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Validate with Zod schema
    const params = {
      keyword,
      subType: subType as "HOTEL_LEISURE" | "HOTEL_GDS" | "CITY",
      max,
    };

    try {
      hotelAutocompleteSchema.parse(params);
    } catch (validationError: any) {
      return NextResponse.json(
        { error: "Validation failed", details: validationError.errors },
        { status: 400 }
      );
    }

    // Get autocomplete results
    const result = await autocompleteHotel(params);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });

  } catch (error) {
    console.error("Hotel autocomplete API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
