"use client";

import { Vehicle } from "@/types/car";
import CarsList from "./cars-list";
import { useState } from "react";

interface Props {
  vehicles: Vehicle[];
}

export default function CarsStateWrapper({ vehicles }: Props) {
  const [sortBy, setSortBy] = useState<"price" | "vendor" | "category">("price");
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterTransmission, setFilterTransmission] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000,
  });

  // Apply filters
  const filteredVehicles = vehicles.filter((vehicle) => {
    // Filter by category
    if (filterCategory.length > 0 && !filterCategory.includes(vehicle.specifications.category)) {
      return false;
    }

    // Filter by transmission
    if (
      filterTransmission.length > 0 &&
      !filterTransmission.includes(vehicle.specifications.transmission)
    ) {
      return false;
    }

    // Filter by price
    const dailyRate = vehicle.price.dailyRate;
    if (dailyRate < priceRange.min || dailyRate > priceRange.max) {
      return false;
    }

    return true;
  });

  // Sort vehicles
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (sortBy === "price") {
      return a.price.amount - b.price.amount;
    } else if (sortBy === "vendor") {
      return a.vendor.name.localeCompare(b.vendor.name);
    } else {
      return a.specifications.category.localeCompare(b.specifications.category);
    }
  });

  const categories = ["ECONOMY", "COMPACT", "INTERMEDIATE", "STANDARD", "FULL_SIZE", "LUXURY", "SUV", "VAN"];

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
                <option value="vendor">Vendor (A-Z)</option>
                <option value="category">Category</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Vehicle Category</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterCategory.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterCategory([...filterCategory, category]);
                        } else {
                          setFilterCategory(filterCategory.filter((c) => c !== category));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Transmission Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Transmission</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filterTransmission.includes("AUTOMATIC")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilterTransmission([...filterTransmission, "AUTOMATIC"]);
                      } else {
                        setFilterTransmission(filterTransmission.filter((t) => t !== "AUTOMATIC"));
                      }
                    }}
                    className="mr-2"
                  />
                  <span>Automatic</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filterTransmission.includes("MANUAL")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilterTransmission([...filterTransmission, "MANUAL"]);
                      } else {
                        setFilterTransmission(filterTransmission.filter((t) => t !== "MANUAL"));
                      }
                    }}
                    className="mr-2"
                  />
                  <span>Manual</span>
                </label>
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Daily Rate Range</label>
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
                setFilterCategory([]);
                setFilterTransmission([]);
                setPriceRange({ min: 0, max: 1000 });
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Cars List */}
        <main className="lg:w-3/4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">
              {sortedVehicles.length} {sortedVehicles.length === 1 ? "Vehicle" : "Vehicles"} Found
            </h1>
          </div>
          <CarsList vehicles={sortedVehicles} />
        </main>
      </div>
    </div>
  );
}
