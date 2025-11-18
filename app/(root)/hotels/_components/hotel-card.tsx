"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Wifi, Coffee, Car, Dumbbell, Waves, UtensilsCrossed } from "lucide-react";
import { useHotelStore } from "@/lib/store/use-hotel-store";
import { useRouter } from "next/navigation";
import { calculateNights } from "@/lib/zod/hotel-search";
import { useTranslations } from "next-intl";

interface HotelCardProps {
  hotel: any;
  searchCriteria: any;
}

export default function HotelCard({ hotel, searchCriteria }: HotelCardProps) {
  const t = useTranslations("hotelCard");
  const router = useRouter();
  const { setSelectedHotel, setSearchCriteria } = useHotelStore();

  const hotelData = hotel.hotel || {};
  const offer = hotel.offers?.[0] || {};
  const room = offer.room || {};
  const price = offer.price || {};

  const hotelName = hotelData.name || t("unknownHotel");
  const cityCode = hotelData.cityCode || "";
  const totalPrice = price.total ? parseFloat(price.total) : 0;
  const currency = price.currency || "USD";
  const checkInDate = offer.checkInDate || searchCriteria?.checkInDate || "";
  const checkOutDate = offer.checkOutDate || searchCriteria?.checkOutDate || "";

  const nights = checkInDate && checkOutDate ? calculateNights(checkInDate, checkOutDate) : 1;
  const pricePerNight = nights > 0 ? totalPrice / nights : totalPrice;

  const roomType = room.typeEstimated?.category || room.type || t("standardRoom");
  const bedInfo = room.typeEstimated?.beds
    ? `${room.typeEstimated.beds} ${room.typeEstimated.bedType || "bed"}(s)`
    : "";

  // Sample amenities (in real implementation, these would come from hotel details)
  const sampleAmenities = [
    { icon: Wifi, label: "Free WiFi" },
    { icon: Coffee, label: "Breakfast" },
    { icon: Car, label: "Parking" },
    { icon: Waves, label: "Pool" },
  ];

  const handleSelectHotel = () => {
    setSelectedHotel(hotel);
    setSearchCriteria({
      cityCode: cityCode,
      checkInDate,
      checkOutDate,
      adults: searchCriteria?.adults || 2,
      children: searchCriteria?.children || 0,
      rooms: searchCriteria?.rooms || 1,
      currency,
    });

    // Navigate to hotel details page (to be created)
    router.push(`/hotel-details?hotelId=${hotelData.hotelId}&offerId=${offer.id}`);
  };

  return (
    <Card className="rounded-none hover:shadow-lg transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Hotel Image Placeholder */}
        <div className="md:col-span-1 bg-gradient-to-br from-blue-100 to-blue-200 h-48 md:h-auto flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-6xl mb-2">🏨</div>
            <p className="text-sm text-muted-foreground">{t("imageNotAvailable")}</p>
          </div>
        </div>

        {/* Hotel Details */}
        <div className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{hotelName}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{cityCode}</span>
                </div>
                {/* Star rating placeholder */}
                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-3 space-y-3">
            {/* Room Info */}
            <div>
              <Badge variant="secondary" className="rounded-none">
                {roomType}
              </Badge>
              {bedInfo && (
                <span className="text-sm text-muted-foreground ml-2">{bedInfo}</span>
              )}
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-3">
              {sampleAmenities.slice(0, 4).map((amenity, index) => (
                <div key={index} className="flex items-center gap-1 text-sm text-muted-foreground">
                  <amenity.icon className="h-4 w-4 text-blue-500" />
                  <span>{amenity.label}</span>
                </div>
              ))}
            </div>

            {/* Cancellation Policy */}
            {offer.policies?.cancellation && (
              <div className="text-xs text-green-600">
                ✓ {offer.policies.cancellation.type === "FULL_REFUND" ? t("freeCancellation") : t("cancellationPolicy")}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex items-center justify-between pt-3 border-t">
            <div>
              <div className="text-2xl font-bold text-red-600">
                {currency} ${totalPrice.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                ${pricePerNight.toFixed(2)} {t("perNight")} • {nights} {nights === 1 ? t("night") : t("nights")}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {t("includes")} {searchCriteria?.adults || 1} {t("adults")}
                {searchCriteria?.children > 0 && `, ${searchCriteria.children} ${t("children")}`}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/hotel-details?hotelId=${hotelData.hotelId}&offerId=${offer.id}`)}
                className="rounded-none"
              >
                {t("viewDetails")}
              </Button>
              <Button
                onClick={handleSelectHotel}
                className="bg-red-600 hover:bg-red-700 rounded-none"
              >
                {t("select")}
              </Button>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
