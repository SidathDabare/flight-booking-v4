/**
 * Geolocation Utility
 * Detects user's location to determine GDPR applicability
 */

// EU/EEA countries that require GDPR compliance
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // EEA countries
  'IS', 'LI', 'NO',
  // UK (maintains GDPR-equivalent regulations)
  'GB'
];

/**
 * Detects if user is from EU/EEA region requiring GDPR compliance
 * Uses multiple detection methods for reliability
 */
export async function isEUUser(): Promise<boolean> {
  try {
    // Method 1: Check browser timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const euTimezones = [
      'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome',
      'Europe/Madrid', 'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Vienna',
      'Europe/Stockholm', 'Europe/Copenhagen', 'Europe/Oslo', 'Europe/Helsinki',
      'Europe/Warsaw', 'Europe/Prague', 'Europe/Budapest', 'Europe/Athens',
      'Europe/Lisbon', 'Europe/Dublin', 'Europe/Bucharest', 'Europe/Sofia',
      'Europe/Zagreb', 'Europe/Riga', 'Europe/Tallinn', 'Europe/Vilnius',
      'Europe/Ljubljana', 'Europe/Bratislava', 'Europe/Luxembourg',
      'Europe/Valletta', 'Europe/Nicosia', 'Atlantic/Reykjavik'
    ];

    // If timezone suggests EU, assume EU user
    if (euTimezones.some(tz => timezone.startsWith(tz))) {
      return true;
    }

    // Method 2: Try to fetch from IP geolocation API (free tier)
    try {
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const countryCode = data.country_code;

        if (countryCode && EU_COUNTRIES.includes(countryCode)) {
          return true;
        }
      }
    } catch (apiError) {
      console.warn('IP geolocation API failed, using timezone fallback');
    }

    // Method 3: Check for EU language preferences
    const userLang = navigator.language.split('-')[1]; // Get country code from language
    if (userLang && EU_COUNTRIES.includes(userLang.toUpperCase())) {
      return true;
    }

    // Default to non-EU if detection fails
    return false;

  } catch (error) {
    console.error('Error detecting user location:', error);
    // On error, default to stricter GDPR compliance for safety
    return true;
  }
}

/**
 * Gets user's approximate location info for display purposes
 */
export async function getUserLocationInfo(): Promise<{
  country: string | null;
  countryCode: string | null;
  isEU: boolean;
}> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      return {
        country: data.country_name || null,
        countryCode: data.country_code || null,
        isEU: EU_COUNTRIES.includes(data.country_code)
      };
    }
  } catch (error) {
    console.warn('Could not fetch location info:', error);
  }

  const isEU = await isEUUser();
  return {
    country: null,
    countryCode: null,
    isEU
  };
}
