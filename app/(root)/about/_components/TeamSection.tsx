"use client";

import React from "react";
import Image from "next/image";
import { Award, Shield } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { Badge } from "./Badge";
import { TEAM_LEADER } from "../_data/team-info";
import { useTranslations } from "next-intl";

/**
 * Section showcasing the leadership team
 */
export function TeamSection() {
  const t = useTranslations("about.team");

  return (
    <section className="scroll-animate w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-amber-50/40 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t("badge")}
          title={t("title")}
          description={t("description")}
        />

        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20 items-center max-w-6xl mx-auto">
          {/* Image Section */}
          <div className="relative">
            <div className="w-full relative aspect-[3/4] sm:h-[450px] lg:h-[550px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl hover:shadow-amber-500/20 dark:hover:shadow-amber-900/30 transition-all duration-500 group">
              <Image
                src={TEAM_LEADER.image}
                alt={TEAM_LEADER.imageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Floating badge */}
              <div className="absolute top-4 sm:top-6 lg:top-8 left-4 sm:left-6 lg:left-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-md">
                    <span className="text-base sm:text-xl font-bold text-white">
                      {TEAM_LEADER.name.charAt(4)}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {t("leader.title")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <h3
                className="font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                style={{ fontSize: "clamp(1.5rem, 3vw + 0.5rem, 2.5rem)" }}
              >
                {t("leader.name")}
              </h3>
              <p className="text-base sm:text-lg font-semibold text-amber-600 dark:text-amber-400">
                {t("leader.credentials")}
              </p>
            </div>

            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-full" />

            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>{t("leader.description1")}</p>
              <p>{t("leader.description2")}</p>
              <p className="hidden sm:block">{t("leader.description3")}</p>
            </div>

            {/* Credentials */}
            <div className="flex flex-wrap gap-2 sm:gap-3 pt-2 sm:pt-4">
              <Badge icon={Award} text={t("leader.badge1")} variant="secondary" />
              <Badge icon={Shield} text={t("leader.badge2")} variant="secondary" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
