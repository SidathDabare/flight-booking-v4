"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import React from "react";
import Image from "next/image";
import { getPublicCarouselData } from "@/lib/actions/carousel.actions";
import { cn } from "@/lib/utils";

export function ClientCarousel({
  onLoadingChange,
}: {
  onLoadingChange?: (loading: boolean) => void;
}) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [carouselData, setCarouselData] = React.useState<{
    images: Array<{
      src: string;
      alt: string;
      title: string;
      subtitle: string;
      desktop: string;
      tablet: string;
      mobile: string;
    }>;
    isEnabled: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch carousel data on component mount
  React.useEffect(() => {
    onLoadingChange?.(true);
    const fetchCarouselData = async () => {
      try {
        const data = await getPublicCarouselData();
        setCarouselData(data);
      } catch (error) {
        console.error("Error fetching carousel data:", error);
        // Set empty carousel on error
        setCarouselData({
          images: [],
          isEnabled: false,
        });
      } finally {
        setIsLoading(false);
        onLoadingChange?.(false);
      }
    };

    fetchCarouselData();
  }, [onLoadingChange]);

  React.useEffect(() => {
    if (!api || !carouselData) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api, carouselData]);

  // Auto-play functionality with progress tracking
  React.useEffect(() => {
    if (!api || !carouselData) {
      return;
    }

    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 2; // Increment by 2% every 100ms (100 * 100ms = 5000ms total)
      });
    }, 100);

    const autoPlay = setInterval(() => {
      api.scrollNext();
      setProgress(0); // Reset progress when slide changes
    }, 5000); // Change slide every 5 seconds

    return () => {
      clearInterval(autoPlay);
      clearInterval(progressInterval);
    };
  }, [api, current, carouselData]);

  const goToSlide = (index: number) => {
    console.log(
      "Navigating to slide:",
      index,
      "API available:",
      !!api,
      "Current:",
      current
    );
    if (api) {
      try {
        api.scrollTo(index);
        setProgress(0);
        console.log("Successfully scrolled to index:", index);
      } catch (error) {
        console.error("Error scrolling to slide:", error);
      }
    } else {
      console.warn("API not available yet");
    }
  };

  // Show loading state
  if (isLoading || !carouselData) {
    return (
      <div className="w-full h-full min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading carousel...</p>
        </div>
      </div>
    );
  }

  // Don't render if carousel is disabled or no images
  if (!carouselData.isEnabled || carouselData.images.length === 0) {
    return (
      <div className="w-full h-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center px-6">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No carousel images available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            The carousel is currently empty. Please check back later or contact
            an administrator to add content.
          </p>
        </div>
      </div>
    );
  }

  const images = carouselData.images;

  return (
    <Carousel
      setApi={setApi}
      className="w-full h-full relative"
      opts={{
        loop: true,
        dragFree: true,
      }}
    >
      <CarouselContent className="h-full -ml-0">
        {images.map((image, index) => (
          <CarouselItem key={index} className="h-full pl-0">
            <div className="relative w-full h-full min-h-screen z-0">
              <picture>
                <source media="(min-width: 1024px)" srcSet={image.desktop} />
                <source media="(min-width: 768px)" srcSet={image.tablet} />
                <Image
                  src={image.mobile}
                  alt={image.alt}
                  fill
                  className="object-cover z-0 w-full h-full"
                  priority={index === 0}
                />
              </picture>

              {/* Optional: Add title and subtitle overlay */}
              {(image.title || image.subtitle) && (
                <div className="absolute inset-0 bg-black/20 flex items-end justify-end z-50">
                  <div className="text-left text-white px-6 pb-10 pr-10">
                    {image.title && (
                      <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                        {image.title}
                      </h2>
                    )}
                    {image.subtitle && (
                      <p className="text-lg md:text-2xl opacity-90">
                        {image.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Progress Bar - Full Width at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-1 bg-white dark:bg-gray-200 overflow-hidden z-50">
        <div
          className="h-full bg-red-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Circle Indicators - Centered */}
      <div className="absolute bottom-4 right-1 lg:-right-6 transform -translate-x-1/2 z-50">
        <div className="flex items-end gap-2 px-3 py-2 bg-black/0 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
          {images.map((image, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => {
                console.log(`Dot ${index + 1} clicked!`);
                goToSlide(index);
              }}
              className={cn(
                "w-4 h-1 rounded-full transition-all duration-300 cursor-pointer active:scale-110 shadow-lg p-0 hover:bg-transparent",
                current === index + 1
                  ? "bg-red-500 shadow-lg scale-125"
                  : "bg-white/80 hover:bg-white/80 hover:scale-110"
              )}
              aria-label={`Go to slide ${index + 1}`}
              style={{ zIndex: 10001 }}
            />
          ))}
        </div>
      </div>
    </Carousel>
  );
}
