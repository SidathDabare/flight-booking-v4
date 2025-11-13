/**
 * Type definitions for the About page
 */

export interface AirlinePartner {
  name: string;
  logo: string;
  alt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  initials: string;
  rating: number;
  comment: string;
}

export interface Benefit {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface StaffMember {
  id: string;
  title: string;
  description: string;
}

export interface TeamMember {
  name: string;
  title: string;
  credentials: string;
  description: string[];
  badges: string[];
  image: string;
  imageAlt: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  hours: string;
}

export interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface Stat {
  value: string;
  label: string;
}
