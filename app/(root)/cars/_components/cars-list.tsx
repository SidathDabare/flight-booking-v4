"use client";

import { Vehicle } from "@/types/car";
import CarCard from "./car-card";

interface Props {
  vehicles: Vehicle[];
}

export default function CarsList({ vehicles }: Props) {
  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Vehicles Found</h2>
        <p className="text-gray-600">
          Try adjusting your search criteria or filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vehicles.map((vehicle) => (
        <CarCard key={vehicle.vehicleId} vehicle={vehicle} />
      ))}
    </div>
  );
}
