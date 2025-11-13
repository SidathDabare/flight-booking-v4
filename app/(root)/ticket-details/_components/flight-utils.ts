import { useState, useEffect } from "react";
import { parseISO } from "date-fns";
import {
  FlightSegment,
  BaggageDetail,
  Location,
} from "./flight-itinerary-types";

/**
 * Utility functions for flight itinerary components.
 *
 * This module contains all the utility functions used across flight components including:
 * - Airport data fetching and caching
 * - Duration parsing and formatting
 * - Date utilities with error handling
 * - Baggage information extraction
 * - Cabin class formatting
 * - Stopover duration calculations
 *
 * Purpose: Centralizes business logic and provides reusable functions
 */

/**
 * Fetches airport and city information from the API based on IATA code
 * @param keyword - IATA airport code (e.g., "JFK", "LAX")
 * @returns Promise with airport data or null if not found
 */
export const getAirportAndCity = async (keyword: string) => {
  try {
    const airport = await fetch(`/api/airports?iata=${keyword}`);
    if (!airport.ok) {
      //console.log("Failed to fetch airport data");
    }
    const response = await airport.json();

    if (
      response.airports &&
      Array.isArray(response.airports) &&
      response.airports.length > 0
    ) {
      const exactMatch = response.airports.find(
        (location: Location) => location.IATA === keyword
      );
      return exactMatch || response.airports[0];
    }

    return null;
  } catch (error) {
    //console.error("Error fetching airport data:", error);
    return null;
  }
};

/**
 * React hook for fetching and caching airport data
 * Prioritizes locationDict cache, falls back to API call
 * @param iataCode - IATA airport code
 * @param locationDict - Optional pre-loaded location dictionary for caching
 * @returns {airportData, loading, error} - Airport information with loading state
 */
export const useAirportData = (
  iataCode: string,
  locationDict?: Record<string, Location>
) => {
  const [airportData, setAirportData] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (iataCode) {
      setLoading(true);
      setError(null);

      if (locationDict && locationDict[iataCode]) {
        setAirportData(locationDict[iataCode]);
        setLoading(false);
        return;
      }

      const fetchAirportData = async () => {
        try {
          const data = await getAirportAndCity(iataCode);
          //console.log("Fetched airport data:", data);
          if (data) {
            setAirportData(data);
          } else {
            setError(`No airport data found for ${iataCode}`);
            setAirportData(null);
          }
        } catch (error) {
          setError(`Failed to fetch data for ${iataCode}`);
          setAirportData(null);
        } finally {
          setLoading(false);
        }
      };

      fetchAirportData();
    } else {
      setLoading(false);
      setError("No IATA code provided");
    }
  }, [iataCode, locationDict]);

  return { airportData, loading, error };
};

/**
 * Converts ISO 8601 duration format (PT2H30M) to total minutes
 * @param duration - ISO duration string (e.g., "PT2H30M")
 * @returns Total duration in minutes
 */
export const parseDurationToMinutes = (duration: string): number => {
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/);
  if (!match) return 0;

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  return hours * 60 + minutes;
};

/**
 * Safely parses ISO date strings with error handling
 * @param dateString - ISO date string
 * @returns Parsed Date object or current date if parsing fails
 */
export const safeParseISO = (dateString: string): Date => {
  try {
    return parseISO(dateString);
  } catch (error) {
    //console.error("Invalid date string:", dateString, error);
    return new Date();
  }
};

/**
 * Formats flight duration from ISO format to human-readable string
 * Falls back to calculating from segments if main duration unavailable
 * @param duration - ISO duration string or undefined
 * @param segments - Optional flight segments for fallback calculation
 * @returns Formatted duration (e.g., "02h 30'", "45'", "03h 00'")
 */
export const formatDuration = (
  duration: string | undefined,
  segments?: FlightSegment[]
): string => {
  if (duration && typeof duration === "string") {
    const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/);
    if (match) {
      const hours = match[1] ? parseInt(match[1], 10) : 0;
      const minutes = match[2] ? parseInt(match[2], 10) : 0;

      if (hours === 0 && minutes === 0) {
        return "Duration unavailable";
      }

      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");

      if (hours > 0 && minutes > 0)
        return `${formattedHours}h ${formattedMinutes}'`;
      if (hours > 0) return `${formattedHours}h 00'`;
      if (minutes > 0) return `${formattedMinutes}'`;
    }
  }

  if (segments && segments.length > 0) {
    let totalMinutes = 0;
    for (const segment of segments) {
      if (segment.duration) {
        totalMinutes += parseDurationToMinutes(segment.duration);
      }
    }

    if (totalMinutes > 0) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");

      if (hours > 0 && minutes > 0)
        return `${formattedHours}h ${formattedMinutes}'`;
      if (hours > 0) return `${formattedHours}h 00'`;
      if (minutes > 0) return `${formattedMinutes}'`;
    }
  }

  return "Duration unavailable";
};

/**
 * Extracts checked baggage weight information for a specific flight segment
 * @param baggageDetails - Array of baggage details for all segments
 * @param segmentId - Specific segment ID to find baggage info for
 * @returns Formatted baggage string (e.g., "Baggage 23KG") or null if not found
 */
export const getCheckedBagWeightBySegmentId = (
  baggageDetails: BaggageDetail[],
  segmentId: string
): string | null => {
  const baggageInfo = baggageDetails.find(
    (baggage) => baggage.segmentId === segmentId
  );

  if (!baggageInfo?.includedCheckedBags) {
    return null;
  }

  const { weight, weightUnit } = baggageInfo.includedCheckedBags;
  const unit = weightUnit?.toUpperCase() || "KG";

  return `Baggage ${weight}${unit}`;
};

/** Checks if any segment includes checked baggage
 * @param baggageDetails - Array of baggage details for all segments
 * @returns True if any segment has included checked bags, false otherwise
 */
export const isCheckedBagIncluded = (
  baggageDetails: BaggageDetail[]
): boolean => {
  return baggageDetails.some(
    (baggage) =>
      baggage.includedCheckedBags?.weight !== undefined ||
      baggage.includedCheckedBags?.quantity !== 0
  );
};

export const isCabinBagIncluded = (
  baggageDetails: BaggageDetail[]
): boolean => {
  return baggageDetails.some(
    (baggage) => baggage.includedCabinBags?.quantity !== 0
  );
};

/**
 * Gets and formats cabin class for a specific flight segment
 * Converts airline codes to human-readable cabin names
 * @param baggageDetails - Array of baggage details containing cabin info
 * @param segmentId - Specific segment ID to find cabin class for
 * @returns Formatted cabin class (e.g., "Economy", "Business", "First")
 */
export const getCabinBySegmentId = (
  baggageDetails: BaggageDetail[],
  segmentId: string
): string => {
  const baggageInfo = baggageDetails.find(
    (baggage) => baggage.segmentId === segmentId
  );
  const cabin = baggageInfo?.cabin || "ECONOMY";

  // Format cabin name for better display
  switch (cabin.toUpperCase()) {
    case "ECONOMY":
    case "M":
    case "Y":
      return "Economy";
    case "PREMIUM_ECONOMY":
    case "W":
      return "Premium Economy";
    case "BUSINESS":
    case "C":
      return "Business";
    case "FIRST":
    case "F":
      return "First";
    default:
      return cabin.charAt(0).toUpperCase() + cabin.slice(1).toLowerCase();
  }
};

/**
 * Calculates the layover duration between two connecting flight segments
 * Handles edge cases like negative durations and very short connections
 * @param currentSegment - The arriving flight segment
 * @param nextSegment - The departing flight segment
 * @returns ISO duration string (e.g., "PT2H30M") or fallback for invalid data
 */
export const calculateStopoverDuration = (
  currentSegment: FlightSegment,
  nextSegment: FlightSegment
): string => {
  try {
    const arrivalTime = parseISO(currentSegment.arrival.at);
    const departureTime = parseISO(nextSegment.departure.at);

    // Calculate difference in milliseconds
    const diffMs = departureTime.getTime() - arrivalTime.getTime();

    if (diffMs < 0) {
      //console.warn("Negative stopover duration detected:", {
      //  arrival: currentSegment.arrival.at,
      //  departure: nextSegment.departure.at,
      //});
      return "PT30M"; // Fallback for invalid times
    }

    // Convert to minutes
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    // Handle very short connections (less than 30 minutes)
    if (totalMinutes < 30) {
      //console.warn("Very short connection detected:", totalMinutes, "minutes");
    }

    // Convert to hours and minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Format as ISO 8601 duration (PT format)
    let duration = "PT";
    if (hours > 0) duration += `${hours}H`;
    if (minutes > 0) duration += `${minutes}M`;

    // If both are 0, return minimal duration
    if (hours === 0 && minutes === 0) {
      return "PT5M"; // Minimum 5 minutes
    }

    return duration;
  } catch (error) {
    //console.error("Error calculating stopover duration:", error, {
    //  currentSegment: currentSegment.arrival.at,
    //  nextSegment: nextSegment.departure.at,
    //});
    return " "; // Fallback duration
  }
};

/**
 * Converts currency code to its corresponding symbol
 * @param currency - Currency code (e.g., "USD", "EUR", "GBP")
 * @returns Currency symbol (e.g., "$", "€", "£") or the original code if not found
 */
export const currencyConvertToSymbol = (currency: string): string => {
  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
    INR: "₹",
    CAD: "C$",
    AUD: "A$",
    CHF: "CHF",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    RUB: "₽",
    BRL: "R$",
    MXN: "$",
    SGD: "S$",
    HKD: "HK$",
    NZD: "NZ$",
    ZAR: "R",
    KRW: "₩",
    THB: "฿",
    TRY: "₺",
    PLN: "zł",
    CZK: "Kč",
    HUF: "Ft",
  };

  return currencySymbols[currency?.toUpperCase()] || currency;
};

/**
 * Raw baggage detail interface from API response
 * Represents the structure before transformation to BaggageDetail
 */
interface RawBaggageDetail {
  segmentId: string;
  cabin?: string;
  fareBasis?: string;
  brandedFare?: string;
  class?: string;
  includedCabinBags?: {
    quantity?: number;
  };
  includedCheckedBags?: {
    weight?: number;
    weightUnit?: string;
    quantity?: number;
  };
}

/**
 * Transforms raw baggage details from API response into structured BaggageDetail format
 * Handles missing values, provides defaults, and ensures type safety
 * @param rawBaggageDetails - Array of raw baggage details from travelerPricings.fareDetailsBySegment
 * @returns Array of properly formatted BaggageDetail objects
 */
export const transformBaggageDetails = (
  rawBaggageDetails: RawBaggageDetail[]
): BaggageDetail[] => {
  if (!Array.isArray(rawBaggageDetails) || rawBaggageDetails.length === 0) {
    return [];
  }

  return rawBaggageDetails.map((detail) => ({
    segmentId: detail.segmentId,
    cabin: detail.cabin || "",
    fareBasis: detail.fareBasis || "",
    brandedFare: detail.brandedFare || "",
    class: detail.class || "",
    includedCabinBags: detail.includedCabinBags?.quantity
      ? {
          quantity: detail.includedCabinBags.quantity,
        }
      : undefined,
    includedCheckedBags:
      detail.includedCheckedBags?.weight !== undefined
        ? {
            weight: detail.includedCheckedBags.weight,
            weightUnit: detail.includedCheckedBags.weightUnit || "KG",
            quantity: detail.includedCheckedBags.quantity ?? 0,
          }
        : undefined,
  }));
};

/**
 * Maps fare rule codes to human-readable titles
 */
const FARE_RULE_TITLES: Record<string, string> = {
  "RU.": "RULE APPLICATION",
  "MX.": "MAXIMUM STAY",
  "SE.": "SEASONS",
  "SR.": "SALES RESTRICTIONS",
  "TR.": "TRAVEL RESTRICTIONS",
  "AP.": "ADVANCE RESERVATION/TICKETING",
  "FL.": "FLIGHT APPLICATION",
  "CD.": "CHILD DISCOUNTS",
  "OD.": "OTHER DISCOUNTS",
  "SO.": "STOPOVERS",
  "TF.": "TRANSFERS/ROUTINGS",
  "SU.": "SURCHARGES",
  "CO.": "COMBINABILITY",
  "HI.": "HIGHER INTERMEDIATE POINT",
  "MD.": "MISCELLANEOUS DATA",
  "VC.": "VOLUNTARY CHANGES",
  "VR.": "VOLUNTARY REFUNDS",
};

/**
 * Formats fare rules text from raw airline data into readable sections
 * @param rawText - Raw fare rules text containing rule codes and content
 * @returns Formatted text with clear section headers and structured content
 */
export const formatFareRulesText = (rawText: string): string => {
  if (!rawText || typeof rawText !== "string" || rawText.trim() === "") {
    return "No fare rules available";
  }

  const sections = parseFareRuleSections(rawText);
  const formattedSections = sections
    .filter(
      (section): section is { code: string; content: string } =>
        section !== null
    )
    .map((section) => formatSection(section));

  return formattedSections.join("\n").trim();
};

/**
 * Parses raw text into fare rule sections
 */
const parseFareRuleSections = (rawText: string) => {
  const sections = rawText.split(/(?<=[A-Z]{2}\.)(?=[A-Z]{2}\.|\n[A-Z]{2}\.)/);

  return sections
    .map((section) => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return null;

      const match = trimmedSection.match(/^([A-Z]{2}\.)([\s\S]*?)(?=\n|$)/);
      if (!match) return null;

      return {
        code: match[1] as string,
        content: match[2].trim(),
      };
    })
    .filter(Boolean);
};

/**
 * Formats a single fare rule section
 */
const formatSection = (section: { code: string; content: string }): string => {
  const { code, content } = section;
  const title = FARE_RULE_TITLES[code] || "UNKNOWN RULE";
  const header = `\n--- ${code} ${title} ---\n`;

  const formattedContent = formatSectionContent(code, content);

  return header + formattedContent;
};

/**
 * Formats content based on specific rule code requirements
 */
const formatSectionContent = (code: string, content: string): string => {
  switch (code) {
    case "RU.":
      return formatRuleApplicationSection(content);
    case "SR.":
      return formatSalesRestrictionsSection(content);
    case "AP.":
      return formatAdvanceReservationSection(content);
    case "CD.":
      return formatChildDiscountsSection(content);
    case "OD.":
      return formatOtherDiscountsSection(content);
    case "SU.":
      return formatSurchargesSection(content);
    case "CO.":
      return formatCombinabilitySection(content);
    default:
      return formatDefaultSection(content);
  }
};

/**
 * Formats Rule Application (RU.) section with structured subsections
 */
const formatRuleApplicationSection = (content: string): string => {
  const subSections = content.split(/---+\s*/);
  let output = `${subSections[0]?.trim() || ""}\n`;

  const subSectionLabels = [
    "", // First section is already handled
    "Passenger Expenses",
    "Mile Accrual Rules",
    "Other Conditions for Transfers",
    "Sequential Use of Flight Coupons",
    "Violation of Reservation Procedures",
  ];

  for (let i = 1; i < subSections.length && i < subSectionLabels.length; i++) {
    if (subSections[i]?.trim()) {
      output += `\n  - ${subSectionLabels[i]}: ${subSections[i].trim()}\n`;
    }
  }

  return output;
};

/**
 * Formats Sales Restrictions (SR.) section
 */
const formatSalesRestrictionsSection = (content: string): string => {
  const upgradePattern =
    /NOTE - UPGRADE TO ANY HIGHER FARE IS PERMITTED\. REBOOKING  CHARGE ALSO APPLIES IF ANY AND -/;
  const parts = content.split(upgradePattern);

  let output = `${parts[0]?.trim() || ""}\n`;

  if (parts.length > 1 && parts[1]?.trim()) {
    output += `  NOTE: Upgrade to any higher fare is permitted. Rebooking charge also applies if any.\n`;
    output += `  - Tickets must be issued on TK or HR and may not be sold in: ${parts[1].trim().replace(/\n/g, " ")}\n`;
  }

  return output;
};

/**
 * Formats Advance Reservation/Ticketing (AP.) section
 */
const formatAdvanceReservationSection = (content: string): string => {
  const subSections = content.split(/---+\s*/);
  let output = `${subSections[0]?.trim() || ""}\n`;

  if (subSections[1]?.trim()) {
    output += `  Advance Ticketing Rules:\n`;
    const ticketingRules = subSections[1]
      .trim()
      .split("- ")
      .filter((item) => item.trim());
    ticketingRules.forEach((rule) => {
      output += `    * ${rule.trim()}\n`;
    });
  }

  // Add remaining subsections as-is with proper indentation
  for (let i = 2; i < subSections.length; i++) {
    if (subSections[i]?.trim()) {
      output += `  ${subSections[i].trim()}\n`;
    }
  }

  return output;
};

/**
 * Formats Child Discounts (CD.) section
 */
const formatChildDiscountsSection = (content: string): string => {
  let output = `  Child Discounts:\n`;
  const childDiscountRules = content
    .split("OR -")
    .filter((item) => item.trim());

  childDiscountRules.forEach((rule) => {
    output += `    * ${rule.trim().replace(/\n/g, " ")}\n`;
  });

  return output;
};

/**
 * Formats Other Discounts (OD.) section
 */
const formatOtherDiscountsSection = (content: string): string => {
  const splitPattern =
    /------+\s*|\s*NOTE - UPGRADE TO ANY HIGHER FARE IS PERMITTED\. REBOOKING  CHARGE ALSO APPLIES IF ANY AND -/;
  const parts = content.split(splitPattern);

  let output = `${parts[0]?.trim() || ""}\n`;

  if (parts[1]?.trim()) {
    output += `  Other Discounts:\n`;
    const otherDiscountRules = parts[1]
      .trim()
      .split("--")
      .filter((item) => item.trim());
    otherDiscountRules.forEach((rule) => {
      output += `    * ${rule.trim()}\n`;
    });

    if (parts[2]?.trim()) {
      output += `  ${parts[2].trim()}\n`;
    }
  }

  return output;
};

/**
 * Formats Surcharges (SU.) section
 */
const formatSurchargesSection = (content: string): string => {
  let output = `  NOTE: International Passenger Routing Guide (IPRG) rules also apply\n`;

  const surcharges = content
    .split("AND -")
    .filter((item) => item.includes("RBD SURCHARGE"));

  if (surcharges.length > 0) {
    output += `  RBD Surcharges:\n`;
    surcharges.forEach((surcharge) => {
      const cleanedSurcharge = surcharge
        .replace("NOTE - RULE QQQQ IN IPRG ALSO APPLIES ", "")
        .trim();
      output += `    * ${cleanedSurcharge}\n`;
    });
  }

  return output;
};

/**
 * Formats Combinability (CO.) section
 */
const formatCombinabilitySection = (content: string): string => {
  const splitText =
    "ROUND TRIPS/CIRCLE TRIPS FARES MAY BE COMBINED ON A HALF ROUND TRIP BASIS WITH TK FARES";
  const parts = content.split(splitText);

  let output = `${parts[0]?.trim().replace(/\n/g, "\n  ") || ""}\n`;

  if (parts.length > 1 && parts[1]?.trim()) {
    output += `  Round Trips/Circle Trips:\n`;
    output += `    Fares may be combined on a half round trip basis with TK fares ${parts[1].trim().replace(/\n/g, "\n    ")}\n`;
  }

  return output;
};

/**
 * Default formatting for unspecified rule types
 */
const formatDefaultSection = (content: string): string => {
  return `${content.trim().replace(/\n/g, " ")}\n`;
};
