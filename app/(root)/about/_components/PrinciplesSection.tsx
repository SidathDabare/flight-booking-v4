"use client";

import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Globe, Heart } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { useTranslations } from "next-intl";

/**
 * Section displaying company vision and mission
 */
export function PrinciplesSection() {
  const t = useTranslations("about.principles");
  return (
    <section className="scroll-animate w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t("badge")}
          title={t("title")}
          description={t("description")}
        />

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
          {/* Our Vision Card */}
          <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 dark:hover:shadow-amber-900/20 transition-all duration-500 transform hover:-translate-y-2 h-full">
            <div className="grid sm:grid-cols-2 h-full">
              {/* Image Section */}
              <div className="relative h-56 sm:h-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80"
                  alt="Our Vision - Team collaboration showcasing global connectivity"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20" />
              </div>

              {/* Content Section */}
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-6 sm:p-8 lg:p-10 flex flex-col justify-center relative overflow-hidden min-h-[280px] sm:min-h-0">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
                <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-white/10 rounded-full -ml-10 sm:-ml-12 -mb-10 sm:-mb-12" />
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                    <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">
                    {t("vision.title")}
                  </h3>
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    {t("vision.content")}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Our Mission Card */}
          <Card className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 dark:hover:shadow-amber-900/20 transition-all duration-500 transform hover:-translate-y-2 h-full">
            <div className="grid sm:grid-cols-2 h-full">
              {/* Content Section */}
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 sm:p-8 lg:p-10 flex flex-col justify-center order-2 sm:order-1 relative overflow-hidden min-h-[280px] sm:min-h-0">
                <div className="absolute top-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-amber-500/10 rounded-full -ml-12 sm:-ml-16 -mt-12 sm:-mt-16" />
                <div className="absolute bottom-0 right-0 w-20 sm:w-24 h-20 sm:h-24 bg-amber-500/10 rounded-full -mr-10 sm:-mr-12 -mb-10 sm:-mb-12" />
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-500/20 backdrop-blur-sm flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                    <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">
                    {t("mission.title")}
                  </h3>
                  <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                    {t("mission.content")}
                  </p>
                </div>
              </div>

              {/* Image Section */}
              <div className="relative h-56 sm:h-full order-1 sm:order-2 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=800"
                  alt="Our Mission - Strategic planning and customer-focused service"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-bl from-gray-900/20 to-transparent" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
