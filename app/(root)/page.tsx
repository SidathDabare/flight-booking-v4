"use client";
import React, { useState } from "react";
import Comments from "@/components/home/comments";
// import FeaturedDestinations from "@/components/home/featured-destinations";
import Offers from "@/components/home/offers";
import TravelTips from "@/components/home/travel-tips";
import UnifiedSearch from "@/components/custom ui/unified-search/unified-search";
import LoadingScreen from "@/components/ui/loading-screen";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Home = () => {
  const [isCarouselLoading, setIsCarouselLoading] = useState(true);

  // Initialize scroll animations for all sections
  useScrollAnimation();

  return (
    <div className="w-full relative h-auto mx-auto">
      {isCarouselLoading && <LoadingScreen />}
      {/* <UnifiedSearch onCarouselLoadingChange={setIsCarouselLoading} /> */}
      {/* <FeaturedDestinations /> */}
      <Offers />
      <TravelTips />
      <Comments />
    </div>
  );
};

export default Home;
