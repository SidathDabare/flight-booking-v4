"use client";

import React from "react";
import Image from "next/image";
import { Plane, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { AIRLINE_PARTNERS } from "../_data/airline-partners";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { useTranslations } from "next-intl";

/**
 * Premium carousel showcasing airline partners with responsive design
 */
export function PartnersCarousel() {
  const t = useTranslations("about.partners");

  // Embla autoplay plugin configuration
  const plugin = React.useRef(
    Autoplay({ delay: 6000, stopOnInteraction: false })
  );

  // Embla Carousel API for programmatic control
  const [api, setApi] = React.useState<CarouselApi>();

  // Navigation handlers using Embla's built-in methods
  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  return (
    <section className="relative w-full h-auto py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-gray-950 via-black to-gray-950 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-1/4 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-amber-500/3 to-transparent rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16 lg:mb-20">
          <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/10">
            <Plane className="w-3 h-3 sm:w-4 sm:h-4" />
            {t("badge")}
          </span>
          <h2
            className="font-bold tracking-tight bg-gradient-to-br from-white via-gray-100 to-gray-300 bg-clip-text text-transparent"
            style={{ fontSize: "clamp(1.75rem, 4vw + 0.5rem, 3.5rem)" }}
          >
            {t("title")}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Premium Carousel Section - Responsive: 1/2/3 Slides */}
        <div className="relative">
          {/* Carousel Container */}
          <div className="relative max-w-7xl mx-auto">
            {/* Previous Button */}
            <Button
              variant="ghost"
              onClick={scrollPrev}
              className="flex absolute left-0 sm:left-2 lg:-left-20 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-white/10 to-white/5 hover:from-amber-500/20 hover:to-orange-500/10 backdrop-blur-xl rounded-full items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 hover:border-amber-400/60 group shadow-2xl hover:shadow-amber-500/30 touch-manipulation"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white/70 group-hover:text-amber-400 transition-colors duration-300" />
            </Button>

            {/* Next Button */}
            <Button
              variant="ghost"
              onClick={scrollNext}
              className="flex absolute right-0 sm:right-2 lg:-right-20 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-white/10 to-white/5 hover:from-amber-500/20 hover:to-orange-500/10 backdrop-blur-xl rounded-full items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 hover:border-amber-400/60 group shadow-2xl hover:shadow-amber-500/30 touch-manipulation"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white/70 group-hover:text-amber-400 transition-colors duration-300" />
            </Button>

            {/* Slides Track */}
            <div className="overflow-hidden px-4 sm:px-8 lg:px-24 py-0 sm:py-0 lg:py-0">
              <div className="w-full py-0 flex justify-center items-center gap-3 ">
                <Carousel
                  setApi={setApi}
                  opts={{ align: "start" }}
                  className="w-full"
                  plugins={[plugin.current]}
                  onMouseEnter={plugin.current.stop}
                  onMouseLeave={plugin.current.reset}
                >
                  <CarouselContent className="w-full ">
                    {AIRLINE_PARTNERS.map((collection, index) => (
                      <CarouselItem
                        key={index}
                        className="basis-full md:basis-1/2 lg:basis-1/4 ml-1 flex flex-col items-center justify-center"
                      >
                        <Image
                          src={collection.logo}
                          alt={collection.name}
                          width={150}
                          height={150}
                          className="object-contain"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {/* <CarouselPrevious />
              <CarouselNext /> */}
                </Carousel>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced trust badge */}
        <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
          <div className="inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 backdrop-blur-md rounded-full border border-amber-500/30 shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <p className="text-white/90 text-sm sm:text-base lg:text-lg font-semibold">
              {t("trustBadge")}{" "}
              <span className="text-transparent bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text font-bold">
                {t("trustBadgeHighlight")}
              </span>{" "}
              {t("trustBadgeSuffix")}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced CSS animations */}
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </section>
  );
}
