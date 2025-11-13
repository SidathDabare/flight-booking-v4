/**
 * TypeScript interfaces and type definitions for the Flight Itinerary components.
 *
 * This file centralizes all type definitions used across the flight booking system,
 * including flight segments, locations, baggage details, and component props.
 *
 * Purpose: Ensures type safety and consistency across all flight-related components
 */

/**
 * Represents a single flight segment with departure/arrival information,
 * airline details, duration, and booking metadata
 */
export interface FlightSegment {
  departure: {
    at: string;
    iataCode: string;
    terminal?: string;
    airportName?: string;
  };
  arrival: {
    at: string;
    iataCode: string;
    terminal?: string;
    airportName?: string;
  };
  carrierCode: string;
  number: string;
  aircraft?: {
    code: string;
  };
  duration: string;
  id: string;
  numberOfStops?: number;
  airlineName?: string;
  pricingOptions?: {
    includedCheckedBagsOnly?: boolean;
  };
}

/**
 * Address information for airports and locations
 */
export interface Address {
  cityName?: string;
  countryCode?: string;
}

/**
 * Location data including airport details and geographic information
 * Used for displaying airport names, cities, and countries
 */
// export interface Location {
//   cityCode?: string;
//   countryCode?: string;
//   subType?: string;
//   detailedName?: string;
//   name?: string;
//   address?: Address;
// }
export interface Location {
  name?: string;
  city?: string;
  country?: string;
  IATA?: string;
  ICAO?: string;
  lat?: string;
  lon?: string;
  timezone?: string;
}

/**
 * Baggage allowance details for specific flight segments
 * Includes cabin class and checked baggage information
 */
export interface BaggageDetail {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  brandedFare: string;
  class: string;
  includedCheckedBags?: {
    weight: number;
    weightUnit: string;
    quantity: number;
  };
  includedCabinBags?: {
    quantity: number;
  };
}

/**
 * Complete flight itinerary containing one or more flight segments
 * Represents either a departure or return journey
 */
export interface Itinerary {
  segments: FlightSegment[];
  duration?: string;
}

/**
 * Props for the main FlightItinerary component
 * Contains all data needed to display complete flight booking details
 */
export interface FlightItineraryProps {
  departure: Itinerary;
  returnFlight?: Itinerary;
  baggageInfo?: string;
  locationDict?: Record<string, Location>;
  baggageDetails?: BaggageDetail[];
  checkInBaggage?: boolean;
  connectionInsurance?: boolean;
}
