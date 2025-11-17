"use server";

import amadeusToken from "../amadeusToken";
import type { HotelSearchParams } from "@/types/hotel";

export async function searchHotels(params: HotelSearchParams) {
  try {
    const searchParams: any = {
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: params.adults,
      roomQuantity: params.rooms || 1,
      currency: params.currency || "USD",
      radius: params.radius || 50,
      radiusUnit: "KM",
    };

    // Add location parameter
    if (params.cityCode) {
      searchParams.cityCode = params.cityCode;
    } else if (params.latitude && params.longitude) {
      searchParams.latitude = params.latitude;
      searchParams.longitude = params.longitude;
    }

    // Add optional filters
    if (params.rating && params.rating.length > 0) {
      searchParams.ratings = params.rating.join(",");
    }

    if (params.amenities && params.amenities.length > 0) {
      searchParams.amenities = params.amenities.join(",");
    }

    if (params.minPrice) {
      searchParams.priceRange = `${params.minPrice}-${params.maxPrice || 99999}`;
    }

    console.log("Searching hotels with Amadeus:", searchParams);

    // TODO: Implement actual Amadeus hotel search when available
    // const response = await amadeusToken.shopping.hotelOffersSearch.get(searchParams);

    return {
      success: true,
      data: [],
      meta: {
        count: 0,
      },
    };
  } catch (error) {
    console.error("Hotel search error:", error);

    const errorMessage =
      (error && typeof error === "object" && "description" in error &&
        Array.isArray(error.description) && error.description[0]?.detail) ||
      (error instanceof Error && error.message) ||
      "Failed to search hotels";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getHotelDetails(hotelId: string) {
  try {
    console.log("Fetching hotel details for:", hotelId);

    // TODO: Implement actual Amadeus hotel details fetch when available
    // const response = await amadeusToken.shopping.hotelOffersByHotel.get({
    //   hotelId: hotelId,
    // });

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Hotel details error:", error);

    const errorMessage =
      (error && typeof error === "object" && "description" in error &&
        Array.isArray(error.description) && error.description[0]?.detail) ||
      (error instanceof Error && error.message) ||
      "Failed to fetch hotel details";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
