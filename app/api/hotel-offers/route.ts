import { NextRequest, NextResponse } from "next/server";
import { getHotelOffers, getHotelOfferById } from "@/lib/actions/hotel-search";

/**
 * GET /api/hotel-offers
 * Get hotel offers for specific hotels
 *
 * Query parameters:
 * - hotelIds: Comma-separated hotel IDs (required)
 * - adults: Number of adults (required)
 * - checkInDate: Check-in date YYYY-MM-DD (required)
 * - checkOutDate: Check-out date YYYY-MM-DD (required)
 * - roomQuantity: Number of rooms
 * - currency: Currency code
 * - paymentPolicy: Payment policy
 * - boardType: Board type (meal plan)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const hotelIds = searchParams.get("hotelIds");
    const adults = searchParams.get("adults");
    const checkInDate = searchParams.get("checkInDate");
    const checkOutDate = searchParams.get("checkOutDate");
    const roomQuantity = searchParams.get("roomQuantity");
    const currency = searchParams.get("currency");
    const paymentPolicy = searchParams.get("paymentPolicy");
    const boardType = searchParams.get("boardType");
    const offerId = searchParams.get("offerId");

    // If offerId is provided, get specific offer
    if (offerId) {
      const result = await getHotelOfferById(offerId);

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
    }

    // Validate required parameters for hotel offers search
    if (!hotelIds) {
      return NextResponse.json(
        { error: "hotelIds parameter is required" },
        { status: 400 }
      );
    }

    if (!adults) {
      return NextResponse.json(
        { error: "adults parameter is required" },
        { status: 400 }
      );
    }

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: "checkInDate and checkOutDate are required" },
        { status: 400 }
      );
    }

    // Build parameters
    const params: any = {
      hotelIds,
      adults: parseInt(adults),
      checkInDate,
      checkOutDate,
    };

    if (roomQuantity) {
      params.roomQuantity = parseInt(roomQuantity);
    }

    if (currency) {
      params.currency = currency;
    }

    if (paymentPolicy) {
      params.paymentPolicy = paymentPolicy;
    }

    if (boardType) {
      params.boardType = boardType;
    }

    // Get hotel offers
    const result = await getHotelOffers(params);

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
    console.error("Hotel offers API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
