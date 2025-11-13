"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Map, Home, Info, Briefcase, Plane, HelpCircle, Shield, FileText } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Sitemap Page
 * Displays all available pages organized by category for easy navigation
 */
export default function SitemapPage() {
  useScrollAnimation();

  // Organize routes by logical categories
  const siteStructure = [
    {
      category: "Main Pages",
      icon: Home,
      description: "Primary navigation pages",
      links: [
        { name: "Home", path: "/", description: "Search and book flights" },
        { name: "About Us", path: "/about", description: "Learn about our company" },
        { name: "Services", path: "/services", description: "Explore our travel services" },
      ]
    },
    {
      category: "Booking & Travel",
      icon: Plane,
      description: "Flight search and booking",
      links: [
        { name: "Search Flights", path: "/flights", description: "Find and compare flights" },
        { name: "My Bookings", path: "/client", description: "Manage your reservations" },
        { name: "Booking Confirmation", path: "/payment-success", description: "View booking details" },
      ]
    },
    {
      category: "Support & Help",
      icon: HelpCircle,
      description: "Customer support resources",
      links: [
        { name: "Help Center", path: "/help-center", description: "Browse help topics" },
        { name: "FAQs", path: "/faqs", description: "Frequently asked questions" },
      ]
    },
    {
      category: "Legal & Privacy",
      icon: Shield,
      description: "Legal documents and policies",
      links: [
        { name: "Privacy Policy", path: "/privacy", description: "How we protect your data" },
        { name: "Terms of Service", path: "/terms", description: "Terms and conditions" },
        { name: "Cookie Settings", path: "/cookie-settings", description: "Manage cookie preferences" },
        { name: "Accessibility", path: "/accessibility", description: "Accessibility features" },
      ]
    },
    {
      category: "User Account",
      icon: Briefcase,
      description: "Account management",
      links: [
        { name: "Dashboard", path: "/client", description: "Your account overview" },
        { name: "Profile", path: "/client/profile", description: "Update your information" },
        { name: "My Orders", path: "/client/orders", description: "View order history" },
        { name: "Messages", path: "/client/messages", description: "Customer support messages" },
      ]
    }
  ];

  return (
    <div className="w-full overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 left-10 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-green-100 rounded-full text-sm font-semibold text-blue-700 border border-blue-200/50 shadow-sm">
                <Map className="w-4 h-4" />
                SITE NAVIGATION
              </span>
            </div>

            <h1
              className="font-bold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent"
              style={{
                fontSize: "clamp(2rem, 5vw + 1rem, 3.5rem)",
                lineHeight: "1.1",
              }}
            >
              Sitemap
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Find all pages and resources available on Flight Booking. Navigate easily to any section of our website.
            </p>
          </div>
        </div>
      </section>

      {/* Sitemap Content */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {siteStructure.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="border-2 hover:border-blue-300 transition-colors">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{category.category}</CardTitle>
                        <CardDescription className="text-base">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {category.links.map((link, linkIndex) => (
                        <Link
                          key={linkIndex}
                          href={link.path}
                          className="group p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:bg-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                {link.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {link.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <FileText className="w-12 h-12 text-blue-600 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">
              Need Help Finding Something?
            </h2>
            <p className="text-gray-600">
              If you can&apos;t find what you&apos;re looking for, visit our Help Center or contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/help-center"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Visit Help Center
              </Link>
              <Link
                href="/faqs"
                className="px-6 py-3 bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                Browse FAQs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
