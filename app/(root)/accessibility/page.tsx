"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Accessibility,
  Eye,
  Keyboard,
  Volume2,
  MousePointer,
  Smartphone,
  Languages,
  MessageSquare,
  Check
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Accessibility Page
 * Details the accessibility features and WCAG compliance of the website
 */
export default function AccessibilityPage() {
  useScrollAnimation();

  const accessibilityFeatures = [
    {
      icon: Eye,
      title: "Visual Accessibility",
      features: [
        "High contrast text and backgrounds meeting WCAG AA standards",
        "Scalable text sizes - use browser zoom (Ctrl/Cmd +/-)",
        "Clear visual hierarchy with proper heading structure",
        "Alternative text for all images and icons",
        "Color is not the only means of conveying information",
        "Focus indicators on all interactive elements"
      ]
    },
    {
      icon: Keyboard,
      title: "Keyboard Navigation",
      features: [
        "Full keyboard navigation support - Tab to move forward, Shift+Tab to move backward",
        "Enter or Space to activate buttons and links",
        "Arrow keys for menu and dropdown navigation",
        "Escape key to close dialogs and popups",
        "Skip to main content link for faster navigation",
        "Logical tab order following visual layout"
      ]
    },
    {
      icon: Volume2,
      title: "Screen Reader Support",
      features: [
        "Semantic HTML with proper ARIA labels",
        "Descriptive link text and button labels",
        "Form fields with associated labels",
        "Status messages and error notifications announced",
        "Tested with NVDA, JAWS, and VoiceOver",
        "Live regions for dynamic content updates"
      ]
    },
    {
      icon: MousePointer,
      title: "Motor Accessibility",
      features: [
        "Large clickable areas (minimum 44×44 pixels)",
        "No time limits on interactions",
        "Easy-to-click buttons with adequate spacing",
        "Forms support autocomplete for easier data entry",
        "Drag-and-drop alternatives available",
        "Voice control compatible"
      ]
    },
    {
      icon: Smartphone,
      title: "Mobile Accessibility",
      features: [
        "Responsive design works on all screen sizes",
        "Touch targets sized appropriately for mobile",
        "Pinch-to-zoom enabled on all pages",
        "Orientation support (portrait and landscape)",
        "Works with mobile screen readers (TalkBack, VoiceOver)",
        "Reduced motion option for users sensitive to animation"
      ]
    },
    {
      icon: Languages,
      title: "Content Accessibility",
      features: [
        "Clear and simple language used throughout",
        "Important information highlighted and easy to find",
        "Consistent navigation and layout",
        "Descriptive page titles and headings",
        "Error messages provide clear guidance",
        "Help and support readily available"
      ]
    }
  ];

  const wcagCompliance = [
    {
      level: "WCAG 2.1 Level A",
      description: "Meets minimum accessibility requirements",
      status: "Compliant"
    },
    {
      level: "WCAG 2.1 Level AA",
      description: "Target standard for web accessibility",
      status: "Compliant"
    }
  ];

  return (
    <div className="w-full overflow-x-hidden bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-purple-50 via-white to-blue-50/40 dark:from-purple-950/20 dark:via-gray-950 dark:to-blue-950/20">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full text-sm font-semibold text-purple-700 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50 shadow-sm">
                <Accessibility className="w-4 h-4" />
                INCLUSIVE DESIGN
              </span>
            </div>

            <h1
              className="font-bold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent"
              style={{
                fontSize: "clamp(2rem, 5vw + 1rem, 3.5rem)",
                lineHeight: "1.1",
              }}
            >
              Accessibility Statement
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We&apos;re committed to ensuring our website is accessible to everyone, including people with disabilities. Learn about our accessibility features and standards.
            </p>
          </div>
        </div>
      </section>

      {/* WCAG Compliance Section */}
      <section className="py-12 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Web Accessibility Standards
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {wcagCompliance.map((item, index) => (
                <Card key={index} className="border-2 border-green-200 dark:border-green-800 bg-white dark:bg-gray-900">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-green-800">{item.level}</CardTitle>
                        <CardDescription className="mt-1">{item.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      ✓ {item.status}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Our Accessibility Features
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We&apos;ve implemented comprehensive features to ensure everyone can use our platform effectively.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {accessibilityFeatures.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-purple-600 mt-1 flex-shrink-0">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Keyboard Shortcuts Guide */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Keyboard Shortcuts
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-semibold text-gray-900">Navigate Forward</span>
                    <kbd className="px-3 py-1 bg-white border-2 border-gray-300 rounded font-mono text-sm">
                      Tab
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-semibold text-gray-900">Navigate Backward</span>
                    <kbd className="px-3 py-1 bg-white border-2 border-gray-300 rounded font-mono text-sm">
                      Shift + Tab
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-gray-900">Activate Element</span>
                    <kbd className="px-3 py-1 bg-white border-2 border-gray-300 rounded font-mono text-sm">
                      Enter
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-gray-900">Close Dialog</span>
                    <kbd className="px-3 py-1 bg-white border-2 border-gray-300 rounded font-mono text-sm">
                      Esc
                    </kbd>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <MessageSquare className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Help Us Improve
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We continuously work to improve our accessibility. If you encounter any barriers or have suggestions, please let us know.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="mailto:accessibility@flightbooking.com"
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Report Accessibility Issue
              </Link>
              <Link
                href="/help-center"
                className="px-8 py-3 bg-white border-2 border-gray-300 hover:border-purple-500 text-gray-700 hover:text-purple-600 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                Visit Help Center
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
