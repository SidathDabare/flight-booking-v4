"use server";

import amadeus from "@/lib/amadeusToken";
import { ResponseError } from "amadeus-ts";
import { HotelSearch, HotelAutocomplete } from "@/lib/zod/hotel-search";

/**
 * Search hotels by city code
 * Uses Amadeus Hotel List API
 */
export async function searchHotelsByCity(cityCode: string, radius?: number, radiusUnit?: string) {
  try {
    const params: any = {
      cityCode: cityCode.toUpperCase(),
    };

    if (radius) {
      params.radius = radius;
      params.radiusUnit = radiusUnit || "KM";
    }

    const response = await amadeus.referenceData.locations.hotels.byCity.get(params);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    if (error instanceof ResponseError) {
      console.error("Amadeus API Error (searchHotelsByCity):", error);
      return {
        success: false,
        error: error.description || "Failed to search hotels by city",
        code: error.code,
      };
    }
    console.error("Unexpected error in searchHotelsByCity:", error);
    return {
      success: false,
      error: "An unexpected error occurred while searching hotels",
    };
  }
}

/**
 * Search hotels by geographic coordinates
 * Uses Amadeus Hotel List API
 */
export async function searchHotelsByGeocode(
  latitude: number,
  longitude: number,
  radius?: number,
  radiusUnit?: string
) {
  try {
    const params: any = {
      latitude,
      longitude,
    };

    if (radius) {
      params.radius = radius;
      params.radiusUnit = radiusUnit || "KM";
    }

    const response = await amadeus.referenceData.locations.hotels.byGeocode.get(params);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    if (error instanceof ResponseError) {
      console.error("Amadeus API Error (searchHotelsByGeocode):", error);
      return {
        success: false,
        error: error.description || "Failed to search hotels by location",
        code: error.code,
      };
    }
    console.error("Unexpected error in searchHotelsByGeocode:", error);
    return {
      success: false,
      error: "An unexpected error occurred while searching hotels",
    };
  }
}

/**
 * Get hotel offers with pricing
 * Uses Amadeus Hotel Search API V3
 */
export async function getHotelOffers(params: {
  hotelIds: string;
  adults: number;
  checkInDate: string;
  checkOutDate: string;
  roomQuantity?: number;
  currency?: string;
  paymentPolicy?: string;
  boardType?: string;
}) {
  try {
    const searchParams: any = {
      hotelIds: params.hotelIds,
      adults: params.adults,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
    };

    if (params.roomQuantity) {
      searchParams.roomQuantity = params.roomQuantity;
    }

    if (params.currency) {
      searchParams.currency = params.currency;
    }

    if (params.paymentPolicy) {
      searchParams.paymentPolicy = params.paymentPolicy;
    }

    if (params.boardType) {
      searchParams.boardType = params.boardType;
    }

    const response = await amadeus.shopping.hotelOffersSearch.get(searchParams);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    if (error instanceof ResponseError) {
      console.error("Amadeus API Error (getHotelOffers):", error);
      return {
        success: false,
        error: error.description || "Failed to get hotel offers",
        code: error.code,
      };
    }
    console.error("Unexpected error in getHotelOffers:", error);
    return {
      success: false,
      error: "An unexpected error occurred while getting hotel offers",
    };
  }
}

/**
 * Get specific hotel offer details
 * Uses Amadeus Hotel Search API V3
 */
export async function getHotelOfferById(offerId: string) {
  try {
    const response = await amadeus.shopping.hotelOfferSearch(offerId).get();

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    if (error instanceof ResponseError) {
      console.error("Amadeus API Error (getHotelOfferById):", error);
      return {
        success: false,
        error: error.description || "Failed to get hotel offer details",
        code: error.code,
      };
    }
    console.error("Unexpected error in getHotelOfferById:", error);
    return {
      success: false,
      error: "An unexpected error occurred while getting hotel offer",
    };
  }
}

/**
 * Autocomplete hotel/city search
 * Uses Amadeus Hotel Name Autocomplete API
 */
export async function autocompleteHotel(params: HotelAutocomplete) {
  try {
    const response = await amadeus.referenceData.locations.hotel.get({
      keyword: params.keyword,
      subType: params.subType,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    if (error instanceof ResponseError) {
      console.error("Amadeus API Error (autocompleteHotel):", error);
      return {
        success: false,
        error: error.description || "Failed to autocomplete hotel search",
        code: error.code,
      };
    }
    console.error("Unexpected error in autocompleteHotel:", error);
    return {
      success: false,
      error: "An unexpected error occurred during autocomplete",
    };
  }
}

/**
 * Get hotel ratings and sentiments
 * Uses Amadeus Hotel Ratings API
 */
export async function getHotelRatings(hotelIds: string) {
  try {
    const response = await amadeus.eReputation.hotelSentiments.get({
      hotelIds,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    if (error instanceof ResponseError) {
      console.error("Amadeus API Error (getHotelRatings):", error);
      return {
        success: false,
        error: error.description || "Failed to get hotel ratings",
        code: error.code,
      };
    }
    console.error("Unexpected error in getHotelRatings:", error);
    return {
      success: false,
      error: "An unexpected error occurred while getting hotel ratings",
    };
  }
}

/**
 * Get hotels by specific hotel IDs
 * Uses Amadeus Hotel List API
 */
export async function getHotelsByIds(hotelIds: string) {
  try {
    const response = await amadeus.referenceData.locations.hotels.byHotels.get({
      hotelIds,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    if (error instanceof ResponseError) {
      console.error("Amadeus API Error (getHotelsByIds):", error);
      return {
        success: false,
        error: error.description || "Failed to get hotels by IDs",
        code: error.code,
      };
    }
    console.error("Unexpected error in getHotelsByIds:", error);
    return {
      success: false,
      error: "An unexpected error occurred while getting hotels",
    };
  }
}

/**
 * Comprehensive hotel search that combines multiple steps
 * 1. Search hotels by city/location
 * 2. Get offers for found hotels
 */
export async function searchHotelsWithOffers(searchParams: Partial<HotelSearch>) {
  try {
    // Step 1: Get list of hotels
    let hotelsResult;

    if (searchParams.cityCode) {
      hotelsResult = await searchHotelsByCity(
        searchParams.cityCode,
        searchParams.radius,
        searchParams.radiusUnit
      );
    } else if (searchParams.latitude && searchParams.longitude) {
      hotelsResult = await searchHotelsByGeocode(
        searchParams.latitude,
        searchParams.longitude,
        searchParams.radius,
        searchParams.radiusUnit
      );
    } else {
      return {
        success: false,
        error: "Either cityCode or coordinates (latitude/longitude) are required",
      };
    }

    if (!hotelsResult.success || !hotelsResult.data) {
      return hotelsResult;
    }

    // Limit number of hotels to query for offers (to avoid API limits)
    const maxHotels = Math.min(hotelsResult.data.length, searchParams.max || 20);
    const hotelsList = hotelsResult.data.slice(0, maxHotels);

    if (hotelsList.length === 0) {
      return {
        success: true,
        data: [],
        message: "No hotels found in this location",
      };
    }

    // Step 2: Get offers for these hotels
    const hotelIds = hotelsList.map((hotel: any) => hotel.hotelId).join(",");

    const offersResult = await getHotelOffers({
      hotelIds,
      adults: searchParams.adults || 1,
      checkInDate: searchParams.checkInDate!,
      checkOutDate: searchParams.checkOutDate!,
      roomQuantity: searchParams.rooms,
      currency: searchParams.currency,
      boardType: searchParams.boardType,
    });

    if (!offersResult.success) {
      // Return hotels list even if offers fail
      return {
        success: true,
        data: hotelsList,
        warning: "Hotels found but offers unavailable",
        hotelsOnly: true,
      };
    }

    return {
      success: true,
      data: offersResult.data,
      hotelsCount: hotelsList.length,
    };
  } catch (error) {
    console.error("Unexpected error in searchHotelsWithOffers:", error);
    return {
      success: false,
      error: "An unexpected error occurred during hotel search",
    };
  }
}
