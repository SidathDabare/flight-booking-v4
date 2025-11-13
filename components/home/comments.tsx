"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon } from "lucide-react";
import { SectionHeader } from "@/components/client/shared/SectionHeader";
import { DecorativeBackground } from "@/components/client/shared/DecorativeBackground";
import { useTranslations } from "next-intl";

export default function Comments() {
  const t = useTranslations("home.testimonials");
  return (
    <section className="scroll-animate relative w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
      <DecorativeBackground variant="amber" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge={t("badge")}
          title={t("title")}
          description={t("description")}
        />

        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 md:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <Card
              key={index}
              className="shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 dark:hover:shadow-amber-900/20 transition-all duration-500 hover:-translate-y-2"
            >
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage
                      src="/placeholder-user.jpg"
                      alt={`User ${index + 1}`}
                    />
                    <AvatarFallback>
                      {index === 0 ? "JD" : index === 1 ? "JS" : "MC"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {t(`reviews.${index}.name`)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t(`reviews.${index}.location`)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <div className="flex items-center gap-px text-amber-500 dark:text-amber-400">
                    {Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <StarIcon key={i} className="h-3 w-3 fill-current" />
                      ))}
                    <StarIcon className="h-3 w-3" />
                  </div>
                  <span className="text-muted-foreground">
                    {t(`reviews.${index}.time`)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(`reviews.${index}.comment`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
