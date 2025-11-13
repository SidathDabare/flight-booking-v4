import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, type Locale } from './config';

export default getRequestConfig(async () => {
  // Get locale from cookie or use default
  let locale: Locale = defaultLocale;

  try {
    // Only access cookies in a runtime context (not during static generation)
    if (typeof window === 'undefined') {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;

      // Validate that the cookie value is a valid locale
      if (cookieLocale && locales.includes(cookieLocale as Locale)) {
        locale = cookieLocale as Locale;
      }
    }
  } catch (error) {
    // During static generation, cookies are not available
    // Fall back to default locale
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
