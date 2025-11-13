import { useState, useEffect, useCallback } from "react";

interface UseCarouselOptions {
  totalItems: number;
  autoAdvanceDelay?: number;
  swipeThreshold?: number;
}

interface UseCarouselReturn {
  currentSlide: number;
  slidesPerView: number;
  totalSlides: number;
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}

/**
 * Custom hook for managing carousel state and interactions
 * Handles responsive slides, auto-advance, and touch gestures
 */
export function useCarousel({
  totalItems,
  autoAdvanceDelay = 5000,
  swipeThreshold = 75,
}: UseCarouselOptions): UseCarouselReturn {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(3);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const totalSlides = Math.ceil(totalItems / slidesPerView);

  // Handle responsive slides per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSlidesPerView(1); // Mobile: 1 image
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(2); // Tablet: 2 images
      } else {
        setSlidesPerView(3); // Desktop: 3 images
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset to first slide when slidesPerView changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [slidesPerView]);

  // Auto-advance slides
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, autoAdvanceDelay);

    return () => clearInterval(intervalId);
  }, [totalSlides, autoAdvanceDelay]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStart - touchEnd > swipeThreshold) {
      nextSlide();
    }
    if (touchStart - touchEnd < -swipeThreshold) {
      prevSlide();
    }
  }, [touchStart, touchEnd, swipeThreshold, nextSlide, prevSlide]);

  return {
    currentSlide,
    slidesPerView,
    totalSlides,
    nextSlide,
    prevSlide,
    goToSlide,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
