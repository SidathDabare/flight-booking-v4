"use client";

import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Cookie, Shield, BarChart, Settings, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Cookie Settings Page
 * Allows users to manage cookie preferences and understand how cookies are used
 */
export default function CookieSettingsPage() {
  useScrollAnimation();

  // Cookie preferences state
  const [preferences, setPreferences] = useState({
    necessary: true, // Always enabled, cannot be disabled
    functional: true,
    analytics: false,
    marketing: false,
  });

  const [saved, setSaved] = useState(false);

  // Cookie categories with details
  const cookieCategories = [
    {
      id: "necessary",
      name: "Strictly Necessary Cookies",
      icon: Shield,
      description: "These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility.",
      required: true,
      examples: [
        "Authentication and session management",
        "Security and fraud prevention",
        "Load balancing and performance",
        "User preferences (language, region)"
      ]
    },
    {
      id: "functional",
      name: "Functional Cookies",
      icon: Settings,
      description: "These cookies enable enhanced functionality and personalization, such as remembering your preferences and choices.",
      required: false,
      examples: [
        "Remember login details",
        "Save search filters and preferences",
        "Personalized content recommendations",
        "Chat support functionality"
      ]
    },
    {
      id: "analytics",
      name: "Analytics Cookies",
      icon: BarChart,
      description: "These cookies help us understand how visitors interact with our website, helping us improve user experience and website performance.",
      required: false,
      examples: [
        "Page views and navigation patterns",
        "Time spent on pages",
        "Click tracking and interactions",
        "Error tracking and debugging"
      ]
    },
    {
      id: "marketing",
      name: "Marketing Cookies",
      icon: Cookie,
      description: "These cookies track your browsing habits to deliver personalized advertisements relevant to you and your interests.",
      required: false,
      examples: [
        "Display targeted advertisements",
        "Measure ad campaign effectiveness",
        "Retargeting and remarketing",
        "Social media integration"
      ]
    }
  ];

  const handleToggle = (categoryId: string) => {
    setPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId as keyof typeof prev]
    }));
    setSaved(false);
  };

  const handleSavePreferences = () => {
    // In a real application, this would save to localStorage or send to backend
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    setSaved(true);

    // Show success message for 3 seconds
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const handleAcceptAll = () => {
    setPreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
    setSaved(false);
  };

  const handleRejectAll = () => {
    setPreferences({
      necessary: true, // Can't disable necessary cookies
      functional: false,
      analytics: false,
      marketing: false,
    });
    setSaved(false);
  };

  return (
    <div className="w-full overflow-x-hidden bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-orange-50 via-white to-amber-50/40 dark:from-orange-950/20 dark:via-gray-950 dark:to-amber-950/20">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 left-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full text-sm font-semibold text-orange-700 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/50 shadow-sm">
                <Cookie className="w-4 h-4" />
                PRIVACY CONTROLS
              </span>
            </div>

            <h1
              className="font-bold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent"
              style={{
                fontSize: "clamp(2rem, 5vw + 1rem, 3.5rem)",
                lineHeight: "1.1",
              }}
            >
              Cookie Settings
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Manage your cookie preferences and understand how we use cookies to improve your experience on our website.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleAcceptAll}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Check className="w-4 h-4 mr-2" />
              Accept All Cookies
            </Button>
            <Button
              onClick={handleRejectAll}
              variant="outline"
              className="border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 px-6 py-2 rounded-lg transition-all"
            >
              <X className="w-4 h-4 mr-2" />
              Reject Optional Cookies
            </Button>
          </div>
        </div>
      </section>

      {/* Cookie Categories */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {cookieCategories.map((category) => {
              const Icon = category.icon;
              const isEnabled = preferences[category.id as keyof typeof preferences];

              return (
                <Card
                  key={category.id}
                  className={cn(
                    "border-2 transition-all",
                    isEnabled
                      ? "border-orange-300 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                            isEnabled
                              ? "bg-gradient-to-br from-orange-500 to-amber-600"
                              : "bg-gray-300"
                          )}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{category.name}</CardTitle>
                            {category.required && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <CardDescription className="text-base">
                            {category.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => handleToggle(category.id)}
                          disabled={category.required}
                          className="data-[state=checked]:bg-orange-500"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="ml-16">
                      <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
                      <ul className="space-y-1">
                        {category.examples.map((example, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-orange-600 mt-1 flex-shrink-0">•</span>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Save Button */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <Button
              onClick={handleSavePreferences}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Save My Preferences
            </Button>

            {saved && (
              <div className="flex items-center justify-center gap-2 text-green-600 font-semibold animate-fade-in">
                <Check className="w-5 h-5" />
                <span>Your preferences have been saved successfully!</span>
              </div>
            )}

            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Your preferences will be saved and applied to your browsing experience. You can change these settings at any time by returning to this page.
            </p>
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What Are Cookies?</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Cookies are small text files that are placed on your device when you visit a website. They help websites remember information about your visit, making it easier and more useful for you on future visits.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">How We Use Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies to provide you with a better browsing experience, analyze how our website is used, and deliver relevant content and advertisements. We respect your privacy and give you control over which cookies you accept.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Managing Cookies in Your Browser</h2>
              <p className="text-gray-700 leading-relaxed">
                Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or to alert you when cookies are being sent. However, please note that some parts of our website may not function properly if you disable cookies.
              </p>
            </div>

            <div className="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed">
                For more information about how we collect and use your data, please read our{" "}
                <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
