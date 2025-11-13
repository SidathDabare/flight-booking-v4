"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarIcon } from "lucide-react";
import { TESTIMONIALS } from "../_data/testimonials";
import { useTranslations } from "next-intl";

/**
 * Section displaying customer testimonials and trust indicators
 */
export function TestimonialsSection() {
  const t = useTranslations("about.testimonials");

  return (
    <section className="scroll-animate relative w-full py-20 md:py-28 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "3s" }}
        />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s", animationDelay: "1.5s" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-2 bg-orange-500/20 backdrop-blur-sm rounded-full text-sm font-semibold text-orange-300 mb-4 border border-orange-500/30">
            {t("badge")}
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4 text-gray-300">
            {t("title")}
          </h2>
          <p className="text-gray-400">
            {t("description")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {TESTIMONIALS.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="group bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-orange-500/30 group-hover:ring-orange-500 transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-white">
                      {t(`reviews.${testimonial.id}.name`)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {t(`reviews.${testimonial.id}.role`)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array(testimonial.rating)
                    .fill(0)
                    .map((_, i) => (
                      <StarIcon
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  &quot;{t(`reviews.${testimonial.id}.comment`)}&quot;
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">
              4.9/5
            </div>
            <div className="text-sm text-gray-400">{t("stats.rating")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">
              2,500+
            </div>
            <div className="text-sm text-gray-400">{t("stats.clients")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">
              98%
            </div>
            <div className="text-sm text-gray-400">{t("stats.satisfaction")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">
              24/7
            </div>
            <div className="text-sm text-gray-400">{t("stats.support")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
