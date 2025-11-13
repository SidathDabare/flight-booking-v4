import { useEffect } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Custom hook for scroll-based animations using Intersection Observer
 * Automatically adds 'animate-in' class to elements with 'scroll-animate' class
 */
export function useScrollAnimation({
  threshold = 0.1,
  rootMargin = "0px 0px -50px 0px",
}: UseScrollAnimationOptions = {}) {
  useEffect(() => {
    const observerOptions = {
      threshold,
      rootMargin,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".scroll-animate");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [threshold, rootMargin]);
}
