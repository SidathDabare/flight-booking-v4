"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LoadingScreen from "@/components/ui/loading-screen";
import ErrorPage from "@/components/error-page";
import { Hotel } from "@/types/hotel";
import HotelsStateWrapper from "./hotels-state-wrapper";
import HotelSearchForm from "./hotel-search-form";

interface HotelsData {
  hotels: Hotel[] | null;
  error: string | null;
  isLoading: boolean;
}

export default function HotelsLoader() {
  const searchParams = useSearchParams();
  const [hotelsData, setHotelsData] = useState<HotelsData>({
    hotels: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const loadHotels = async () => {
      try {
        setHotelsData((prev) => ({ ...prev, isLoading: true }));

        // Convert URLSearchParams to plain object
        const params: { [key: string]: string } = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Check if we have required params
        if (!params.checkInDate || !params.checkOutDate) {
          setHotelsData({
            hotels: null,
            error: "Please provide check-in and check-out dates",
            isLoading: false,
          });
          return;
        }

        // Fetch hotels data from API
        const response = await fetch("/api/hotel-search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cityCode: params.cityCode,
            location: params.location,
            checkInDate: params.checkInDate,
            checkOutDate: params.checkOutDate,
            adults: parseInt(params.adults || "1"),
            children: parseInt(params.children || "0"),
            rooms: parseInt(params.rooms || "1"),
            currency: params.currency || "USD",
            minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
            maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
            rating: params.rating ? params.rating.split(",").map(Number) : undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to search hotels");
        }

        const result = await response.json();

        setHotelsData({
          hotels: result.data || [],
          error: null,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error loading hotels:", error);
        setHotelsData({
          hotels: null,
          error: error instanceof Error ? error.message : "An unexpected error occurred",
          isLoading: false,
        });
      }
    };

    // Only load hotels if we have search parameters
    if (searchParams.toString()) {
      loadHotels();
    } else {
      setHotelsData({
        hotels: null,
        error: null,
        isLoading: false,
      });
    }
  }, [searchParams]);

  // If no search parameters, show search form
  if (!searchParams.toString()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <HotelSearchForm />
      </div>
    );
  }

  // Show loading screen while data is being fetched
  if (hotelsData.isLoading) {
    return <LoadingScreen />;
  }

  // Show error page if there's an error
  if (hotelsData.error) {
    return <ErrorPage message={hotelsData.error} />;
  }

  // Show results
  return <HotelsStateWrapper hotels={hotelsData.hotels || []} />;
}
