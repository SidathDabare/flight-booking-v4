"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ClockIcon, LuggageIcon, MapPinIcon } from "lucide-react";
import { SectionHeader } from "@/components/client/shared/SectionHeader";
import { DecorativeBackground } from "@/components/client/shared/DecorativeBackground";
import { useTranslations } from "next-intl";

export default function TravelTips() {
  const t = useTranslations("home.travelTips");
  return (
    <section className="scroll-animate relative w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
      <DecorativeBackground variant="orange" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge={t("badge")}
          title={t("title")}
          description={t("description")}
        />

        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 md:grid-cols-3">
          <Card className="shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 dark:hover:shadow-amber-900/20 transition-all duration-500 hover:-translate-y-2">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shadow-lg">
                <LuggageIcon className="h-7 w-7 sm:h-8 sm:w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold">{t("tips.packLight.title")}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t("tips.packLight.description")}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 dark:hover:shadow-amber-900/20 transition-all duration-500 hover:-translate-y-2">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shadow-lg">
                <MapPinIcon className="h-7 w-7 sm:h-8 sm:w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold">{t("tips.exploreLocally.title")}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t("tips.exploreLocally.description")}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 dark:hover:shadow-amber-900/20 transition-all duration-500 hover:-translate-y-2">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shadow-lg">
                <ClockIcon className="h-7 w-7 sm:h-8 sm:w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold">{t("tips.beFlexible.title")}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t("tips.beFlexible.description")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
