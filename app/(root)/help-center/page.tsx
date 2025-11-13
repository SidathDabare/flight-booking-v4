"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HelpCircle,
  Plane,
  CreditCard,
  User,
  Mail,
  Shield,
  FileText,
  Calendar,
  MapPin,
} from "lucide-react";
import Link from "next/link";

/**
 * Help Center Page
 * Provides quick access to common help topics and support resources
 */
export default function HelpCenterPage() {
  useScrollAnimation();

  const helpTopics = [
    {
      icon: Plane,
      title: "Flight Bookings",
      description:
        "Learn how to search, book, and manage your flight reservations",
      topics: [
        "How to search for flights",
        "Booking a flight",
        "Modifying your reservation",
        "Cancellation policy",
      ],
    },
    {
      icon: CreditCard,
      title: "Payments & Refunds",
      description:
        "Information about payment methods, pricing, and refund requests",
      topics: [
        "Accepted payment methods",
        "Understanding your invoice",
        "Requesting a refund",
        "Payment security",
      ],
    },
    {
      icon: User,
      title: "Account Management",
      description: "Manage your profile, preferences, and account settings",
      topics: [
        "Creating an account",
        "Updating profile information",
        "Password reset",
        "Account security",
      ],
    },
    {
      icon: Calendar,
      title: "Travel Planning",
      description: "Tips and guides for planning your perfect trip",
      topics: [
        "Best time to book",
        "Destination guides",
        "Travel insurance",
        "Visa requirements",
      ],
    },
    {
      icon: MapPin,
      title: "Check-in & Travel",
      description: "Everything you need to know about check-in and travel day",
      topics: [
        "Online check-in",
        "Baggage allowance",
        "Airport procedures",
        "Travel documents",
      ],
    },
    {
      icon: Shield,
      title: "Safety & Security",
      description: "Learn about our security measures and travel safety tips",
      topics: [
        "Data protection",
        "Secure transactions",
        "Travel safety tips",
        "Emergency contacts",
      ],
    },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-semibold text-blue-700 border border-blue-200/50 shadow-sm">
                <HelpCircle className="w-4 h-4" />
                SUPPORT CENTER
              </span>
            </div>

            <h1
              className="font-bold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent"
              style={{
                fontSize: "clamp(2rem, 5vw + 1rem, 4rem)",
                lineHeight: "1.1",
              }}
            >
              How Can We Help You?
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions and get the support you need for
              a smooth travel experience.
            </p>
          </div>
        </div>
      </section>

      {/* Help Topics Grid */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {helpTopics.map((topic, index) => {
                const Icon = topic.icon;
                return (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-200"
                  >
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{topic.title}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {topic.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {topic.topics.map((item, idx) => (
                          <li key={idx}>
                            <Link
                              href="#"
                              className="text-sm text-gray-700 hover:text-blue-600 hover:translate-x-1 inline-block transition-all duration-200"
                            >
                              → {item}
                            </Link>
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

      {/* Contact Support Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Still Need Help?
              </h2>
              <p className="text-lg text-gray-600">
                Our support team is available 24/7 to assist you with any
                questions or concerns.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-center">Email Support</CardTitle>
                  <CardDescription className="text-center">
                    Get a response within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Link
                    href="mailto:support@flightbooking.com"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    support@flightbooking.com
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-center">FAQs</CardTitle>
                  <CardDescription className="text-center">
                    Browse frequently asked questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Link
                    href="/faqs"
                    className="text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    View All FAQs →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
