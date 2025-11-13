"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { FileText, Calendar } from "lucide-react";

/**
 * Terms of Service Page
 * Legal terms and conditions for using the service
 */
export default function TermsOfServicePage() {
  useScrollAnimation();

  const lastUpdated = "January 15, 2025";

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: [
        "By accessing and using Flight Booking's website and services, you accept and agree to be bound by the terms and conditions outlined in this agreement. If you do not agree to these terms, please do not use our services.",
        "These Terms of Service constitute a legally binding agreement between you (the user) and Flight Booking. We reserve the right to modify these terms at any time, and such modifications will be effective immediately upon posting on our website.",
      ],
    },
    {
      title: "2. Use of Services",
      content: [
        "Flight Booking provides a platform for searching, comparing, and booking flights. You agree to use our services only for lawful purposes and in accordance with these terms.",
        "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.",
        "You agree not to: (a) use the service for any illegal purpose, (b) attempt to gain unauthorized access to our systems, (c) interfere with or disrupt the service, or (d) use automated systems to access the service without our express written permission.",
      ],
    },
    {
      title: "3. Booking and Payments",
      content: [
        "All bookings are subject to availability and confirmation by the respective airlines. Prices displayed on our website are subject to change without notice until payment is received and booking is confirmed.",
        "Payment must be made in full at the time of booking using one of our accepted payment methods. All prices are quoted in the currency specified at checkout and include applicable taxes and fees unless otherwise stated.",
        "We act as an intermediary between you and the airlines. The airline's terms and conditions apply to your flight, including baggage policies, check-in requirements, and cancellation policies.",
        "Booking confirmations will be sent to the email address provided during registration. It is your responsibility to ensure that the email address is accurate and that you check your email regularly.",
      ],
    },
    {
      title: "4. Cancellations and Refunds",
      content: [
        "Cancellation policies vary by airline and ticket type. Refundability depends on the fare rules associated with your ticket. Non-refundable tickets may be eligible for travel credit minus applicable fees.",
        "If you need to cancel your booking, please contact us as soon as possible. Cancellation fees may apply as per the airline's policy and our service terms.",
        "Refunds, when applicable, will be processed within 7-14 business days after approval. The refund will be credited to the original payment method. Please note that your bank or credit card company may take an additional 5-10 business days to process the refund.",
        "In the event of airline-initiated cancellations or significant schedule changes, you are entitled to either a full refund or rebooking on an alternative flight at no additional cost.",
      ],
    },
    {
      title: "5. User Responsibilities",
      content: [
        "You are responsible for ensuring that all passenger information provided during booking is accurate and matches the traveler's identification documents exactly as they appear.",
        "You must verify visa requirements, health documentation, and travel restrictions for your destination. Flight Booking is not responsible for denied boarding or entry due to inadequate documentation.",
        "It is your responsibility to arrive at the airport with sufficient time for check-in, security screening, and boarding as recommended by the airline.",
        "You agree to comply with all applicable laws, airline policies, and airport regulations during your travel.",
      ],
    },
    {
      title: "6. Limitation of Liability",
      content: [
        "Flight Booking acts solely as an intermediary between travelers and airlines. We are not responsible for airline delays, cancellations, lost baggage, or any issues arising from airline operations.",
        "Our liability is limited to the amount paid for our services, excluding the ticket cost paid to airlines. We are not liable for any indirect, incidental, special, or consequential damages.",
        "We make every effort to ensure the accuracy of information on our website, but we do not guarantee that all information is complete, accurate, or up-to-date. Flight schedules, prices, and availability are subject to change.",
        "We are not responsible for any losses or damages resulting from technical issues, service interruptions, or unauthorized access to our systems beyond our reasonable control.",
      ],
    },
    {
      title: "7. Intellectual Property",
      content: [
        "All content on the Flight Booking website, including text, graphics, logos, images, and software, is the property of Flight Booking or its licensors and is protected by intellectual property laws.",
        "You may not reproduce, distribute, modify, or create derivative works from any content on our website without our express written permission.",
        "The Flight Booking name, logo, and all related marks are trademarks of Flight Booking. You may not use these marks without our prior written consent.",
      ],
    },
    {
      title: "8. Privacy and Data Protection",
      content: [
        "Your use of our services is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information.",
        "By using our services, you consent to the collection and use of your information as described in our Privacy Policy.",
        "We implement appropriate security measures to protect your personal data, but cannot guarantee absolute security of data transmitted over the internet.",
      ],
    },
    {
      title: "9. Third-Party Links",
      content: [
        "Our website may contain links to third-party websites for your convenience. We do not endorse or assume responsibility for the content, privacy policies, or practices of third-party websites.",
        "Your interactions with third-party websites are solely between you and the third party. We encourage you to review the terms and privacy policies of any third-party websites you visit.",
      ],
    },
    {
      title: "10. Dispute Resolution",
      content: [
        "Any disputes arising from these terms or your use of our services shall be resolved through good faith negotiations. If negotiations fail, disputes will be resolved through binding arbitration in accordance with applicable laws.",
        "You agree to waive any right to participate in class action lawsuits or class-wide arbitration.",
        "These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Flight Booking operates, without regard to its conflict of law provisions.",
      ],
    },
    {
      title: "11. Termination",
      content: [
        "We reserve the right to suspend or terminate your account and access to our services at any time, without prior notice, for violation of these terms or for any other reason we deem appropriate.",
        "Upon termination, your right to use our services will immediately cease. Provisions of these terms that by their nature should survive termination shall remain in effect.",
      ],
    },
    {
      title: "12. Contact Information",
      content: [
        "If you have any questions about these Terms of Service, please contact us at:",
        "Email: legal@flightbooking.com",
        "Phone: +1 (555) 123-4567",
        "Address: 123 Travel Street, Sky City",
      ],
    },
  ];

  return (
    <div className="w-full overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section className="relative w-full py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm">
                <FileText className="w-4 h-4" />
                LEGAL DOCUMENT
              </span>
            </div>

            <h1
              className="font-bold tracking-tight text-gray-900"
              style={{
                fontSize: "clamp(2rem, 5vw + 1rem, 3.5rem)",
                lineHeight: "1.1",
              }}
            >
              Terms of Service
            </h1>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-gray max-w-none">
              {/* Introduction */}
              <div className="mb-12 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <p className="text-gray-700 leading-relaxed m-0">
                  Welcome to Flight Booking. These Terms of Service
                  (&quot;Terms&quot;) govern your access to and use of our
                  website, services, and applications. By using our services,
                  you acknowledge that you have read, understood, and agree to
                  be bound by these Terms. Please read them carefully.
                </p>
              </div>

              {/* Terms Sections */}
              <div className="space-y-10">
                {sections.map((section, index) => (
                  <div key={index} className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {section.title}
                    </h2>
                    <div className="space-y-4">
                      {section.content.map((paragraph, pIndex) => (
                        <p
                          key={pIndex}
                          className="text-gray-700 leading-relaxed"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Note */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600 italic">
                  By continuing to use Flight Booking&apos;s services, you
                  acknowledge that you have read and understood these Terms of
                  Service and agree to be bound by them. These terms represent
                  the entire agreement between you and Flight Booking regarding
                  your use of our services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
