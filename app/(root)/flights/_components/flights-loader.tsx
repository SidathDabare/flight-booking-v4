"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LoadingScreen from "@/components/ui/loading-screen";
import StateWrapper from "./state-wrapper";
import ErrorPage from "@/components/error-page";
import getFlights from "@/lib/actions/get-flights";
import parseSearchParams from "../_utils/parse-search-params";
import { FlightOffer } from "amadeus-ts";
import { useTranslations } from "next-intl";

interface FlightsData {
  flights: FlightOffer[] | null;
  error: string | null;
  isLoading: boolean;
}

export default function FlightsLoader() {
  const t = useTranslations("flights");
  const searchParams = useSearchParams();
  const [flightsData, setFlightsData] = useState<FlightsData>({
    flights: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const loadFlights = async () => {
      try {
        // Check if we came from a search (loading state from sessionStorage)
        const wasSearching = sessionStorage.getItem('flight-search-loading') === 'true';
        
        if (wasSearching) {
          // Clear the loading flag
          sessionStorage.removeItem('flight-search-loading');
        }

        setFlightsData(prev => ({ ...prev, isLoading: true }));

        // Convert URLSearchParams to plain object
        const params: { [key: string]: string | string[] | undefined } = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Parse search parameters
        const { error: parsingError, parsedParams } = parseSearchParams(params);
        
        if (parsingError) {
          setFlightsData({
            flights: null,
            error: parsingError.issues[0].message,
            isLoading: false,
          });
          return;
        }

        // Fetch flights data
        const { data, error: getFlightsError } = await getFlights(parsedParams);
        
        if (getFlightsError) {
          setFlightsData({
            flights: null,
            error: getFlightsError.message,
            isLoading: false,
          });
          return;
        }

        setFlightsData({
          flights: data,
          error: null,
          isLoading: false,
        });

      } catch (error) {
        console.error('Error loading flights:', error);
        setFlightsData({
          flights: null,
          error: t("loader.error.unexpected"),
          isLoading: false,
        });
      }
    };

    // Only load flights if we have search parameters
    if (searchParams.toString()) {
      loadFlights();
    } else {
      setFlightsData({
        flights: null,
        error: t("loader.error.noParams"),
        isLoading: false,
      });
    }
  }, [searchParams]);

  // Show loading screen while data is being fetched
  if (flightsData.isLoading) {
    return <LoadingScreen />;
  }

  // Show error if something went wrong
  if (flightsData.error) {
    return <ErrorPage message={flightsData.error} />;
  }

  // Show flights if we have data
  if (flightsData.flights) {
    return (
      <main className="mb-4 px-1 md:px-4">
        <StateWrapper flights={flightsData.flights} />
      </main>
    );
  }

  // Fallback state
  return <ErrorPage message={t("loader.error.noData")} />;
}