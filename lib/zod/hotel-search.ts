import { z } from "zod";

/**
 * Hotel Search Schema
 * Validates hotel search parameters for Amadeus API
 */
export const hotelSearchSchema = z.object({
  // Destination (city code or hotel name)
  cityCode: z
    .string()
    .min(1, "Destination is required")
    .max(3, "City code must be 3 characters")
    .toUpperCase()
    .optional(),

  // Geographic coordinates for location-based search
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Date range
  checkInDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Check-in date must be in YYYY-MM-DD format")
    .refine((date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: "Check-in date cannot be in the past",
    }),

  checkOutDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Check-out date must be in YYYY-MM-DD format"),

  // Guest information
  adults: z.number().int().min(1, "At least 1 adult required").max(9).default(1),

  children: z.number().int().min(0).max(9).default(0),

  // Room configuration
  rooms: z.number().int().min(1, "At least 1 room required").max(9).default(1),

  // Search preferences
  radius: z.number().int().min(1).max(300).optional(), // kilometers
  radiusUnit: z.enum(["KM", "MILE"]).default("KM").optional(),

  // Hotel amenities filter
  amenities: z.array(z.string()).optional(),

  // Rating filter
  ratings: z.array(z.number().int().min(1).max(5)).optional(),

  // Price range
  priceRange: z.string().optional(), // e.g., "1-500"
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),

  // Sorting and pagination
  sortBy: z.enum(["price", "rating", "distance"]).default("price").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),

  // Currency
  currency: z.string().length(3).default("USD"),

  // Board type (meal plan)
  boardType: z.enum([
    "ROOM_ONLY",
    "BREAKFAST",
    "HALF_BOARD",
    "FULL_BOARD",
    "ALL_INCLUSIVE"
  ]).optional(),

  // Maximum results
  max: z.number().int().min(1).max(100).default(50).optional(),
})
.refine(
  (data) => {
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
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  },
  {
    message: "Maximum stay is 30 nights",
    path: ["checkOutDate"],
  }
);

export type HotelSearch = z.infer<typeof hotelSearchSchema>;

/**
 * Hotel Autocomplete Schema
 * For city/hotel name autocomplete
 */
export const hotelAutocompleteSchema = z.object({
  keyword: z.string().min(2, "Enter at least 2 characters"),
  subType: z.enum(["HOTEL_LEISURE", "HOTEL_GDS", "CITY"]).default("HOTEL_GDS"),
  max: z.number().int().min(1).max(20).default(10).optional(),
});

export type HotelAutocomplete = z.infer<typeof hotelAutocompleteSchema>;

/**
 * Hotel Offer Schema
 * Represents a hotel offer from Amadeus API
 */
export const hotelOfferSchema = z.object({
  type: z.string(),
  hotel: z.object({
    type: z.string().optional(),
    hotelId: z.string(),
    chainCode: z.string().optional(),
    dupeId: z.string().optional(),
    name: z.string(),
    cityCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  available: z.boolean(),
  offers: z.array(
    z.object({
      id: z.string(),
      checkInDate: z.string(),
      checkOutDate: z.string(),
      rateCode: z.string().optional(),
      rateFamilyEstimated: z.object({
        code: z.string().optional(),
        type: z.string().optional(),
      }).optional(),
      room: z.object({
        type: z.string().optional(),
        typeEstimated: z.object({
          category: z.string().optional(),
          beds: z.number().optional(),
          bedType: z.string().optional(),
        }).optional(),
        description: z.object({
          text: z.string().optional(),
          lang: z.string().optional(),
        }).optional(),
      }),
      guests: z.object({
        adults: z.number(),
        childAges: z.array(z.number()).optional(),
      }),
      price: z.object({
        currency: z.string(),
        base: z.string().optional(),
        total: z.string(),
        variations: z.object({
          average: z.object({
            base: z.string().optional(),
            total: z.string().optional(),
          }).optional(),
          changes: z.array(
            z.object({
              startDate: z.string().optional(),
              endDate: z.string().optional(),
              total: z.string().optional(),
            })
          ).optional(),
        }).optional(),
      }),
      policies: z.object({
        paymentType: z.string().optional(),
        cancellation: z.object({
          deadline: z.string().optional(),
          amount: z.string().optional(),
          type: z.string().optional(),
        }).optional(),
      }).optional(),
      self: z.string().optional(),
    })
  ),
  self: z.string().optional(),
});

export type HotelOffer = z.infer<typeof hotelOfferSchema>;

/**
 * Hotel List Item Schema
 * For hotel search results (list of hotels)
 */
export const hotelListItemSchema = z.object({
  type: z.string(),
  hotelId: z.string(),
  chainCode: z.string().optional(),
  dupeId: z.string().optional(),
  name: z.string(),
  iataCode: z.string().optional(),
  address: z.object({
    countryCode: z.string().optional(),
    cityName: z.string().optional(),
    stateCode: z.string().optional(),
  }).optional(),
  geoCode: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  distance: z.object({
    value: z.number().optional(),
    unit: z.string().optional(),
  }).optional(),
  lastUpdate: z.string().optional(),
});

export type HotelListItem = z.infer<typeof hotelListItemSchema>;

/**
 * Hotel Details Schema
 * Extended hotel information
 */
export const hotelDetailsSchema = z.object({
  hotelId: z.string(),
  name: z.string(),
  rating: z.number().min(1).max(5).optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  contact: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export type HotelDetails = z.infer<typeof hotelDetailsSchema>;

/**
 * Hotel Booking Request Schema
 */
export const hotelBookingSchema = z.object({
  offerId: z.string().min(1, "Offer ID is required"),
  guests: z.array(
    z.object({
      id: z.number(),
      name: z.object({
        title: z.enum(["MR", "MRS", "MS"]),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
      }),
      contact: z.object({
        phone: z.string().min(1, "Phone is required"),
        email: z.string().email("Valid email is required"),
      }),
    })
  ).min(1, "At least one guest is required"),
  payments: z.array(
    z.object({
      method: z.enum(["CREDIT_CARD"]),
      card: z.object({
        vendorCode: z.string(),
        cardNumber: z.string(),
        expiryDate: z.string(),
      }).optional(),
    })
  ),
});

export type HotelBooking = z.infer<typeof hotelBookingSchema>;

/**
 * Helper function to calculate nights between dates
 */
export const calculateNights = (checkIn: string, checkOut: string): number => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Helper function to format date for display
 */
export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Helper function to validate if dates form a valid stay
 */
export const isValidStay = (checkIn: string, checkOut: string): boolean => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) return false;
  if (checkOutDate <= checkInDate) return false;

  const nights = calculateNights(checkIn, checkOut);
  if (nights > 30) return false;

  return true;
};
