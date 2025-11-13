"use client";

import React from "react";
import { ServiceCard } from "./ServiceCard";
import { SERVICES } from "../_data/services";
import { useTranslations } from "next-intl";

/**
 * Grid layout displaying all available services
 */
export function ServicesGrid() {
  const t = useTranslations("services.grid");

  return (
    <section className="w-full py-20 md:py-28 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full text-sm font-semibold text-amber-700 dark:text-amber-400 mb-4 shadow-sm">
            {t("badge")}
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4 text-gray-900 dark:text-white">
            {t("title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 md:text-lg">
            {t("description")}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
