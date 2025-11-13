"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Globe, Save } from "lucide-react";

interface LanguageOption {
  code: string;
  name: string;
}

interface LanguageSettingsData {
  enabledLocales: string[];
  defaultLocale: string;
  availableLocales: Record<string, string>;
}

export function LanguageSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabledLocales, setEnabledLocales] = useState<string[]>([]);
  const [defaultLocale, setDefaultLocale] = useState<string>("en");
  const [availableLocales, setAvailableLocales] = useState<LanguageOption[]>([]);

  // Fetch current language settings
  useEffect(() => {
    fetchLanguageSettings();
  }, []);

  const fetchLanguageSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/languages");

      if (!response.ok) {
        throw new Error("Failed to fetch language settings");
      }

      const data: LanguageSettingsData = await response.json();

      setEnabledLocales(data.enabledLocales);
      setDefaultLocale(data.defaultLocale);

      // Convert availableLocales object to array
      const localesArray = Object.entries(data.availableLocales).map(([code, name]) => ({
        code,
        name,
      }));
      setAvailableLocales(localesArray);
    } catch (error) {
      console.error("Error fetching language settings:", error);
      toast({
        title: "Error",
        description: "Failed to load language settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLocale = (localeCode: string, checked: boolean) => {
    if (checked) {
      setEnabledLocales([...enabledLocales, localeCode]);
    } else {
      // Prevent disabling if it's the only enabled locale
      if (enabledLocales.length === 1) {
        toast({
          title: "Cannot Disable",
          description: "At least one language must be enabled",
          variant: "destructive",
        });
        return;
      }

      // If disabling the default locale, change default to first remaining enabled locale
      if (localeCode === defaultLocale) {
        const remainingLocales = enabledLocales.filter((l) => l !== localeCode);
        setDefaultLocale(remainingLocales[0]);
      }

      setEnabledLocales(enabledLocales.filter((l) => l !== localeCode));
    }
  };

  const handleDefaultLocaleChange = (localeCode: string) => {
    // Ensure the locale is enabled before setting as default
    if (!enabledLocales.includes(localeCode)) {
      setEnabledLocales([...enabledLocales, localeCode]);
    }
    setDefaultLocale(localeCode);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validation
      if (enabledLocales.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one language must be enabled",
          variant: "destructive",
        });
        return;
      }

      if (!enabledLocales.includes(defaultLocale)) {
        toast({
          title: "Validation Error",
          description: "Default language must be one of the enabled languages",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/admin/languages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabledLocales,
          defaultLocale,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update language settings");
      }

      toast({
        title: "Success",
        description: "Language settings updated successfully",
      });

      // Trigger a reload to update the language switcher
      window.dispatchEvent(new Event("languageSettingsUpdated"));
    } catch (error) {
      console.error("Error saving language settings:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save language settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language Settings
          </CardTitle>
          <CardDescription>
            Configure which languages are available to users
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Language Settings
        </CardTitle>
        <CardDescription>
          Select which languages are available for users on the website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enabled Languages Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-3">Available Languages</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Check the languages you want to make available to users
            </p>
          </div>

          <div className="space-y-3">
            {availableLocales.map((locale) => {
              const isEnabled = enabledLocales.includes(locale.code);
              const isDefault = locale.code === defaultLocale;

              return (
                <div
                  key={locale.code}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={locale.code}
                      checked={isEnabled}
                      onCheckedChange={(checked) =>
                        handleToggleLocale(locale.code, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={locale.code}
                      className="cursor-pointer font-medium"
                    >
                      {locale.name}
                    </Label>
                  </div>

                  {isDefault && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      Default
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Default Language Section */}
        {enabledLocales.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <h3 className="text-sm font-medium mb-2">Default Language</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select which language should be the default for new users
              </p>
            </div>

            <RadioGroup value={defaultLocale} onValueChange={handleDefaultLocaleChange}>
              <div className="space-y-2">
                {availableLocales
                  .filter((locale) => enabledLocales.includes(locale.code))
                  .map((locale) => (
                    <div key={locale.code} className="flex items-center space-x-2">
                      <RadioGroupItem value={locale.code} id={`default-${locale.code}`} />
                      <Label htmlFor={`default-${locale.code}`} className="cursor-pointer">
                        {locale.name}
                      </Label>
                    </div>
                  ))}
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving || enabledLocales.length === 0}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
