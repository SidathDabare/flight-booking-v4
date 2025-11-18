"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

interface SidebarFilterProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minPrice: number;
  maxPrice: number;
  selectedRatings: number[];
  setSelectedRatings: (ratings: number[]) => void;
  selectedAmenities: string[];
  setSelectedAmenities: (amenities: string[]) => void;
  sortBy: "price" | "rating" | "name";
  setSortBy: (sort: "price" | "rating" | "name") => void;
  totalHotels: number;
}

export default function SidebarFilter({
  priceRange,
  setPriceRange,
  minPrice,
  maxPrice,
  selectedRatings,
  setSelectedRatings,
  selectedAmenities,
  setSelectedAmenities,
  sortBy,
  setSortBy,
  totalHotels,
}: SidebarFilterProps) {
  const t = useTranslations("hotelFilters");

  const handleRatingToggle = (rating: number) => {
    if (selectedRatings.includes(rating)) {
      setSelectedRatings(selectedRatings.filter((r) => r !== rating));
    } else {
      setSelectedRatings([...selectedRatings, rating]);
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const commonAmenities = [
    { value: "wifi", label: t("freeWifi") },
    { value: "breakfast", label: t("breakfast") },
    { value: "parking", label: t("parking") },
    { value: "pool", label: t("pool") },
    { value: "gym", label: t("gym") },
    { value: "spa", label: t("spa") },
    { value: "restaurant", label: t("restaurant") },
    { value: "ac", label: t("airConditioning") },
  ];

  return (
    <div className="space-y-4 sticky top-4">
      {/* Sort By */}
      <Card className="rounded-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("sortBy")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="price">{t("priceLowest")}</SelectItem>
              <SelectItem value="rating">{t("rating")}</SelectItem>
              <SelectItem value="name">{t("name")}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card className="rounded-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("pricePerNight")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            min={minPrice}
            max={maxPrice}
            step={10}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">${priceRange[0]}</span>
            <span className="text-muted-foreground">-</span>
            <span className="font-medium">${priceRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Star Rating */}
      <Card className="rounded-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("starRating")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={selectedRatings.includes(rating)}
                onCheckedChange={() => handleRatingToggle(rating)}
                className="border-2 border-blue-400 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <Label
                htmlFor={`rating-${rating}`}
                className="flex items-center gap-1 cursor-pointer text-sm font-normal"
              >
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                {rating === 5 && <span className="ml-1 text-muted-foreground">(Luxury)</span>}
                {rating === 4 && <span className="ml-1 text-muted-foreground">(Superior)</span>}
                {rating === 3 && <span className="ml-1 text-muted-foreground">(Comfort)</span>}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card className="rounded-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("amenities")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {commonAmenities.map((amenity) => (
            <div key={amenity.value} className="flex items-center space-x-2">
              <Checkbox
                id={`amenity-${amenity.value}`}
                checked={selectedAmenities.includes(amenity.value)}
                onCheckedChange={() => handleAmenityToggle(amenity.value)}
                className="border-2 border-blue-400 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <Label
                htmlFor={`amenity-${amenity.value}`}
                className="cursor-pointer text-sm font-normal"
              >
                {amenity.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="text-sm text-center text-muted-foreground p-4 bg-muted/30 rounded-none">
        {totalHotels} {totalHotels === 1 ? t("hotelFound") : t("hotelsFound")}
      </div>
    </div>
  );
}
