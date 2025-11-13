"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plane,
  FileText,
  Hotel,
  Briefcase,
  Shield,
  Ship,
  MapPin,
  Users,
  Check,
  LucideIcon,
} from "lucide-react";
import type { Service } from "../_types";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Plane,
  FileText,
  Hotel,
  Briefcase,
  Shield,
  Ship,
  MapPin,
  Users,
};

interface ServiceCardProps {
  service: Service;
}

/**
 * Individual service card with expandable details
 */
export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = iconMap[service.icon];
  const t = useTranslations("services");
  const tCard = useTranslations("services.card");

  return (
    <Card
      className={cn(
        "group border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-gray-900",
        service.featured
          ? "border-amber-400 dark:border-amber-600 shadow-lg shadow-amber-500/20"
          : "border-gray-200 dark:border-gray-800 hover:border-amber-400 dark:hover:border-amber-600"
      )}
    >
      <CardContent className="p-6 sm:p-8">
        {/* Icon and Featured Badge */}
        <div className="flex items-start justify-between mb-6">
          <div
            className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300",
              service.featured
                ? "bg-gradient-to-br from-amber-500 to-orange-500"
                : "bg-gradient-to-br from-orange-500 to-amber-500"
            )}
          >
            <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          {service.featured && (
            <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full text-xs font-semibold text-amber-700 dark:text-amber-400">
              {tCard("popular")}
            </span>
          )}
        </div>

        {/* Title and Description */}
        <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-white">
          {t(`items.${service.id}.title`)}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
          {t(`items.${service.id}.description`)}
        </p>

        {/* Main Benefits */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
            {tCard("keyBenefits")}
          </h4>
          <ul className="space-y-2.5">
            {service.mainBenefits.map((_, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t(`items.${service.id}.mainBenefits.${index + 1}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Extra Perks */}
        {service.extraPerks && service.extraPerks.length > 0 && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-3">
              {tCard("additionalServices")}
            </h4>
            <ul className="grid grid-cols-1 gap-2">
              {service.extraPerks.map((_, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="text-amber-500 dark:text-amber-400 mt-1">
                    •
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t(`items.${service.id}.extraPerks.${index + 1}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
