"use client";

import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { DESTINATIONS } from "../_data/destinations";
import { useTranslations } from "next-intl";

/**
 * Grid showcasing popular travel destinations
 */
export function DestinationsGrid() {
  const t = useTranslations("services.destinations");

  return (
    <section className="w-full py-20 md:py-28 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full text-sm font-semibold text-amber-700 dark:text-amber-400 mb-4 shadow-sm">
            <MapPin className="w-4 h-4" />
            {t("badge")}
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4 text-gray-900 dark:text-white">
            {t("title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 md:text-lg">
            {t("description")}
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {DESTINATIONS.map((destination) => (
            <Card
              key={destination.id}
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
            >
              {/* Background Image */}
              <div className="relative h-72 sm:h-80 overflow-hidden">
                <Image
                  src={destination.image}
                  alt={`${t(`locations.${destination.id}.name`)} - ${t(`locations.${destination.id}.description`)}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:from-black/90 transition-all duration-500" />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white border border-white/30">
                      {t(`locations.${destination.id}.category`)}
                    </span>
                  </div>

                  {/* Destination Name */}
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors duration-300">
                    {t(`locations.${destination.id}.name`)}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-200 group-hover:text-white transition-colors duration-300">
                    {t(`locations.${destination.id}.description`)}
                  </p>

                  {/* Explore Arrow */}
                  <div className="mt-4 flex items-center gap-2 text-amber-400 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-sm font-semibold">{t("exploreNow")}</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            {t("viewAll")}
          </Button>
        </div>
      </div>
    </section>
  );
}
