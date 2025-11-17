"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Calendar, User } from "lucide-react";

export default function CarSearchForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [sameLocation, setSameLocation] = useState(true);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [dropoffDate, setDropoffDate] = useState("");
  const [dropoffTime, setDropoffTime] = useState("10:00");
  const [driverAge, setDriverAge] = useState(30);

  // Get today's date and time
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().slice(0, 5);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickupLocation) {
      alert("Please enter a pickup location");
      return;
    }

    if (!pickupDate || !dropoffDate) {
      alert("Please select pickup and dropoff dates");
      return;
    }

    const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`);
    const dropoffDateTime = new Date(`${dropoffDate}T${dropoffTime}`);

    if (pickupDateTime >= dropoffDateTime) {
      alert("Drop-off must be after pickup");
      return;
    }

    setIsLoading(true);

    // Build query parameters
    const params = new URLSearchParams();
    params.append("pickupLocation", pickupLocation);
    if (!sameLocation && dropoffLocation) {
      params.append("dropoffLocation", dropoffLocation);
    }
    params.append("pickupDate", `${pickupDate}T${pickupTime}:00`);
    params.append("dropoffDate", `${dropoffDate}T${dropoffTime}:00`);
    params.append("driverAge", driverAge.toString());

    // Navigate to search results
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSearch} className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Car Rentals</h2>
          <p className="text-gray-600">Find the perfect vehicle for your trip</p>
        </div>

        {/* Pickup Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Pickup Location
          </label>
          <input
            type="text"
            placeholder="Airport code or city (e.g., CDG, JFK, LAX)"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value.toUpperCase())}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Common codes: CDG (Paris), JFK (New York), LAX (Los Angeles), LHR (London)
          </p>
        </div>

        {/* Same Location Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="sameLocation"
            checked={sameLocation}
            onChange={(e) => setSameLocation(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="sameLocation" className="ml-2 text-sm text-gray-700">
            Return to same location
          </label>
        </div>

        {/* Dropoff Location (if different) */}
        {!sameLocation && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Drop-off Location
            </label>
            <input
              type="text"
              placeholder="Airport code or city"
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Pickup Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Pickup Date
            </label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={today}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Time
            </label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Dropoff Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Drop-off Date
            </label>
            <input
              type="date"
              value={dropoffDate}
              onChange={(e) => setDropoffDate(e.target.value)}
              min={pickupDate || today}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Drop-off Time
            </label>
            <input
              type="time"
              value={dropoffTime}
              onChange={(e) => setDropoffTime(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Driver Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Driver Age
          </label>
          <select
            value={driverAge}
            onChange={(e) => setDriverAge(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={18}>18-24 years</option>
            <option value={25}>25-29 years</option>
            <option value={30}>30-65 years</option>
            <option value={70}>65+ years</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Age may affect rental rates and availability
          </p>
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Search Car Rentals
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
