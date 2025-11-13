/**
 * Type definitions for Services page
 */

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  mainBenefits: string[];
  extraPerks?: string[];
  featured?: boolean;
}

export interface Destination {
  id: string;
  name: string;
  category: "Cultural" | "America" | "Asia" | "Europe" | "Middle East" | "Adventure";
  image: string;
  description?: string;
}
