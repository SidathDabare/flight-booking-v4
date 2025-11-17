"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LoadingScreen from "@/components/ui/loading-screen";
import ErrorPage from "@/components/error-page";
import { Vehicle } from "@/types/car";
import CarsStateWrapper from "./cars-state-wrapper";
import CarSearchForm from "./car-search-form";

interface CarsData {
  vehicles: Vehicle[] | null;
  error: string | null;
  isLoading: boolean;
}

export default function CarsLoader() {
  const searchParams = useSearchParams();
  const [carsData, setCarsData] = useState<CarsData>({
    vehicles: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const loadCars = async () => {
      try {
        setCarsData((prev) => ({ ...prev, isLoading: true }));

        // Convert URLSearchParams to plain object
        const params: { [key: string]: string } = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Check if we have required params
        if (!params.pickupLocation || !params.pickupDate || !params.dropoffDate) {
          setCarsData({
            vehicles: null,
            error: "Please provide pickup location, pickup date, and drop-off date",
            isLoading: false,
          });
          return;
        }

        // Fetch cars data from API
        const response = await fetch("/api/car-search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pickupLocation: params.pickupLocation,
            dropoffLocation: params.dropoffLocation || params.pickupLocation,
            pickupDate: params.pickupDate,
            dropoffDate: params.dropoffDate,
            driverAge: params.driverAge ? parseInt(params.driverAge) : 25,
            category: params.category,
            transmission: params.transmission,
            minSeating: params.minSeating ? parseInt(params.minSeating) : undefined,
            maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
            currency: params.currency || "USD",
            vendorCodes: params.vendorCodes ? params.vendorCodes.split(",") : undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to search cars");
        }

        const result = await response.json();

        setCarsData({
          vehicles: result.data || [],
          error: null,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error loading cars:", error);
        setCarsData({
          vehicles: null,
          error: error instanceof Error ? error.message : "An unexpected error occurred",
          isLoading: false,
        });
      }
    };

    // Only load cars if we have search parameters
    if (searchParams.toString()) {
      loadCars();
    } else {
      setCarsData({
        vehicles: null,
        error: null,
        isLoading: false,
      });
    }
  }, [searchParams]);

  // If no search parameters, show search form
  if (!searchParams.toString()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CarSearchForm />
      </div>
    );
  }

  // Show loading screen while data is being fetched
  if (carsData.isLoading) {
    return <LoadingScreen />;
  }

  // Show error page if there's an error
  if (carsData.error) {
    return <ErrorPage message={carsData.error} />;
  }

  // Show results
  return <CarsStateWrapper vehicles={carsData.vehicles || []} />;
}
