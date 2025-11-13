"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircleQuestion } from "lucide-react";
import Link from "next/link";

/**
 * FAQs Page
 * Frequently asked questions organized by category
 */
export default function FAQsPage() {
  useScrollAnimation();

  const faqCategories = [
    {
      category: "General Questions",
      questions: [
        {
          q: "What is Flight Booking and how does it work?",
          a: "Flight Booking is a comprehensive travel platform that allows you to search, compare, and book flights from multiple airlines worldwide. Simply enter your destination, dates, and preferences, and our system will show you the best available options tailored to your needs.",
        },
        {
          q: "Do I need to create an account to book flights?",
          a: "While you can search for flights without an account, creating one offers several benefits including faster checkout, easy access to your booking history, exclusive deals, and the ability to manage your reservations conveniently.",
        },
        {
          q: "Are the prices shown on your website final?",
          a: "Yes, the prices displayed include all mandatory taxes and fees. The final price you see at checkout is what you'll pay. There are no hidden charges, though optional services like baggage insurance or seat selection may incur additional costs.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, and selected digital wallets. All transactions are processed securely through encrypted payment gateways.",
        },
      ],
    },
    {
      category: "Booking & Reservations",
      questions: [
        {
          q: "How do I modify or cancel my booking?",
          a: "Log into your account and navigate to 'My Bookings'. Select the reservation you wish to modify or cancel and follow the prompts. Please note that modification and cancellation policies vary by airline and fare type. Fees may apply.",
        },
        {
          q: "Can I book flights for someone else?",
          a: "Yes, you can book flights for other passengers. Simply enter their details during the booking process. Ensure all names match the traveler's passport or government-issued ID exactly as shown on the document.",
        },
        {
          q: "What happens after I complete my booking?",
          a: "You'll receive an immediate confirmation email with your booking reference number and e-ticket. This email contains all essential flight details, including departure times, baggage allowances, and check-in instructions.",
        },
        {
          q: "How far in advance can I book a flight?",
          a: "Flight availability typically opens 11-12 months before departure. However, this varies by airline. We recommend booking 2-3 months in advance for domestic flights and 3-6 months for international travel to secure the best prices.",
        },
      ],
    },
    {
      category: "Payments & Refunds",
      questions: [
        {
          q: "Is my payment information secure?",
          a: "Absolutely. We use industry-standard SSL encryption and comply with PCI DSS requirements. Your payment information is never stored on our servers and is processed directly through secure payment gateways.",
        },
        {
          q: "How long does it take to process a refund?",
          a: "Refund processing times vary depending on the airline's policy and your payment method. Typically, refunds are initiated within 7-14 business days after approval. Credit card refunds may take an additional 5-10 business days to appear on your statement.",
        },
        {
          q: "Can I get a refund if I cancel my flight?",
          a: "Refund eligibility depends on your ticket type. Refundable tickets can be cancelled with a full or partial refund, while non-refundable tickets typically offer credit for future travel minus applicable fees. Travel insurance may provide additional protection.",
        },
        {
          q: "What if the airline cancels my flight?",
          a: "If an airline cancels your flight, you're entitled to either a full refund or rebooking on an alternative flight at no additional cost. We'll notify you immediately and help facilitate your preferred option.",
        },
      ],
    },
    {
      category: "Travel Documents & Check-in",
      questions: [
        {
          q: "What documents do I need to travel?",
          a: "For domestic flights, a government-issued photo ID is required. For international travel, you'll need a valid passport (with at least 6 months validity beyond your return date) and any necessary visas. Some destinations may also require proof of vaccination or health declarations.",
        },
        {
          q: "When should I check in for my flight?",
          a: "Online check-in typically opens 24-48 hours before departure. We recommend checking in online to save time at the airport. For domestic flights, arrive at least 2 hours before departure; for international flights, arrive 3-4 hours early.",
        },
        {
          q: "Can I select my seat when booking?",
          a: "Seat selection availability depends on the airline and fare class. Some airlines include free seat selection, while others charge a fee. Premium seats (extra legroom, front rows) usually require an additional fee regardless of ticket type.",
        },
        {
          q: "What are the baggage allowance rules?",
          a: "Baggage allowances vary by airline, route, and fare class. Typically, economy passengers receive 1 checked bag (up to 23kg) and 1 carry-on bag. Premium classes often include additional baggage. Check your booking confirmation for specific allowances.",
        },
      ],
    },
    {
      category: "Customer Support",
      questions: [
        {
          q: "How can I contact customer support?",
          a: "Our 24/7 customer support team is available via email at support@flightbooking.com, through live chat on our website, or by calling our toll-free number. Average response time is under 2 hours for emails and immediate for live chat.",
        },
        {
          q: "What if I encounter issues during booking?",
          a: "If you experience technical difficulties during the booking process, try clearing your browser cache or using a different browser. If problems persist, our support team can assist you in completing your reservation over the phone or via email.",
        },
        {
          q: "Can I request special assistance for my flight?",
          a: "Yes, we can help arrange special services including wheelchair assistance, special meals, traveling with pets, or unaccompanied minor services. Contact us at least 48 hours before departure to ensure proper arrangements.",
        },
        {
          q: "Do you offer travel insurance?",
          a: "Yes, we partner with leading travel insurance providers to offer comprehensive coverage including trip cancellation, medical emergencies, lost baggage, and travel delays. Insurance can be added during the booking process.",
        },
      ],
    },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50/40">
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
                <MessageCircleQuestion className="w-4 h-4" />
                HELP & SUPPORT
              </span>
            </div>

            <h1
              className="font-bold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent"
              style={{
                fontSize: "clamp(2rem, 5vw + 1rem, 4rem)",
                lineHeight: "1.1",
              }}
            >
              Frequently Asked Questions
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Find quick answers to common questions about bookings, payments,
              travel documents, and more.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs Content */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {category.category}
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                </div>

                <Accordion
                  type="single"
                  collapsible
                  className="w-full space-y-4"
                >
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`${categoryIndex}-${faqIndex}`}
                      className="border border-gray-200 rounded-lg px-6 hover:border-blue-300 transition-colors"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-5">
                        <span className="font-semibold text-gray-900 pr-4">
                          {faq.q}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 leading-relaxed pb-5">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Still Have Questions?
            </h2>
            <p className="text-lg text-gray-600">
              Can&apos;t find the answer you&apos;re looking for? Our support
              team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                href="/help-center"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Visit Help Center
              </Link>
              <Link
                href="mailto:support@flightbooking.com"
                className="px-8 py-3 bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
