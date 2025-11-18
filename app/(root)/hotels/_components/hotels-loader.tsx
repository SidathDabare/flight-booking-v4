"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { hotelSearchSchema } from "@/lib/zod/hotel-search";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import HotelsStateWrapper from "./hotels-state-wrapper";
import Link from "next/link";

export default function HotelsLoader() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchCriteria, setSearchCriteria] = useState<any>(null);

  useEffect(() => {
    const loadHotels = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Parse search parameters
        const cityCode = searchParams.get("cityCode");
        const latitude = searchParams.get("latitude");
        const longitude = searchParams.get("longitude");
        const checkInDate = searchParams.get("checkInDate");
        const checkOutDate = searchParams.get("checkOutDate");

        const params = {
          ...(cityCode && { cityCode }),
          ...(latitude && { latitude: parseFloat(latitude) }),
          ...(longitude && { longitude: parseFloat(longitude) }),
          checkInDate: checkInDate || "",
          checkOutDate: checkOutDate || "",
          adults: searchParams.get("adults") ? parseInt(searchParams.get("adults")!) : 2,
          children: searchParams.get("children") ? parseInt(searchParams.get("children")!) : 0,
          rooms: searchParams.get("rooms") ? parseInt(searchParams.get("rooms")!) : 1,
          currency: searchParams.get("currency") || "USD",
          max: searchParams.get("max") ? parseInt(searchParams.get("max")!) : 20,
        };

        // Validate parameters
        const validation = hotelSearchSchema.safeParse(params);
        if (!validation.success) {
          const firstError = validation.error.errors[0];
          const errorMessage = firstError?.message || "Invalid search parameters. Please try searching again.";
          setError(errorMessage);
          setIsLoading(false);
          return;
        }

        setSearchCriteria(params);

        // Build query string
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
          }
        });

        // Fetch hotels
        const response = await fetch(`/api/hotel-search?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch hotels");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to load hotels");
        }

        setHotels(data.data || []);

        if (data.warning) {
          console.warn("Hotel search warning:", data.warning);
        }

      } catch (err: any) {
        console.error("Error loading hotels:", err);
        setError(err.message || "An unexpected error occurred while loading hotels");
      } finally {
        setIsLoading(false);
      }
    };

    loadHotels();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent mb-4"></div>
          <p className="text-lg text-muted-foreground">Searching for hotels...</p>
          {searchCriteria && (
            <p className="text-sm text-muted-foreground mt-2">
              {searchCriteria.cityCode} • {searchCriteria.checkInDate} to {searchCriteria.checkOutDate}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Return to search
          </Link>
        </div>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Hotels Found</AlertTitle>
          <AlertDescription>
            We couldn&apos;t find any hotels matching your search criteria. Try adjusting your search parameters.
          </AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Return to search
          </Link>
        </div>
      </div>
    );
  }

  return <HotelsStateWrapper hotels={hotels} searchCriteria={searchCriteria} />;
}
