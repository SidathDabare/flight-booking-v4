"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Hero section for services page
 */
export function ServicesHero() {
  const t = useTranslations("services.hero");

  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-white to-amber-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 right-5 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 bg-amber-300/20 dark:bg-amber-900/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-10 sm:bottom-20 left-5 sm:left-10 w-64 sm:w-96 h-64 sm:h-96 bg-orange-200/20 dark:bg-orange-900/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-20 items-center max-w-7xl mx-auto">
          {/* Left side - Text Content */}
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-block animate-fade-in">
                <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50 shadow-sm">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  {t("badge")}
                </span>
              </div>
              <h1
                className="font-bold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent"
                style={{
                  fontSize: "clamp(2rem, 5vw + 1rem, 4.5rem)",
                  lineHeight: "1.1",
                }}
              >
                {t("title")}
              </h1>
              <div className="w-16 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-full" />
            </div>

            <div className="space-y-4 sm:space-y-6 text-gray-700 dark:text-gray-300">
              <p className="text-base sm:text-lg leading-relaxed">
                {t("paragraph1")}
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                {t("paragraph2")}
              </p>
              <p className="text-base sm:text-lg leading-relaxed hidden sm:block">
                {t("paragraph3")}
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Button className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base">
                {t("cta")}
              </Button>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="w-full relative order-1 lg:order-2">
            <div className="w-full relative aspect-[4/3] sm:aspect-[3/4] lg:h-[600px] xl:h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl hover:shadow-amber-500/20 dark:hover:shadow-amber-900/30 transition-all duration-500 group">
              <Image
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                alt="Premium travel services - Professional travel planning and customer service"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
