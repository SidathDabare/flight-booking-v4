"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/client/shared/SectionHeader";
import { DecorativeBackground } from "@/components/client/shared/DecorativeBackground";
import { useTranslations } from "next-intl";

interface Offer {
  _id: string;
  title: string;
  departureCity: string;
  arrivalCity: string;
  description: string;
  price: number;
  discount: number;
  expireDate: string;
  responsiveImages?: {
    desktop: { url: string; width: number; height: number };
    tablet: { url: string; width: number; height: number };
    mobile: { url: string; width: number; height: number };
  };
  imageUrl?: string;
}

interface OffersState {
  offers: Offer[];
  isEnabled: boolean;
}

export default function Offers() {
  const t = useTranslations("home.offers");
  const [offersState, setOffersState] = useState<OffersState>({
    offers: [],
    isEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch("/api/offers");
        const data = await response.json();

        if (response.ok) {
          setOffersState({
            offers: data.data || [],
            isEnabled: data.isEnabled !== false,
          });
        }
      } catch (error) {
        console.error("Failed to fetch offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (loading) {
    return (
      <section className="scroll-animate relative w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-amber-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  if (!offersState.isEnabled || offersState.offers.length === 0) {
    return null;
  }

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price - (price * discount) / 100;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isExpiringSoon = (expireDate: string) => {
    const expire = new Date(expireDate);
    const now = new Date();
    const diffTime = expire.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <section className="scroll-animate relative w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-amber-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      <DecorativeBackground variant="mixed" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          badge={t("badge")}
          title={t("title")}
          description={t("description")}
        />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {offersState.offers.map((offer) => {
            const discountedPrice = calculateDiscountedPrice(
              offer.price,
              offer.discount
            );
            const imageUrl =
              offer.responsiveImages?.mobile.url || offer.imageUrl;
            const savingsAmount = offer.price - discountedPrice;

            return (
              <div
                key={offer._id}
                className="group relative bg-white rounded-xl hover:scale-105 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 h-[200px] min:h-[200px]"
              >
                <div className="flex h-full">
                  {/* Left side - Image with curved cut (like reference) */}
                  {imageUrl && (
                    <div className="relative w-3/6 h-full overflow-hidden ">
                      <Image
                        src={imageUrl}
                        width={400}
                        height={350}
                        alt={offer.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        style={{
                          clipPath: "polygon(0 0, 95% 0, 75% 100%, 0 100%)",
                        }}
                      />

                      {/* Text overlay on image - like reference */}
                      <div className="absolute top-3 left-4 text-white">
                        {/* <div className="text-xs font-medium text-white/90 mb-1">
                          Expires {formatDate(offer.expireDate)}
                        </div> */}
                        <h3 className="text-xl font-bold drop-shadow-lg text-white">
                          {offer.arrivalCity}
                        </h3>
                        {/* <div className="text-xs font-medium text-white/80 italic">
                          Starting from
                        </div> */}
                      </div>

                      {/* Discount Badge */}
                      {/* {offer.discount > 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          -{offer.discount}%
                        </div>
                      )} */}
                    </div>
                  )}

                  {/* Right side - Content area */}
                  <div className="w-3/6 pr-2 py-4 flex flex-col justify-between">
                    <div className="flex-1 p-2 flex flex-col justify-between space-y-2">
                      {" "}
                      {/* Discount Badge */}
                      {offer.discount > 0 && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded-bl-xl text-xs font-bold">
                          -{offer.discount}%
                        </div>
                      )}
                      {/* Title and description */}
                      <div className="flex flex-col justify-betweenS items-end">
                        {/* <div className="text-xs mb-1">
                          Expires {formatDate(offer.expireDate)}
                        </div> */}
                        {isExpiringSoon(offer.expireDate) ? (
                          <div className="bg-gradient-to-r from-orange-200 to-amber-500 text-red-800 px-2 py-0.5 rounded-full text-xs font-bold shadow-lg animate-pulse w-fit">
                            🔥 Expires {formatDate(offer.expireDate)}
                          </div>
                        ) : (
                          <div className="text-xs mb-1 pr-2">
                            {t("expires")} {formatDate(offer.expireDate)}
                          </div>
                        )}
                        {/* Route info */}
                        <div className="text-sm text-gray-600 font-semibold truncate pr-2">
                          {offer.departureCity} • {offer.arrivalCity}
                        </div>
                        {/* Description */}
                        {/* <p className="text-xs text-gray-500 line-clamp-2">
                      {offer.description}
                    </p> */}
                      </div>
                      <div className="flex flex-col items-center justify-between px-2">
                        {" "}
                        {/* Pricing section - exactly like reference */}
                        <div className="flex items-baseline self-end gap-2">
                          {offer.discount > 0 ? (
                            <>
                              <span className="text-gray-400 line-through text-sm">
                                {formatPrice(offer.price)}
                              </span>
                              <span className="text-2xl font-bold text-red-500">
                                {formatPrice(discountedPrice)}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-gray-900">
                              {formatPrice(offer.price)}
                            </span>
                          )}
                        </div>
                        {/* Book Now - small button like reference */}
                        {/* <button className="self-end bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs font-semibold transition-colors duration-200 mt-2">
                          Book Now
                        </button> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {offersState.offers.length > 4 && (
          <div className="mt-12 flex justify-center">
            <Button className="group relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/30 shadow-xl">
              <span className="relative z-10 flex items-center gap-2">
                {t("loadMore")}
                <svg
                  className="w-5 h-5 transition-transform group-hover:translate-y-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
