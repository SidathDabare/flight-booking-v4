"use client";

import React from "react";
import Image from "next/image";
import { CheckIcon } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { STAFF_MEMBERS } from "../_data/team-info";
import { useTranslations } from "next-intl";

/**
 * Section showcasing staff expertise and qualifications
 */
export function StaffSection() {
  const t = useTranslations("about.staff");

  return (
    <section className="scroll-animate w-full py-4 sm:py-8 md:py-8 lg:py-16 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:gap-16 lg:grid-cols-1 lg:gap-16 xl:gap-24 max-w-7xl mx-auto">
          <div className="space-y-6 sm:space-y-8 rid gap-0 sm:gap-0 lg:grid-cols-2 flex flex-col items-center">
            <div className="w-full">
              <SectionHeader
                badge={t("badge")}
                title={t("title")}
                description={t("description")}
                alignment="center"
              />
            </div>
            <div className="w-full flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16">
              <div className="w-full md:w-1/2 space-y-3 sm:space-y-4">
                {STAFF_MEMBERS.map((member) => (
                  <div
                    key={member.id}
                    className="group p-3 md:p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border border-gray-200 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                        <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-gray-900 dark:text-white">
                          {t(`members.${member.id}.title`)}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                          {t(`members.${member.id}.description`)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Team Image */}
              <div className="w-full md:w-1/2 h-full relative aspect-[16/9]  rounded-xl sm:rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 dark:hover:shadow-amber-900/20 transition-all duration-500 group">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=800"
                  alt="Our professional team collaborating on travel solutions"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
