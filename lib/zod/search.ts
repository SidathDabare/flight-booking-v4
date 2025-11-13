import { format, isValid } from "date-fns";
import { z } from "zod";

// Safe date formatter that validates before formatting
const safeFormatDate = (date: Date | string): string => {
  if (!date) return "";
  
  // If it's already a string, return as-is (assuming it's already formatted)
  if (typeof date === "string") return date;
  
  // Validate Date object
  if (!(date instanceof Date)) return "";
  
  // Check for invalid time values
  const timeValue = date.getTime();
  if (isNaN(timeValue) || !isFinite(timeValue)) {
    console.warn("Invalid time value detected:", timeValue, "from date:", date);
    return "";
  }
  
  // Additional validation with date-fns
  if (!isValid(date)) {
    console.warn("Date-fns validation failed for date:", date);
    return "";
  }
  
  // Safe to format
  try {
    return format(date, "yyyy-MM-dd");
  } catch (error) {
    console.error("Date formatting error:", error, "Date:", date);
    return "";
  }
};

export const flightSearchSchema = z
  .object({
    originLocationCode: z.string(),
    destinationLocationCode: z.string(),
    departureDate: z
      .date()
      .or(z.string())
      .transform((date) => safeFormatDate(date)),
    returnDate: z
      .date()
      .or(z.string())
      .optional()
      .transform((date) => date ? safeFormatDate(date) : undefined),
    adults: z.number().default(1),
    children: z.number().default(0),
    infants: z.number().default(0),
    travelClass: z
      .enum(["ANY", "ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"])
      .optional(),
    currencyCode: z.any().default("USD"), // temp solution
    excludedAirlineCodes: z.string().optional(),
    includedAirlineCodes: z.string().optional(),
    maxPrice: z.number().optional(),
    minPrice: z.number().optional(),
    max: z.number().default(200),
    nonStop: z.boolean().default(false),
    twoWay: z.boolean().default(false),
  })
  .refine((data) => !data.twoWay || data.returnDate, {
    message: "Required",
    path: ["returnDate"],
  });

export type FlightSearch = z.infer<typeof flightSearchSchema>;
// import { format } from "date-fns";
// import { z } from "zod";

// export const flightSearchSchema = z
//   .object({
//     originLocationCode: z.string().min(3),
//     destinationLocationCode: z.string().min(3),
//     departureDate: z
//       .date()
//       .or(z.string())
//       .transform((date) => format(date, "yyyy-MM-dd")),
//     returnDate: z
//       .date()
//       .or(z.string())
//       .optional()
//       .transform((date) => date && format(date, "yyyy-MM-dd")),
//     adults: z.number().default(1),
//     children: z.number().default(0),
//     infants: z.number().default(0),
//     travelClass: z
//       .enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"])
//       .optional(),
//     currencyCode: z.any().default("USD"), // temp solution
//     excludedAirlineCodes: z.string().optional(),
//     includedAirlineCodes: z.string().optional(),
//     maxPrice: z.number().optional(),
//     minPrice: z.number().optional(),
//     max: z.number().default(200),
//     nonStop: z.boolean().default(false),
//     twoWay: z.boolean().default(false),
//   })
//   .refine((data) => !data.twoWay || data.returnDate, {
//     message: "Required",
//     path: ["returnDate"],
//   });

// export type FlightSearch = z.infer<typeof flightSearchSchema>;
