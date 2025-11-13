import type { StaffMember, TeamMember, Stat } from "../_types";

/**
 * Company statistics displayed in the hero section
 */
export const COMPANY_STATS: Stat[] = [
  { value: "15+", label: "Years" },
  { value: "50K+", label: "Travelers" },
  { value: "150+", label: "Destinations" },
];

/**
 * Staff expertise and qualifications
 */
export const STAFF_MEMBERS: StaffMember[] = [
  {
    id: "1",
    title: "Professionally Trained Agents",
    description:
      "Our team receives ongoing training and stays up-to-date with the latest industry trends, ensuring expert guidance for your travels.",
  },
  {
    id: "2",
    title: "Certified Ticketing Specialists",
    description:
      "Passionate about creating tailor-made travel solutions, we put our utmost effort into making your dream vacation a reality.",
  },
  {
    id: "3",
    title: "Experienced Travel Consultants",
    description:
      "With years of experience and deep knowledge of global destinations, we provide expert advice for your dream trip plans.",
  },
  {
    id: "4",
    title: "Dedicated Support Team",
    description:
      "Our professionals deliver outstanding service with a commitment to excellence. We always deliver what we promise.",
  },
];

/**
 * Leadership team information
 */
export const TEAM_LEADER: TeamMember = {
  name: "Mr. Jhon Doe",
  title: "Founder & CEO",
  credentials: "IATA (sub Captain CAAC)",
  description: [
    "With over 15 years of distinguished experience in the travel and aviation industry, Mr. Jhon Doe has built an exceptional reputation for delivering world-class travel solutions and fostering lasting relationships with clients worldwide.",
    "His expertise spans strategic planning, operations management, and customer relations, making him a respected leader in the field. Under his visionary leadership, the company has achieved remarkable growth and recognition.",
    "Committed to excellence and innovation, Mr. Jhon Doe has established strategic partnerships with major airlines and expanded services globally, ensuring clients receive unparalleled travel experiences tailored to their unique needs.",
  ],
  badges: ["IATA Certified", "15+ Years Experience"],
  image:
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80",
  imageAlt: "Mr. Jhon Doe - Founder & CEO leading our travel agency",
};
