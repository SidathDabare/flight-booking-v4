"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Hotel } from "@/types/hotel";
import { useRouter } from "next/navigation";
import { MapPin, Star, Wifi, Car, Coffee, DollarSign } from "lucide-react";
import useHotelStore from "@/lib/store/use-hotel-store";
import Image from "next/image";

interface Props {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: Props) {
  const router = useRouter();
  const setSelectedHotel = useHotelStore((state) => state.setSelectedHotel);

  // Get the cheapest room price
  const cheapestRoom = hotel.rooms?.reduce((prev, current) =>
    prev.price.amount < current.price.amount ? prev : current
  );

  const pricePerNight = cheapestRoom?.price.nightlyRate || cheapestRoom?.price.amount || 0;
  const currency = cheapestRoom?.price.currency || "USD";

  // Get featured amenities (limit to 3)
  const featuredAmenities = hotel.amenities?.slice(0, 3) || [];

  const handleSelectHotel = () => {
    setSelectedHotel(hotel);
    router.push(`/hotels/${hotel.hotelId}`);
  };

  // Get first image or placeholder
  const hotelImage = hotel.images?.[0]?.url || "/placeholder-hotel.jpg";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col md:flex-row">
        {/* Hotel Image */}
        <div className="relative md:w-1/3 h-48 md:h-auto">
          <Image
            src={hotelImage}
            alt={hotel.name}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-hotel.jpg";
            }}
          />
          {hotel.chainCode && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
              {hotel.chainCode}
            </div>
          )}
        </div>

        {/* Hotel Details */}
        <div className="flex-1 p-4 md:p-6">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{hotel.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>
                      {hotel.location.address}, {hotel.location.city}
                    </span>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center bg-blue-100 px-2 py-1 rounded">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="font-semibold text-sm">{hotel.rating}</span>
                </div>
              </div>

              {/* Reviews */}
              {hotel.reviews && (
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <span className="font-medium">{hotel.reviews.rating.toFixed(1)}/5</span>
                  <span className="mx-2">•</span>
                  <span>{hotel.reviews.count} reviews</span>
                </div>
              )}

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mb-4">
                {featuredAmenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded"
                  >
                    {amenity.code === "WIFI" && <Wifi className="w-3 h-3 mr-1" />}
                    {amenity.code === "PARKING" && <Car className="w-3 h-3 mr-1" />}
                    {amenity.code === "BREAKFAST" && <Coffee className="w-3 h-3 mr-1" />}
                    <span>{amenity.name}</span>
                  </div>
                ))}
                {hotel.amenities && hotel.amenities.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{hotel.amenities.length - 3} more
                  </span>
                )}
              </div>

              {/* Room Info */}
              {cheapestRoom && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">From:</span> {cheapestRoom.name}
                  {cheapestRoom.bedType && ` • ${cheapestRoom.bedType}`}
                </div>
              )}
            </div>

            {/* Footer: Price and Button */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Starting from</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-blue-600">
                    {currency} {pricePerNight.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-600 ml-1">/ night</span>
                </div>
              </div>

              <Button
                onClick={handleSelectHotel}
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
