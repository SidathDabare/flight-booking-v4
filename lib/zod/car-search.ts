import { format, isValid, parseISO } from "date-fns";
import { z } from "zod";

// Safe datetime formatter for car rentals (includes time)
const safeFormatDateTime = (date: Date | string): string => {
  if (!date) return "";

  // If it's already a string in ISO format, return as-is
  if (typeof date === "string") {
    try {
      const parsed = parseISO(date);
      if (isValid(parsed)) {
        return format(parsed, "yyyy-MM-dd'T'HH:mm");
      }
      return date;
    } catch {
      return date;
    }
  }

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
    return format(date, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    console.error("Date formatting error:", error, "Date:", date);
    return "";
  }
};

export const carSearchSchema = z
  .object({
    pickupLocation: z.string().min(3, "Pickup location is required"),
    dropoffLocation: z.string().optional(),
    pickupDate: z
      .date()
      .or(z.string())
      .transform((date) => safeFormatDateTime(date)),
    dropoffDate: z
      .date()
      .or(z.string())
      .transform((date) => safeFormatDateTime(date)),
    driverAge: z.number().min(18).max(99).default(25),
    category: z
      .enum([
        "ECONOMY",
        "COMPACT",
        "INTERMEDIATE",
        "STANDARD",
        "FULL_SIZE",
        "LUXURY",
        "SUV",
        "VAN",
        "CONVERTIBLE",
      ])
      .optional(),
    transmission: z.enum(["MANUAL", "AUTOMATIC"]).optional(),
    minSeating: z.number().min(2).max(15).optional(),
    maxPrice: z.number().min(0).optional(),
    currency: z.string().default("USD"),
    vendorCodes: z.array(z.string()).optional(),
    limit: z.number().min(1).max(100).default(50),
  })
  .refine(
    (data) => {
      // Dropoff must be after pickup
      const pickup = new Date(data.pickupDate);
      const dropoff = new Date(data.dropoffDate);
      return dropoff > pickup;
    },
    {
      message: "Drop-off date must be after pickup date",
      path: ["dropoffDate"],
    }
  )
  .refine(
    (data) => {
      // Minimum rental duration: 1 hour
      const pickup = new Date(data.pickupDate);
      const dropoff = new Date(data.dropoffDate);
      const hoursDiff = (dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60);
      return hoursDiff >= 1;
    },
    {
      message: "Minimum rental duration is 1 hour",
      path: ["dropoffDate"],
    }
  );

export type CarSearch = z.infer<typeof carSearchSchema>;

// Driver validation schema
export const driverSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  dateOfBirth: z
    .string()
    .or(z.date())
    .transform((val) => {
      if (typeof val === "string") return val;
      return format(val, "yyyy-MM-dd");
    }),
  age: z.number().min(18, "Driver must be at least 18 years old").max(99),
  licenseNumber: z.string().min(5, "Valid license number is required"),
  licenseIssuingCountry: z.string().min(2, "License issuing country is required"),
  licenseExpiryDate: z
    .string()
    .or(z.date())
    .transform((val) => {
      if (typeof val === "string") return val;
      return format(val, "yyyy-MM-dd");
    }),
  address: z
    .object({
      street: z.string().min(1),
      city: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(2),
    })
    .optional(),
});

export type Driver = z.infer<typeof driverSchema>;

// Insurance option selection
export const insuranceSelectionSchema = z.object({
  code: z.string(),
  name: z.string(),
  price: z.number(),
});

// Additional service selection
export const additionalServiceSchema = z.object({
  code: z.string(),
  name: z.string(),
  price: z.number(),
});

// Car booking validation schema
export const carBookingSchema = z
  .object({
    vehicleId: z.string().min(1, "Vehicle selection is required"),
    vendorCode: z.string().min(1, "Vendor code is required"),
    pickupLocation: z.string().min(1, "Pickup location is required"),
    dropoffLocation: z.string().min(1, "Drop-off location is required"),
    pickupDate: z
      .date()
      .or(z.string())
      .transform((date) => safeFormatDateTime(date)),
    dropoffDate: z
      .date()
      .or(z.string())
      .transform((date) => safeFormatDateTime(date)),
    driver: driverSchema,
    additionalDrivers: z.array(driverSchema).optional(),
    insurance: z.array(insuranceSelectionSchema).min(1, "At least one insurance option is required"),
    additionalServices: z.array(additionalServiceSchema).optional(),
    specialRequests: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      // Validate driver age
      const dob = new Date(data.driver.dateOfBirth);
      const today = new Date();
      const age = Math.floor((today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return age >= 18 && age <= 99;
    },
    {
      message: "Driver age must be between 18 and 99",
      path: ["driver", "age"],
    }
  )
  .refine(
    (data) => {
      // License must not be expired
      const expiryDate = new Date(data.driver.licenseExpiryDate);
      const pickupDate = new Date(data.pickupDate);
      return expiryDate > pickupDate;
    },
    {
      message: "Driver license must be valid at pickup date",
      path: ["driver", "licenseExpiryDate"],
    }
  );

export type CarBookingInput = z.infer<typeof carBookingSchema>;
