"use server";

import amadeusToken from "../amadeusToken";
import type { CarSearchParams } from "@/types/car";

export async function searchCars(params: CarSearchParams) {
  try {
    const searchParams: any = {
      originLocationCode: params.pickupLocation,
      pickupDate: params.pickupDate,
      dropoffDate: params.dropoffDate,
      currency: params.currency || "USD",
    };

    // Add dropoff location if different (one-way rental)
    if (params.dropoffLocation && params.dropoffLocation !== params.pickupLocation) {
      searchParams.destinationLocationCode = params.dropoffLocation;
    }

    // Add optional filters
    if (params.category) {
      searchParams.vehicleCategory = params.category;
    }

    if (params.transmission) {
      searchParams.transmission = params.transmission;
    }

    if (params.minSeating) {
      searchParams.seats = params.minSeating;
    }

    if (params.maxPrice) {
      searchParams.maxPrice = params.maxPrice;
    }

    if (params.vendorCodes && params.vendorCodes.length > 0) {
      searchParams.provider = params.vendorCodes.join(",");
    }

    console.log("Searching cars with Amadeus:", searchParams);

    // TODO: Implement actual Amadeus car rental search when available
    // const response = await amadeusToken.shopping.carRentals.get(searchParams);

    return {
      success: true,
      data: [],
      meta: {
        count: 0,
      },
    };
  } catch (error) {
    console.error("Car search error:", error);

    const errorMessage =
      (error && typeof error === "object" && "description" in error &&
        Array.isArray(error.description) && error.description[0]?.detail) ||
      (error instanceof Error && error.message) ||
      "Failed to search cars";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getCarDetails(offerId: string) {
  try {
    console.log("Fetching car rental details for:", offerId);

    // Note: Amadeus doesn't have a specific car details endpoint
    // Usually you would re-search or cache the offer details
    // For now, returning a placeholder

    return {
      success: true,
      data: null,
      message: "Car details endpoint - implementation depends on caching strategy",
    };
  } catch (error) {
    console.error("Car details error:", error);

    const errorMessage =
      (error && typeof error === "object" && "description" in error &&
        Array.isArray(error.description) && error.description[0]?.detail) ||
      (error instanceof Error && error.message) ||
      "Failed to fetch car details";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
