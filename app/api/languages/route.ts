import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import { Settings } from "@/lib/db/models/Settings";
import { locales, localeNames, Locale } from "@/i18n/config";

// GET - Fetch enabled languages (public endpoint)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const settings = await Settings.findOne();

    // Fallback to all languages if settings don't exist
    if (!settings || !settings.languages) {
      return NextResponse.json({
        enabledLocales: ['en', 'it', 'si'],
        defaultLocale: 'en',
        localeNames: Object.fromEntries(
          locales.map((locale) => [locale, localeNames[locale]])
        ),
      });
    }

    return NextResponse.json({
      enabledLocales: settings.languages.enabledLocales,
      defaultLocale: settings.languages.defaultLocale,
      localeNames: Object.fromEntries(
        settings.languages.enabledLocales.map((locale: Locale) => [
          locale,
          localeNames[locale],
        ])
      ),
    });
  } catch (error) {
    console.error("Error fetching enabled languages:", error);
    // Fallback to all languages on error
    return NextResponse.json({
      enabledLocales: ['en', 'it', 'si'],
      defaultLocale: 'en',
      localeNames: Object.fromEntries(
        locales.map((locale) => [locale, localeNames[locale]])
      ),
    });
  }
}
