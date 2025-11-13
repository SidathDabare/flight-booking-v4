"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getCookiePreferences, type CookiePreferences, type CookieCategory } from "@/lib/cookie-consent";

interface CookieConsentContextType {
  preferences: CookiePreferences | null;
  hasConsent: boolean;
  isCategoryEnabled: (category: CookieCategory) => boolean;
  refreshPreferences: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

/**
 * Cookie Consent Provider
 * Provides cookie preferences throughout the app
 * Useful for conditionally loading analytics scripts, etc.
 */
export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

  const loadPreferences = () => {
    const prefs = getCookiePreferences();
    setPreferences(prefs);
  };

  useEffect(() => {
    // Load initial preferences
    loadPreferences();

    // Listen for preference changes
    const handleConsentChange = (event: CustomEvent) => {
      setPreferences(event.detail);
    };

    const handleConsentClear = () => {
      setPreferences(null);
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener);
    window.addEventListener('cookieConsentCleared', handleConsentClear);

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener);
      window.removeEventListener('cookieConsentCleared', handleConsentClear);
    };
  }, []);

  const isCategoryEnabled = (category: CookieCategory): boolean => {
    if (!preferences) return false;
    return preferences[category] === true;
  };

  const value: CookieConsentContextType = {
    preferences,
    hasConsent: preferences !== null,
    isCategoryEnabled,
    refreshPreferences: loadPreferences
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

/**
 * Hook to access cookie consent preferences
 * Usage: const { hasConsent, isCategoryEnabled } = useCookieConsent();
 */
export function useCookieConsent() {
  const context = useContext(CookieConsentContext);

  if (context === undefined) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider');
  }

  return context;
}
