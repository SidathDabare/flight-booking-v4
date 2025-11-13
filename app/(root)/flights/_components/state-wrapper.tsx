"use client";

import { useState, useEffect, useCallback } from "react";
import SidebarFilter from "./sidebar-filter";
import FlightsList from "./flights-list";
import { FlightOffer } from "amadeus-ts";
import { SidebarProvider } from "@/components/ui/sidebar";
import ModernFlightSearch from "@/components/backup/flights-hr-page/modern-flight-search";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import SearchHr from "@/components/custom ui/flights-hr-main-page/search-hr";
import { useTranslations } from "next-intl";

type Filters = {
  stops: string;
  airline: string;
  maxPrice: number;
};

interface Props {
  flights: FlightOffer[];
}

export default function StateWrapper({ flights }: Props) {
  const t = useTranslations("flights");
  const [filteredFlights, setFilteredFlights] =
    useState<FlightOffer[]>(flights);
  const [filters, setFilters] = useState<Filters>({
    stops: "any",
    airline: "any",
    maxPrice: 0,
  });
  const [maxPrice, setMaxPrice] = useState(0);
  const [displaySearch, setDisplaySearch] = useState(false);

  useEffect(() => {
    const prices = flights.map((offer) => parseFloat(offer.price.total));
    setMaxPrice(Math.max(...prices));
    setFilters((prev) => ({ ...prev, maxPrice: Math.max(...prices) }));
  }, [flights]);

  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to the first page when filters change
  };

  const applyFilters = useCallback(() => {
    const filtered = flights.filter((flight) => {
      const flightPrice = parseFloat(flight.price?.total || "0");
      if (flightPrice > filters.maxPrice) return false;

      const stopCount = (flight.itineraries?.[0]?.segments.length || 1) - 1;
      if (filters.stops !== "any") {
        if (filters.stops === "2+" && stopCount < 2) return false;
        if (filters.stops !== "2+" && stopCount.toString() !== filters.stops)
          return false;
      }

      const flightAirline = flight.validatingAirlineCodes?.[0];
      if (filters.airline !== "any" && flightAirline !== filters.airline)
        return false;

      return true;
    });

    setFilteredFlights(filtered);
  }, [flights, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const [currentPage, setCurrentPage] = useState(1);
  const flightsPerPage = 5;
  const totalPages = Math.ceil(filteredFlights.length / flightsPerPage);

  const paginatedFlights = filteredFlights.slice(
    (currentPage - 1) * flightsPerPage,
    currentPage * flightsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const airlines = [
    ...new Set(
      flights
        .map((flight) => flight.validatingAirlineCodes?.[0])
        .filter(Boolean)
    ),
  ] as string[];

  return (
    <SidebarProvider className="flex flex-col mt-[50px]">
      {/* Top Header with Search Controls */}
      <div className="container mx-auto mb-2">
        <div className="flex justify-end items-center">
          {!displaySearch ? (
            <Button
              className="flex items-center gap-2 border border-indigo-600 bg-green-600/0 hover:bg-blue-100/50 text-gray-600 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
              onClick={() => setDisplaySearch(true)}
            >
              <Search className="h-4 w-4" />
              {t("modifySearch")}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Search Panel */}
      {displaySearch && (
        <div className="mb-6 container mx-auto">
          <SearchHr
            onClose={() => setDisplaySearch(false)}
            initialExpanded={true}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto p-0 md:p-2 space-y-0 flex w-full lg:flex-row lg:justify-center">
        <SidebarFilter
          filters={filters}
          airlines={airlines}
          handleFilterChange={handleFilterChange}
          maxPrice={maxPrice}
        />

        <FlightsList
          flights={paginatedFlights}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </SidebarProvider>
  );
}
