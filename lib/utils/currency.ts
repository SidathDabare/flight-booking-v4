/**
 * Currency utility functions for handling default currency configuration
 */

/**
 * Get the default currency code from environment variables
 * Falls back to EUR if not set
 */
export const getDefaultCurrency = (): string => {
  return process.env.NEXT_PUBLIC_CURRENCY?.toUpperCase() || "EUR";
};

/**
 * Get currency code with fallback chain:
 * 1. Provided value (e.g., from localStorage)
 * 2. Environment variable
 * 3. EUR as final fallback
 */
export const getCurrencyCode = (savedCurrency?: string): string => {
  return savedCurrency || getDefaultCurrency();
};