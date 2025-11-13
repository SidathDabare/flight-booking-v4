/**
 * Cookie Consent Management Utility
 * Handles cookie consent storage and retrieval
 * GDPR-compliant cookie management
 */

export type CookieCategory = 'necessary' | 'functional' | 'analytics' | 'marketing';

export interface CookiePreferences {
  necessary: boolean;      // Always true, cannot be disabled
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;       // When consent was given
  version: string;         // Consent version for audit trail
  isEU: boolean;          // Whether user is subject to GDPR
}

const CONSENT_VERSION = '1.0.0';
const COOKIE_NAME = 'cookie_consent';
const CONSENT_EXPIRY_DAYS = 365; // GDPR recommends re-asking after 1 year

/**
 * Gets current cookie preferences from storage
 */
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(COOKIE_NAME);
    if (!stored) return null;

    const preferences: CookiePreferences = JSON.parse(stored);

    // Check if consent is expired (older than 365 days)
    const consentAge = Date.now() - preferences.timestamp;
    const maxAge = CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (consentAge > maxAge) {
      // Consent expired, clear it
      localStorage.removeItem(COOKIE_NAME);
      return null;
    }

    // Check if version changed (requires re-consent)
    if (preferences.version !== CONSENT_VERSION) {
      localStorage.removeItem(COOKIE_NAME);
      return null;
    }

    return preferences;
  } catch (error) {
    console.error('Error reading cookie preferences:', error);
    return null;
  }
}

/**
 * Saves cookie preferences to storage
 */
export function saveCookiePreferences(
  preferences: Omit<CookiePreferences, 'timestamp' | 'version'>,
  isEU: boolean
): void {
  if (typeof window === 'undefined') return;

  try {
    const fullPreferences: CookiePreferences = {
      ...preferences,
      necessary: true, // Always true
      timestamp: Date.now(),
      version: CONSENT_VERSION,
      isEU
    };

    localStorage.setItem(COOKIE_NAME, JSON.stringify(fullPreferences));

    // Dispatch custom event for other parts of the app
    window.dispatchEvent(
      new CustomEvent('cookieConsentChanged', {
        detail: fullPreferences
      })
    );

    console.log('Cookie preferences saved:', fullPreferences);
  } catch (error) {
    console.error('Error saving cookie preferences:', error);
  }
}

/**
 * Checks if user has given consent
 */
export function hasConsent(): boolean {
  return getCookiePreferences() !== null;
}

/**
 * Checks if specific category is enabled
 */
export function isCategoryEnabled(category: CookieCategory): boolean {
  const preferences = getCookiePreferences();
  if (!preferences) return false;
  return preferences[category] === true;
}

/**
 * Clears all cookie preferences (for testing or user request)
 */
export function clearCookiePreferences(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(COOKIE_NAME);

  window.dispatchEvent(new CustomEvent('cookieConsentCleared'));
  console.log('Cookie preferences cleared');
}

/**
 * Gets default preferences based on user region
 * EU: All optional cookies OFF by default (GDPR requirement)
 * Non-EU: All cookies ON by default
 */
export function getDefaultPreferences(isEU: boolean): Omit<CookiePreferences, 'timestamp' | 'version'> {
  if (isEU) {
    // GDPR: No pre-consent, all optional cookies off
    return {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      isEU: true
    };
  } else {
    // Non-EU: Can pre-consent to all
    return {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      isEU: false
    };
  }
}

/**
 * Accept all cookies (convenience function)
 */
export function acceptAllCookies(isEU: boolean): void {
  saveCookiePreferences({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: true,
    isEU
  }, isEU);
}

/**
 * Reject optional cookies (keep only necessary)
 */
export function rejectOptionalCookies(isEU: boolean): void {
  saveCookiePreferences({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    isEU
  }, isEU);
}

/**
 * Export consent for audit/compliance purposes
 */
export function exportConsentRecord(): string | null {
  const preferences = getCookiePreferences();
  if (!preferences) return null;

  return JSON.stringify({
    ...preferences,
    exportedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
  }, null, 2);
}
