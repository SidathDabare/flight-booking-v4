import { format, isValid } from "date-fns";
import { z } from "zod";

// Safe date formatter (reused from flight search)
const safeFormatDate = (date: Date | string): string => {
  if (!date) return "";

  // If it's already a string, return as-is
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

export const hotelSearchSchema = z
  .object({
    location: z.string().min(2, "Location is required").optional(),
    cityCode: z.string().min(3).max(3).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    radius: z.number().min(1).max(300).default(50), // km
    checkInDate: z
      .date()
      .or(z.string())
      .transform((date) => safeFormatDate(date)),
    checkOutDate: z
      .date()
      .or(z.string())
      .transform((date) => safeFormatDate(date)),
    adults: z.number().min(1).max(10).default(1),
    children: z.number().min(0).max(10).default(0),
    rooms: z.number().min(1).max(10).default(1),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    rating: z.array(z.number().min(1).max(5)).optional(),
    amenities: z.array(z.string()).optional(),
    currency: z.string().default("USD"),
    limit: z.number().min(1).max(250).default(50),
    paymentPolicy: z.enum(["GUARANTEE", "DEPOSIT", "NONE"]).optional(),
    boardType: z.enum(["ROOM_ONLY", "BREAKFAST", "HALF_BOARD", "FULL_BOARD", "ALL_INCLUSIVE"]).optional(),
  })
  .refine(
    (data) => {
      // At least one location parameter must be provided
      return data.location || data.cityCode || (data.latitude && data.longitude);
    },
    {
      message: "Location, city code, or coordinates are required",
      path: ["location"],
    }
  )
  .refine(
    (data) => {
      // Check-out must be after check-in
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);
      return checkOut > checkIn;
    },
    {
      message: "Check-out date must be after check-in date",
      path: ["checkOutDate"],
    }
  )
  .refine(
    (data) => {
      // Validate price range
      if (data.minPrice && data.maxPrice) {
        return data.maxPrice > data.minPrice;
      }
      return true;
    },
    {
      message: "Maximum price must be greater than minimum price",
      path: ["maxPrice"],
    }
  );

export type HotelSearch = z.infer<typeof hotelSearchSchema>;

// Guest validation schema
export const hotelGuestSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  isMainGuest: z.boolean().default(false),
});

export type HotelGuest = z.infer<typeof hotelGuestSchema>;

// Booking validation schema
export const hotelBookingSchema = z.object({
  hotelId: z.string().min(1, "Hotel ID is required"),
  roomId: z.string().min(1, "Room selection is required"),
  checkInDate: z
    .date()
    .or(z.string())
    .transform((date) => safeFormatDate(date)),
  checkOutDate: z
    .date()
    .or(z.string())
    .transform((date) => safeFormatDate(date)),
  numberOfNights: z.number().min(1),
  numberOfGuests: z.number().min(1),
  numberOfRooms: z.number().min(1).default(1),
  guests: z.array(hotelGuestSchema).min(1, "At least one guest is required"),
  specialRequests: z.string().max(500).optional(),
});

export type HotelBookingInput = z.infer<typeof hotelBookingSchema>;
