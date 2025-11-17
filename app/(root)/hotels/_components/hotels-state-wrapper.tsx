"use client";

import { Hotel } from "@/types/hotel";
import HotelsList from "./hotels-list";
import { useState } from "react";

interface Props {
  hotels: Hotel[];
}

export default function HotelsStateWrapper({ hotels }: Props) {
  const [sortBy, setSortBy] = useState<"price" | "rating" | "name">("price");
  const [filterRating, setFilterRating] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 10000,
  });

  // Apply filters and sorting
  const filteredHotels = hotels.filter((hotel) => {
    // Filter by rating
    if (filterRating.length > 0 && !filterRating.includes(hotel.rating)) {
      return false;
    }

    // Filter by price (if rooms are available)
    if (hotel.rooms && hotel.rooms.length > 0) {
      const minPrice = Math.min(...hotel.rooms.map((r) => r.price.amount));
      if (minPrice < priceRange.min || minPrice > priceRange.max) {
        return false;
      }
    }

    return true;
  });

  // Sort hotels
  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (sortBy === "price") {
      const aPrice = a.rooms?.[0]?.price.amount || 0;
      const bPrice = b.rooms?.[0]?.price.amount || 0;
      return aPrice - bPrice;
    } else if (sortBy === "rating") {
      return b.rating - a.rating;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:w-1/4">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <h2 className="text-xl font-bold mb-4">Filters</h2>

            {/* Sort By */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="price">Price (Low to High)</option>
                <option value="rating">Rating (High to Low)</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            {/* Star Rating Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Star Rating</label>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterRating.includes(rating)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterRating([...filterRating, rating]);
                        } else {
                          setFilterRating(filterRating.filter((r) => r !== rating));
                        }
                      }}
                      className="mr-2"
                    />
                    <span>{rating} Stars</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: Number(e.target.value) })
                  }
                  className="w-1/2 px-3 py-2 border rounded-md"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: Number(e.target.value) })
                  }
                  className="w-1/2 px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setFilterRating([]);
                setPriceRange({ min: 0, max: 10000 });
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Hotels List */}
        <main className="lg:w-3/4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">
              {sortedHotels.length} {sortedHotels.length === 1 ? "Hotel" : "Hotels"} Found
            </h1>
          </div>
          <HotelsList hotels={sortedHotels} />
        </main>
      </div>
    </div>
  );
}
