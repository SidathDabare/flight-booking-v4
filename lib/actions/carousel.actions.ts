"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
import { Settings } from "@/lib/db/models/Settings";

export interface CarouselItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imagePublicId: string;
  isHidden: boolean;
  order: number;
  responsiveImages: {
    desktop: { url: string; width: number; height: number };
    tablet: { url: string; width: number; height: number };
    mobile: { url: string; width: number; height: number };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CarouselData {
  items: CarouselItem[];
  isEnabled: boolean;
}

export async function getCarouselSettings(): Promise<CarouselData> {
  try {
    await connectToDatabase();

    const settings = await Settings.findOne().lean() as any;

    if (!settings) {
      // Return default empty carousel if no settings exist
      return {
        items: [],
        isEnabled: true,
      };
    }

    // Filter out hidden items and sort by order
    const visibleItems = settings.carousel.items
      .filter((item: CarouselItem) => !item.isHidden)
      .sort((a: CarouselItem, b: CarouselItem) => a.order - b.order)
      .map((item: CarouselItem) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        imageUrl: item.imageUrl,
        imagePublicId: item.imagePublicId,
        isHidden: item.isHidden,
        order: item.order,
        responsiveImages: item.responsiveImages,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      }));

    return {
      items: visibleItems,
      isEnabled: settings.carousel.isEnabled,
    };
  } catch (error) {
    console.error("Error fetching carousel settings:", error);
    // Return fallback data instead of throwing error to prevent UI crashes
    return {
      items: [],
      isEnabled: true,
    };
  }
}

export async function getPublicCarouselData(): Promise<{
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
}> {
  try {
    const carouselData = await getCarouselSettings();

    if (!carouselData.isEnabled || carouselData.items.length === 0) {
      // Return empty carousel if disabled or no items
      return {
        images: [],
        isEnabled: false,
      };
    }

    const images = carouselData.items.map((item) => ({
      src: item.imageUrl,
      alt: item.title,
      title: item.title,
      subtitle: item.subtitle,
      desktop: item.responsiveImages.desktop.url,
      tablet: item.responsiveImages.tablet.url,
      mobile: item.responsiveImages.mobile.url,
    }));

    return {
      images,
      isEnabled: carouselData.isEnabled,
    };
  } catch (error) {
    console.error("Error getting public carousel data:", error);

    // Return empty carousel on error
    return {
      images: [],
      isEnabled: false,
    };
  }
}