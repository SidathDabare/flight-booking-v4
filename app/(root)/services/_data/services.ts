import type { Service } from "../_types";

/**
 * Our comprehensive travel services
 */
export const SERVICES: Service[] = [
  {
    id: "1",
    icon: "Plane",
    title: "Flight Bookings",
    description:
      "Access competitive fares and flexible booking options for domestic and international flights.",
    mainBenefits: [
      "Best price guarantee on all flights",
      "Flexible booking and cancellation policies",
      "Multi-city and round-trip options",
    ],
    extraPerks: [
      "Real-time flight status updates",
      "Seat selection assistance",
      "Special meal requests handling",
      "Travel insurance options",
    ],
    featured: true,
  },
  {
    id: "2",
    icon: "FileText",
    title: "Visa Services",
    description:
      "Expert assistance with visa applications and documentation for hassle-free international travel.",
    mainBenefits: [
      "Complete visa application support",
      "Document verification and preparation",
      "Fast-track processing available",
    ],
    extraPerks: [
      "Tourist visa assistance",
      "Business visa support",
      "Student visa guidance",
      "Transit visa help",
      "Visa extension services",
    ],
  },
  {
    id: "3",
    icon: "Hotel",
    title: "Hotel Reservations",
    description:
      "Book from thousands of hotels worldwide, from budget-friendly to luxury accommodations.",
    mainBenefits: [
      "Access to exclusive hotel deals",
      "Wide range of accommodation options",
      "Verified guest reviews and ratings",
    ],
    extraPerks: [
      "Free cancellation on select hotels",
      "Loyalty program benefits",
      "Room upgrade possibilities",
      "Special requests coordination",
    ],
  },
  {
    id: "4",
    icon: "Briefcase",
    title: "Vacation Packages",
    description:
      "Carefully curated travel packages combining flights, hotels, and experiences for the perfect getaway.",
    mainBenefits: [
      "All-inclusive packages for worry-free travel",
      "Customizable itineraries to match your style",
      "Family-friendly and romantic options",
      "Group travel discounts available",
      "Local experiences and guided tours included",
      "Best value for money combinations",
    ],
  },
  {
    id: "5",
    icon: "Shield",
    title: "Travel Insurance",
    description:
      "Protect your investment with comprehensive travel insurance covering medical emergencies, cancellations, and more.",
    mainBenefits: [
      "Trip cancellation and interruption coverage",
      "Medical emergency assistance worldwide",
      "Lost baggage protection",
    ],
    extraPerks: [
      "Emergency evacuation coverage",
      "24/7 travel assistance hotline",
      "Flight delay compensation",
      "Personal liability protection",
      "Adventure sports coverage options",
      "COVID-19 related coverage",
      "Pre-existing condition waivers",
      "Cancel for any reason upgrades",
    ],
  },
  {
    id: "6",
    icon: "Ship",
    title: "Cruise Bookings",
    description:
      "Explore the world by sea with our extensive cruise options featuring luxury amenities and exotic destinations.",
    mainBenefits: [
      "Access to major cruise lines worldwide",
      "Cabin selection and upgrade assistance",
      "Shore excursion planning",
    ],
    extraPerks: [
      "Mediterranean cruise packages",
      "Caribbean getaway cruises",
      "Alaska and Northern routes",
      "Asian and Pacific cruises",
    ],
  },
  {
    id: "7",
    icon: "MapPin",
    title: "Destination Specialists",
    description:
      "Our team includes destination experts who provide insider knowledge and personalized recommendations for your chosen location.",
    mainBenefits: [
      "Expert destination knowledge and insights",
      "Custom itinerary planning services",
      "Local hidden gems and recommendations",
    ],
    extraPerks: [
      "Restaurant and dining reservations",
      "Event and attraction ticket booking",
      "Local transportation arrangements",
      "Cultural experience coordination",
    ],
    featured: true,
  },
  {
    id: "8",
    icon: "Users",
    title: "Group Travel",
    description:
      "Specialized services for group bookings including corporate events, family reunions, and special celebrations.",
    mainBenefits: [
      "Dedicated group travel coordinator",
      "Special group rates and discounts",
      "Customized group packages",
    ],
    extraPerks: [
      "Corporate retreat planning",
      "Destination wedding arrangements",
      "Family reunion coordination",
      "Sports team travel management",
    ],
  },
];
