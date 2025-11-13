"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Shield, Calendar } from "lucide-react";

/**
 * Privacy Policy Page
 * Details how we collect, use, and protect user data
 */
export default function PrivacyPolicyPage() {
  useScrollAnimation();

  const lastUpdated = "January 15, 2025";

  const sections = [
    {
      title: "1. Introduction",
      content: [
        "At Flight Booking, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our website and services.",
        "By using our services, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use our services."
      ]
    },
    {
      title: "2. Information We Collect",
      subsections: [
        {
          subtitle: "Personal Information",
          content: [
            "When you create an account or make a booking, we collect personal information including your name, email address, phone number, date of birth, passport information, and payment details.",
            "We may also collect information about your travel preferences, frequent flyer numbers, and special assistance requirements to provide personalized service."
          ]
        },
        {
          subtitle: "Automatically Collected Information",
          content: [
            "When you visit our website, we automatically collect certain information about your device, including your IP address, browser type, operating system, referring URLs, and pages viewed.",
            "We use cookies, web beacons, and similar technologies to collect information about your browsing behavior and interaction with our services. You can control cookies through your browser settings."
          ]
        },
        {
          subtitle: "Information from Third Parties",
          content: [
            "We may receive information about you from airlines, payment processors, and other service providers necessary to complete your bookings and provide our services.",
            "If you connect your account with third-party services (such as social media platforms), we may collect information from those platforms in accordance with their privacy policies."
          ]
        }
      ]
    },
    {
      title: "3. How We Use Your Information",
      content: [
        "We use your personal information to process bookings, communicate with you about your reservations, and provide customer support.",
        "Your information helps us personalize your experience, send relevant offers and promotions, and improve our services based on your preferences and feedback.",
        "We use aggregated and anonymized data for analytics, research, and to understand user behavior and trends.",
        "When required by law or to protect our rights, we may use your information to comply with legal obligations, enforce our terms of service, or respond to legal requests."
      ]
    },
    {
      title: "4. Information Sharing and Disclosure",
      subsections: [
        {
          subtitle: "Service Providers",
          content: [
            "We share your information with airlines, payment processors, and other service providers necessary to complete your bookings and deliver our services.",
            "These third parties are contractually obligated to use your information only for the purposes of providing services to us and are required to maintain appropriate security measures."
          ]
        },
        {
          subtitle: "Business Transfers",
          content: [
            "In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity. We will notify you of any such change in ownership or control of your personal information."
          ]
        },
        {
          subtitle: "Legal Requirements",
          content: [
            "We may disclose your information when required by law, court order, or government regulation, or when we believe disclosure is necessary to protect our rights, your safety, or the safety of others."
          ]
        },
        {
          subtitle: "With Your Consent",
          content: [
            "We may share your information with third parties when you have given us explicit consent to do so."
          ]
        }
      ]
    },
    {
      title: "5. Data Security",
      content: [
        "We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction.",
        "All payment transactions are processed through secure, PCI-DSS compliant payment gateways using SSL encryption. We do not store complete credit card information on our servers.",
        "Our employees and contractors are trained in data protection practices and have access to personal information only on a need-to-know basis.",
        "While we strive to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your data."
      ]
    },
    {
      title: "6. Your Rights and Choices",
      subsections: [
        {
          subtitle: "Access and Correction",
          content: [
            "You have the right to access, review, and update your personal information at any time by logging into your account or contacting us directly.",
            "If you believe any information we hold about you is incorrect or incomplete, you can request corrections."
          ]
        },
        {
          subtitle: "Data Deletion",
          content: [
            "You can request deletion of your personal information, subject to legal and contractual retention requirements. Please note that we may need to retain certain information for legal compliance, dispute resolution, and to prevent fraud."
          ]
        },
        {
          subtitle: "Marketing Communications",
          content: [
            "You can opt out of receiving promotional emails by clicking the unsubscribe link in any marketing email or by updating your communication preferences in your account settings.",
            "Even if you opt out of marketing communications, we will still send you transactional emails related to your bookings and account."
          ]
        },
        {
          subtitle: "Cookies and Tracking",
          content: [
            "You can control cookies through your browser settings. Please note that disabling cookies may limit your ability to use certain features of our website."
          ]
        }
      ]
    },
    {
      title: "7. Data Retention",
      content: [
        "We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.",
        "Booking records and transaction data are typically retained for 7 years to comply with financial and tax regulations.",
        "Account information is retained as long as your account is active. If you close your account, we will delete or anonymize your information within a reasonable timeframe, unless retention is required by law."
      ]
    },
    {
      title: "8. International Data Transfers",
      content: [
        "Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your jurisdiction.",
        "When we transfer your data internationally, we ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable laws.",
        "By using our services, you consent to the transfer of your information to countries outside your country of residence."
      ]
    },
    {
      title: "9. Children's Privacy",
      content: [
        "Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18.",
        "If you are a parent or guardian and believe we have collected information about a child, please contact us immediately, and we will take steps to delete such information."
      ]
    },
    {
      title: "10. Third-Party Links",
      content: [
        "Our website may contain links to third-party websites, including airlines, hotels, and travel partners. This Privacy Policy does not apply to those third-party websites.",
        "We are not responsible for the privacy practices of third-party websites. We encourage you to review the privacy policies of any third-party sites you visit."
      ]
    },
    {
      title: "11. Changes to This Privacy Policy",
      content: [
        "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.",
        "We will notify you of any material changes by posting the updated policy on our website and updating the \"Last Updated\" date. Your continued use of our services after such changes constitutes your acceptance of the updated Privacy Policy.",
        "We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information."
      ]
    },
    {
      title: "12. Contact Us",
      content: [
        "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:",
        "Email: privacy@flightbooking.com",
        "Phone: +1 (555) 123-4567",
        "Address: 123 Travel Street, Sky City",
        "Data Protection Officer: dpo@flightbooking.com"
      ]
    },
    {
      title: "13. Your California Privacy Rights",
      content: [
        "If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete your information, and the right to opt-out of the sale of your personal information.",
        "We do not sell your personal information to third parties. For more information about your California privacy rights, please contact us using the information provided above."
      ]
    },
    {
      title: "14. European Users - GDPR Rights",
      content: [
        "If you are located in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR), including the right to access, rectify, erase, restrict processing, data portability, and object to processing of your personal data.",
        "You also have the right to lodge a complaint with your local data protection authority if you believe we have violated your privacy rights.",
        "We process your personal data based on legitimate interests, contractual necessity, legal obligations, or your consent. You can withdraw consent at any time where we rely on consent as the legal basis for processing."
      ]
    }
  ];

  return (
    <div className="w-full overflow-x-hidden bg-white">
      {/* Hero Section */}
      <section className="relative w-full py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-sm font-semibold text-blue-700 border border-blue-200 shadow-sm">
                <Shield className="w-4 h-4" />
                YOUR PRIVACY MATTERS
              </span>
            </div>

            <h1
              className="font-bold tracking-tight text-gray-900"
              style={{
                fontSize: "clamp(2rem, 5vw + 1rem, 3.5rem)",
                lineHeight: "1.1",
              }}
            >
              Privacy Policy
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
              {/* Introduction Banner */}
              <div className="mb-12 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <p className="text-gray-700 leading-relaxed m-0">
                  Your privacy is important to us. This Privacy Policy explains how Flight Booking collects, uses, shares, and protects your personal information. We are committed to transparency and giving you control over your data.
                </p>
              </div>

              {/* Privacy Sections */}
              <div className="space-y-10">
                {sections.map((section, index) => (
                  <div key={index} className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {section.title}
                    </h2>

                    {section.content && (
                      <div className="space-y-4">
                        {section.content.map((paragraph, pIndex) => (
                          <p key={pIndex} className="text-gray-700 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}

                    {section.subsections && (
                      <div className="space-y-6 ml-4">
                        {section.subsections.map((subsection, subIndex) => (
                          <div key={subIndex} className="space-y-3">
                            <h3 className="text-xl font-semibold text-gray-800">
                              {subsection.subtitle}
                            </h3>
                            <div className="space-y-3">
                              {subsection.content.map((paragraph, pIndex) => (
                                <p key={pIndex} className="text-gray-700 leading-relaxed">
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer Note */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600 italic">
                  This Privacy Policy is effective as of the date stated above. By using our services, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your information as described herein.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
