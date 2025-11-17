"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Calendar, Users, Plus, Minus, X, Check } from "lucide-react";

// Common city destinations with IATA codes
const POPULAR_DESTINATIONS = [
  { name: "Paris", code: "PAR", country: "France" },
  { name: "London", code: "LON", country: "United Kingdom" },
  { name: "New York", code: "NYC", country: "United States" },
  { name: "Dubai", code: "DXB", country: "United Arab Emirates" },
  { name: "Tokyo", code: "TYO", country: "Japan" },
  { name: "Barcelona", code: "BCN", country: "Spain" },
  { name: "Rome", code: "ROM", country: "Italy" },
  { name: "Istanbul", code: "IST", country: "Turkey" },
  { name: "Bangkok", code: "BKK", country: "Thailand" },
  { name: "Singapore", code: "SIN", country: "Singapore" },
  { name: "Amsterdam", code: "AMS", country: "Netherlands" },
  { name: "Madrid", code: "MAD", country: "Spain" },
];

export default function HotelSearchForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const guestsDropdownRef = useRef<HTMLDivElement>(null);

  // Form state
  const [location, setLocation] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  // UI state
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showGuestsPicker, setShowGuestsPicker] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  // Filter location suggestions based on input
  const locationSuggestions = useMemo(() => {
    if (!location || location.length < 1) return POPULAR_DESTINATIONS;

    const searchTerm = location.toLowerCase();
    return POPULAR_DESTINATIONS.filter(
      dest =>
        dest.name.toLowerCase().includes(searchTerm) ||
        dest.code.toLowerCase().includes(searchTerm) ||
        dest.country.toLowerCase().includes(searchTerm)
    );
  }, [location]);

  // Calculate number of nights
  const numberOfNights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [checkInDate, checkOutDate]);

  // Calculate total guests
  const totalGuests = adults + children;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
      if (guestsDropdownRef.current && !guestsDropdownRef.current.contains(event.target as Node)) {
        setShowGuestsPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationSelect = (dest: typeof POPULAR_DESTINATIONS[0]) => {
    setLocation(dest.name);
    setCityCode(dest.code);
    setShowLocationSuggestions(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkInDate || !checkOutDate) {
      alert("Please select check-in and check-out dates");
      return;
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      alert("Check-out date must be after check-in date");
      return;
    }

    if (!cityCode) {
      alert("Please select a destination from the suggestions");
      return;
    }

    setIsLoading(true);

    // Build query parameters
    const params = new URLSearchParams();
    params.append("cityCode", cityCode);
    params.append("location", location);
    params.append("checkInDate", checkInDate);
    params.append("checkOutDate", checkOutDate);
    params.append("adults", adults.toString());
    if (children > 0) params.append("children", children.toString());
    params.append("rooms", rooms.toString());

    // Navigate to search results
    router.push(`/hotels?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8 shadow-lg">
        <form onSubmit={handleSearch} className="space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Hotel</h1>
            <p className="text-gray-600">Search from over 150,000 hotels worldwide</p>
          </div>

          {/* Main Search Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location with Autocomplete */}
            <div className="relative" ref={locationInputRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Where are you going?
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="City or destination"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setShowLocationSuggestions(true);
                  }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  required
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {cityCode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>

              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
                      {location ? "Matching Destinations" : "Popular Destinations"}
                    </div>
                    {locationSuggestions.map((dest) => (
                      <button
                        key={dest.code}
                        type="button"
                        onClick={() => handleLocationSelect(dest)}
                        className="w-full text-left px-3 py-3 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-900">{dest.name}</div>
                            <div className="text-xs text-gray-500">{dest.country}</div>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-gray-400 group-hover:text-blue-600">
                          {dest.code}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Guests & Rooms Picker */}
            <div className="relative" ref={guestsDropdownRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Guests & Rooms
              </label>
              <button
                type="button"
                onClick={() => setShowGuestsPicker(!showGuestsPicker)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-left hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <span className="text-gray-900">
                  {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}, {rooms} {rooms === 1 ? "Room" : "Rooms"}
                </span>
              </button>

              {/* Guests Picker Dropdown */}
              {showGuestsPicker && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4">
                  <div className="space-y-4">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Adults</div>
                        <div className="text-xs text-gray-500">Ages 18+</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          disabled={adults <= 1}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults(Math.min(10, adults + 1))}
                          disabled={adults >= 10}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Children</div>
                        <div className="text-xs text-gray-500">Ages 0-17</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          disabled={children <= 0}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren(Math.min(10, children + 1))}
                          disabled={children >= 10}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Rooms */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Rooms</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setRooms(Math.max(1, rooms - 1))}
                          disabled={rooms <= 1}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{rooms}</span>
                        <button
                          type="button"
                          onClick={() => setRooms(Math.min(10, rooms + 1))}
                          disabled={rooms >= 10}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Done Button */}
                    <button
                      type="button"
                      onClick={() => setShowGuestsPicker(false)}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Check-in
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                min={today}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Check-out
                {numberOfNights > 0 && (
                  <span className="ml-2 text-xs text-blue-600 font-normal">
                    ({numberOfNights} {numberOfNights === 1 ? "night" : "nights"})
                  </span>
                )}
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate || tomorrowStr}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Searching Hotels...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Search Hotels
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Popular Destinations Quick Links */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Popular destinations</h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_DESTINATIONS.slice(0, 6).map((dest) => (
            <button
              key={dest.code}
              type="button"
              onClick={() => {
                setLocation(dest.name);
                setCityCode(dest.code);
              }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              {dest.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
