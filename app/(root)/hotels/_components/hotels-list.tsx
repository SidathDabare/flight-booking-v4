"use client";

import { Hotel } from "@/types/hotel";
import HotelCard from "./hotel-card";

interface Props {
  hotels: Hotel[];
}

export default function HotelsList({ hotels }: Props) {
  if (hotels.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Hotels Found</h2>
        <p className="text-gray-600">
          Try adjusting your search criteria or filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hotels.map((hotel) => (
        <HotelCard key={hotel.hotelId} hotel={hotel} />
      ))}
    </div>
  );
}
