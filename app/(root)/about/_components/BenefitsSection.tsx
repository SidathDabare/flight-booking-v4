"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Globe,
  Users,
  Clock,
  Plane,
  Award,
  Shield,
  LucideIcon,
} from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { BENEFITS } from "../_data/benefits";
import { useTranslations } from "next-intl";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Globe,
  Users,
  Clock,
  Plane,
  Award,
  Shield,
};

/**
 * Section showcasing the benefits of choosing our services
 */
export function BenefitsSection() {
  const t = useTranslations("about.benefits");

  return (
    <section className="w-full py-20 md:py-28 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-sm font-semibold text-orange-700 dark:text-orange-400 mb-4">
            {t("badge")}
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 md:text-lg">
            {t("description")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {BENEFITS.map((benefit) => {
            const Icon = iconMap[benefit.icon];
            return (
              <Card
                key={benefit.id}
                className="group border-2 border-gray-200 dark:border-gray-800 hover:border-orange-400 dark:hover:border-orange-600 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-gray-900"
              >
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {t(`items.${benefit.id}.title`)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t(`items.${benefit.id}.description`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
