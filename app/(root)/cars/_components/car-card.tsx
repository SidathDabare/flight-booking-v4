"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Vehicle } from "@/types/car";
import { useRouter } from "next/navigation";
import { Users, Briefcase, Fuel, Settings, DollarSign, CheckCircle } from "lucide-react";
import useCarStore from "@/lib/store/use-car-store";
import Image from "next/image";

interface Props {
  vehicle: Vehicle;
}

export default function CarCard({ vehicle }: Props) {
  const router = useRouter();
  const setSelectedVehicle = useCarStore((state) => state.setSelectedVehicle);

  const { specifications, vendor, price } = vehicle;

  const handleSelectCar = () => {
    setSelectedVehicle(vehicle);
    router.push(`/cars/${vehicle.vehicleId}`);
  };

  // Get first image or placeholder
  const carImage = vehicle.images?.[0] || "/placeholder-car.jpg";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col md:flex-row">
        {/* Car Image */}
        <div className="relative md:w-1/3 h-48 md:h-auto">
          <Image
            src={carImage}
            alt={`${specifications.make} ${specifications.model}`}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-car.jpg";
            }}
          />
          {specifications.category && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
              {specifications.category}
            </div>
          )}
          {vehicle.vendor.logo && (
            <div className="absolute bottom-2 right-2 bg-white p-1 rounded shadow">
              <img
                src={vehicle.vendor.logo}
                alt={vehicle.vendor.name}
                className="h-6 w-auto"
              />
            </div>
          )}
        </div>

        {/* Car Details */}
        <div className="flex-1 p-4 md:p-6">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {specifications.make} {specifications.model}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="font-medium">{vendor.name}</span>
                    {vendor.rating && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{vendor.rating}/5 ⭐</span>
                      </>
                    )}
                  </div>
                </div>

                {specifications.unlimitedMileage && (
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Unlimited Mileage
                  </div>
                )}
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{specifications.seating} Seats</span>
                </div>
                <div className="flex items-center text-sm">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                  <span>
                    {specifications.luggage.large}L + {specifications.luggage.small}S
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Settings className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{specifications.transmission}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Fuel className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{specifications.fuelType}</span>
                </div>
              </div>

              {/* Features */}
              {specifications.features && specifications.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {specifications.features.slice(0, 4).map((feature, index) => (
                    <div
                      key={index}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {feature}
                    </div>
                  ))}
                  {specifications.features.length > 4 && (
                    <span className="text-xs text-gray-500">
                      +{specifications.features.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Additional Info */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {specifications.doors && <span>{specifications.doors} Doors</span>}
                {specifications.airConditioning && (
                  <>
                    <span>•</span>
                    <span>Air Conditioning</span>
                  </>
                )}
                {specifications.year && (
                  <>
                    <span>•</span>
                    <span>{specifications.year}</span>
                  </>
                )}
              </div>
            </div>

            {/* Footer: Price and Button */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Total ({price.totalDays} days)</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-blue-600">
                    {price.currency} {price.amount.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({price.currency} {price.dailyRate.toFixed(2)}/day)
                  </span>
                </div>
                {price.taxes > 0 && (
                  <div className="text-xs text-gray-500">
                    +{price.currency} {price.taxes.toFixed(2)} taxes
                  </div>
                )}
              </div>

              <Button
                onClick={handleSelectCar}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
