"use client";

import { useState, useMemo } from "react";
import HotelsList from "./hotels-list";
import SidebarFilter from "./sidebar-filter";
import { useTranslations } from "next-intl";
import { calculateNights } from "@/lib/zod/hotel-search";

interface HotelsStateWrapperProps {
  hotels: any[];
  searchCriteria: any;
}

export default function HotelsStateWrapper({ hotels, searchCriteria }: HotelsStateWrapperProps) {
  const t = useTranslations("hotelResults");

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"price" | "rating" | "name">("price");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const hotelsPerPage = 5;

  // Calculate nights for display
  const nights = searchCriteria
    ? calculateNights(searchCriteria.checkInDate, searchCriteria.checkOutDate)
    : 1;

  // Filter and sort hotels
  const filteredHotels = useMemo(() => {
    let filtered = [...hotels];

    // Filter by price range
    filtered = filtered.filter((hotel) => {
      if (!hotel.offers || hotel.offers.length === 0) return false;

      const totalPrice = parseFloat(hotel.offers[0].price.total);
      return totalPrice >= priceRange[0] && totalPrice <= priceRange[1];
    });

    // Filter by ratings (if we have rating data)
    if (selectedRatings.length > 0) {
      filtered = filtered.filter((hotel) => {
        // Note: Amadeus API doesn't always include ratings in the hotel search response
        // You would need to call the hotel ratings API separately
        // For now, we'll skip this filter if no rating is available
        return true;
      });
    }

    // Filter by amenities
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter((hotel) => {
        // Note: Amenities filtering would require additional hotel details
        // For now, we'll return all hotels
        return true;
      });
    }

    // Sort hotels
    filtered.sort((a, b) => {
      if (sortBy === "price") {
        const priceA = a.offers?.[0]?.price?.total ? parseFloat(a.offers[0].price.total) : 0;
        const priceB = b.offers?.[0]?.price?.total ? parseFloat(b.offers[0].price.total) : 0;
        return priceA - priceB;
      } else if (sortBy === "name") {
        return (a.hotel?.name || "").localeCompare(b.hotel?.name || "");
      }
      return 0;
    });

    return filtered;
  }, [hotels, priceRange, selectedRatings, selectedAmenities, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredHotels.length / hotelsPerPage);
  const startIndex = (currentPage - 1) * hotelsPerPage;
  const endIndex = startIndex + hotelsPerPage;
  const currentHotels = filteredHotels.slice(startIndex, endIndex);

  // Calculate price range from all hotels
  const minPrice = useMemo(() => {
    const prices = hotels
      .filter((h) => h.offers && h.offers.length > 0)
      .map((h) => parseFloat(h.offers[0].price.total));
    return prices.length > 0 ? Math.floor(Math.min(...prices)) : 0;
  }, [hotels]);

  const maxPrice = useMemo(() => {
    const prices = hotels
      .filter((h) => h.offers && h.offers.length > 0)
      .map((h) => parseFloat(h.offers[0].price.total));
    return prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
  }, [hotels]);

  // Reset price range when min/max changes
  useMemo(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Filter */}
      <aside className="lg:col-span-1">
        <SidebarFilter
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          minPrice={minPrice}
          maxPrice={maxPrice}
          selectedRatings={selectedRatings}
          setSelectedRatings={setSelectedRatings}
          selectedAmenities={selectedAmenities}
          setSelectedAmenities={setSelectedAmenities}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalHotels={filteredHotels.length}
        />
      </aside>

      {/* Hotels List */}
      <main className="lg:col-span-3">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">
            {t("availableHotels")} {searchCriteria?.cityCode && `in ${searchCriteria.cityCode}`}
          </h1>
          <p className="text-muted-foreground">
            {filteredHotels.length} {filteredHotels.length === 1 ? t("hotel") : t("hotels")} found •{" "}
            {searchCriteria?.checkInDate} to {searchCriteria?.checkOutDate} • {nights}{" "}
            {nights === 1 ? t("night") : t("nights")}
          </p>
        </div>

        <HotelsList
          hotels={currentHotels}
          searchCriteria={searchCriteria}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
    </div>
  );
}
