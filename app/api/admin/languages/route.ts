import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/mongoose";
import { Settings } from "@/lib/db/models/Settings";
import { locales, localeNames } from "@/i18n/config";

// GET - Fetch current language settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await dbConnect();

    let settings = await Settings.findOne();

    // Initialize settings if they don't exist
    if (!settings) {
      settings = await Settings.create({
        carousel: { items: [], isEnabled: true },
        offers: { isEnabled: true },
        languages: {
          enabledLocales: ['en', 'it', 'si'],
          defaultLocale: 'en',
        },
      });
    }

    // Ensure languages field exists (for backward compatibility)
    if (!settings.languages) {
      settings.languages = {
        enabledLocales: ['en', 'it', 'si'],
        defaultLocale: 'en',
      };
      await settings.save();
    }

    return NextResponse.json({
      enabledLocales: settings.languages.enabledLocales,
      defaultLocale: settings.languages.defaultLocale,
      availableLocales: Object.fromEntries(
        locales.map((locale) => [locale, localeNames[locale]])
      ),
    });
  } catch (error) {
    console.error("Error fetching language settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch language settings" },
      { status: 500 }
    );
  }
}

// POST - Update language settings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { enabledLocales, defaultLocale } = body;

    // Validation
    if (!enabledLocales || !Array.isArray(enabledLocales)) {
      return NextResponse.json(
        { error: "enabledLocales must be an array" },
        { status: 400 }
      );
    }

    if (enabledLocales.length === 0) {
      return NextResponse.json(
        { error: "At least one language must be enabled" },
        { status: 400 }
      );
    }

    // Validate all locales are valid
    const invalidLocales = enabledLocales.filter(
      (locale) => !locales.includes(locale as any)
    );
    if (invalidLocales.length > 0) {
      return NextResponse.json(
        { error: `Invalid locales: ${invalidLocales.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate default locale is in enabled locales
    if (!enabledLocales.includes(defaultLocale)) {
      return NextResponse.json(
        { error: "Default locale must be one of the enabled locales" },
        { status: 400 }
      );
    }

    await dbConnect();

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        carousel: { items: [], isEnabled: true },
        offers: { isEnabled: true },
        languages: {
          enabledLocales,
          defaultLocale,
        },
      });
    } else {
      settings.languages = {
        enabledLocales,
        defaultLocale,
      };
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      enabledLocales: settings.languages.enabledLocales,
      defaultLocale: settings.languages.defaultLocale,
    });
  } catch (error) {
    console.error("Error updating language settings:", error);
    return NextResponse.json(
      { error: "Failed to update language settings" },
      { status: 500 }
    );
  }
}
