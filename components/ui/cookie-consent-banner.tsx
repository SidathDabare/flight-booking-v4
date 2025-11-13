"use client";

import { useState, useEffect } from "react";
import { Cookie, X, Settings, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isEUUser } from "@/lib/geolocation";
import {
  getCookiePreferences,
  saveCookiePreferences,
  acceptAllCookies,
  rejectOptionalCookies,
  getDefaultPreferences,
  type CookiePreferences
} from "@/lib/cookie-consent";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CookieCategory {
  id: keyof Omit<CookiePreferences, 'timestamp' | 'version' | 'isEU'>;
  name: string;
  description: string;
  required: boolean;
}

/**
 * GDPR-Compliant Cookie Consent Banner
 * Shows different UI for EU vs Non-EU users
 */
export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isEU, setIsEU] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<Omit<CookiePreferences, 'timestamp' | 'version'>>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    isEU: false
  });

  const cookieCategories: CookieCategory[] = [
    {
      id: 'necessary',
      name: 'Strictly Necessary',
      description: 'Essential for the website to function. These cannot be disabled.',
      required: true
    },
    {
      id: 'functional',
      name: 'Functional',
      description: 'Enable enhanced functionality like remembering your preferences.',
      required: false
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Help us understand how visitors use our website to improve user experience.',
      required: false
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Used to deliver personalized advertisements relevant to you.',
      required: false
    }
  ];

  useEffect(() => {
    async function checkConsent() {
      try {
        // Check if user already gave consent
        const existingConsent = getCookiePreferences();

        if (existingConsent) {
          // User already consented, hide banner
          setIsVisible(false);
          setIsLoading(false);
          return;
        }

        // Detect user location
        const userIsEU = await isEUUser();
        setIsEU(userIsEU);

        // Set default preferences based on location
        const defaults = getDefaultPreferences(userIsEU);
        setPreferences(defaults);

        // Show banner for first-time visitors
        setIsVisible(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking cookie consent:', error);
        // On error, assume EU for safety (stricter compliance)
        setIsEU(true);
        setPreferences(getDefaultPreferences(true));
        setIsVisible(true);
        setIsLoading(false);
      }
    }

    checkConsent();
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies(isEU);
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    rejectOptionalCookies(isEU);
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    saveCookiePreferences(preferences, isEU);
    setIsVisible(false);
    setShowSettings(false);
  };

  const toggleCategory = (categoryId: keyof Omit<CookiePreferences, 'timestamp' | 'version' | 'isEU'>) => {
    if (categoryId === 'necessary') return; // Cannot toggle necessary cookies

    setPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Don't render anything while loading or if consent already given
  if (isLoading || !isVisible) return null;

  return (
    <>
      {/* Main Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 animate-slide-up">
        <Card className="max-w-6xl mx-auto border-2 border-blue-200 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              {/* Icon & Content */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {isEU ? 'Cookie Consent Required' : 'We Use Cookies'}
                    </h3>
                    {isEU && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold">
                        <Shield className="w-3 h-3" />
                        GDPR Protected
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">
                  {isEU ? (
                    <>
                      We respect your privacy. This website uses cookies to enhance your browsing experience, analyze site traffic, and deliver personalized content. Under GDPR, we need your explicit consent before using optional cookies. You have full control over which cookies you accept.
                    </>
                  ) : (
                    <>
                      We use cookies to improve your experience on our site, analyze usage, and provide personalized content. By continuing to use our website, you agree to our use of cookies.
                    </>
                  )}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Link href="/privacy" className="underline hover:text-blue-600">
                    Privacy Policy
                  </Link>
                  <span>•</span>
                  <Link href="/cookie-settings" className="underline hover:text-blue-600">
                    Cookie Policy
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
                <Button
                  onClick={handleAcceptAll}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept All
                </Button>

                {isEU && (
                  <>
                    <Button
                      onClick={handleRejectAll}
                      variant="outline"
                      className="border-2 border-gray-300 hover:border-red-400 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject Optional
                    </Button>

                    <Button
                      onClick={() => setShowSettings(true)}
                      variant="outline"
                      className="border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Customize
                    </Button>
                  </>
                )}

                {!isEU && (
                  <Button
                    onClick={handleRejectAll}
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Decline
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Dialog (GDPR - EU Users Only) */}
      {isEU && (
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Settings className="w-6 h-6 text-blue-600" />
                Customize Cookie Preferences
              </DialogTitle>
              <DialogDescription>
                Control which cookies you want to accept. Necessary cookies are always enabled as they are essential for the website to function.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {cookieCategories.map((category) => {
                const isEnabled = preferences[category.id];

                return (
                  <Card
                    key={category.id}
                    className={cn(
                      "border-2 transition-colors",
                      isEnabled ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-base">{category.name}</CardTitle>
                            {category.required && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => toggleCategory(category.id)}
                          disabled={category.required}
                          className="data-[state=checked]:bg-orange-500"
                        />
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                onClick={handleSavePreferences}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                Save My Preferences
              </Button>
              <Button
                onClick={handleAcceptAll}
                variant="outline"
                className="flex-1"
              >
                Accept All
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
