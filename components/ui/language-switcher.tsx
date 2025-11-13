"use client";

import { useTransition, useEffect, useState } from "react";
import { Globe, Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { type Locale } from "@/i18n/config";
import { useLanguageSettings } from "@/lib/hooks/use-language-settings";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale() as Locale;
  const { enabledLocales, defaultLocale, localeNames, loading } = useLanguageSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    startTransition(() => {
      // Set cookie for locale
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
      // Reload to apply new locale
      window.location.reload();
    });
  };

  // Check if current locale is still enabled
  useEffect(() => {
    if (!mounted || loading) return;

    // If current locale is not in enabled locales, switch to default
    if (!enabledLocales.includes(currentLocale)) {
      startTransition(() => {
        document.cookie = `NEXT_LOCALE=${defaultLocale}; path=/; max-age=31536000`;
        window.location.reload();
      });
    }
  }, [currentLocale, enabledLocales, defaultLocale, loading, mounted, startTransition]);

  if (!mounted || loading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        disabled
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  // Don't show switcher if only one language is enabled
  if (enabledLocales.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:text-red-1"
          disabled={isPending}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {localeNames[currentLocale] || currentLocale}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px] rounded-sm">
        {enabledLocales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale as Locale)}
            className={cn(
              "cursor-pointer",
              currentLocale === locale && "bg-accent"
            )}
          >
            {localeNames[locale] || locale}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
