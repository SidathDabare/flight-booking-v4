"use client";

import React from "react";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import { CONTACT_INFO } from "../_data/contact-info";
import { useTranslations } from "next-intl";

/**
 * Section displaying contact information and image
 */
export function ContactSection() {
  const t = useTranslations("about.contact");

  return (
    <section className="w-full py-20 md:py-28 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-1 lg:gap-16 max-w-6xl mx-auto items-center">
          {/* Left side - Contact Image & Info */}
          <div className="space-y-8 grid grid-cols-1">
            <div className="space-y-4 text-center py-8">
              <span className="inline-block px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-sm font-semibold text-orange-700 dark:text-orange-400">
                {t("badge")}
              </span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {t("title")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {t("description")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&q=80"
                  alt="Contact our travel experts"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              {/* Contact Info Cards */}
              <div className="relative space-y-4">
                <div className="group flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300 border border-gray-200 dark:border-gray-800">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t("email")}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {CONTACT_INFO.email}
                    </div>
                  </div>
                </div>

                <div className="group flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300 border border-gray-200 dark:border-gray-800">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t("phone")}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {CONTACT_INFO.phone}
                    </div>
                  </div>
                </div>

                <div className="group flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300 border border-gray-200 dark:border-gray-800">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t("visit")}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {CONTACT_INFO.hours}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
