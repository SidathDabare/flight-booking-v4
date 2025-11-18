"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FlightSearch from "../flight-search-main/flight-search";
import HotelSearch from "../hotel-search-main/hotel-search";
import { Plane, Hotel } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ClientCarousel } from "../ClientCarousel";

interface UnifiedSearchProps {
  onCarouselLoadingChange?: (loading: boolean) => void;
}

export default function UnifiedSearch({ onCarouselLoadingChange }: UnifiedSearchProps) {
  const t = useTranslations("unifiedSearch");
  const [activeTab, setActiveTab] = useState("flights");

  return (
    <div className="w-full relative h-screen min:h-screen mt-[-50px]">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <ClientCarousel onLoadingChange={onCarouselLoadingChange} />
      </div>

      {/* Dark Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-l from-gray-900/10 to-gray-900/0 z-0 pointer-events-none" />

      <section className="relative z-20 bg-transparent top-20 lg:top-1/3">
        <div className="relative flex h-full w-full max-w-full flex-col items-start justify-center gap-4 sm:gap-6 px-2 sm:px-6 mx-auto py-4 sm:py-6 lg:py-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Tabs Header */}
            <TabsList className="inline-flex h-12 items-center justify-start bg-white/90 backdrop-blur-sm rounded-t-md border-b-2 border-gray-300/30 p-0 mb-0 w-full lg:w-1/2 shadow-sm">
              <TabsTrigger
                value="flights"
                className="flex items-center gap-2 px-6 py-3 text-base font-medium rounded-tl-md border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-white data-[state=active]:shadow-none bg-transparent hover:bg-white/50 transition-all text-gray-700"
              >
                <Plane className="h-5 w-5" />
                <span>{t("flights")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="hotels"
                className="flex items-center gap-2 px-6 py-3 text-base font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-white data-[state=active]:shadow-none bg-transparent hover:bg-white/50 transition-all text-gray-700"
              >
                <Hotel className="h-5 w-5" />
                <span>{t("hotels")}</span>
              </TabsTrigger>
            </TabsList>

            {/* Tabs Content */}
            <TabsContent value="flights" className="mt-0">
              <div className="w-full mx-auto">
                <FlightSearch onCarouselLoadingChange={() => {}} />
              </div>
            </TabsContent>

            <TabsContent value="hotels" className="mt-0">
              <div className="w-full mx-auto">
                <HotelSearch onCarouselLoadingChange={() => {}} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
