// Hotel Booking Type Definitions

// ===== AMADEUS API RESPONSE TYPES =====
// These match the actual Amadeus Hotel Search API V3 response structure

export interface AmadeusHotelOffer {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  rateCode?: string;
  rateFamilyEstimated?: {
    code?: string;
    type?: string;
  };
  room: {
    type?: string;
    typeEstimated?: {
      category?: string;
      beds?: number;
      bedType?: string;
    };
    description?: {
      text?: string;
      lang?: string;
    };
  };
  guests: {
    adults: number;
  };
  price: {
    currency: string;
    base?: string;
    total: string;
    variations?: {
      average?: {
        base?: string;
      };
      changes?: Array<{
        startDate?: string;
        endDate?: string;
        total?: string;
      }>;
    };
    taxes?: Array<{
      amount?: string;
      currency?: string;
      code?: string;
      percentage?: string;
      included?: boolean;
      description?: string;
      pricingFrequency?: string;
      pricingMode?: string;
    }>;
  };
  policies?: {
    paymentType?: string;
    guarantee?: {
      acceptedPayments?: {
        creditCards?: string[];
        methods?: string[];
      };
    };
    deposit?: {
      acceptedPayments?: {
        creditCards?: string[];
        methods?: string[];
      };
      amount?: string;
      deadline?: string;
    };
    prepay?: {
      acceptedPayments?: {
        creditCards?: string[];
        methods?: string[];
      };
      amount?: string;
      deadline?: string;
    };
    holdTime?: {
      deadline?: string;
    };
    cancellation?: {
      deadline?: string;
      amount?: string;
      type?: string;
      description?: {
        text?: string;
        lang?: string;
      };
    };
    checkInOut?: {
      checkIn?: string;
      checkOut?: string;
    };
  };
  self?: string;
}

export interface AmadeusHotelData {
  type: "hotel-offers";
  hotel: {
    hotelId: string;
    chainCode?: string;
    dupeId?: number;
    name?: string;
    cityCode?: string;
    latitude?: number;
    longitude?: number;
  };
  available: boolean;
  offers: AmadeusHotelOffer[];
  self?: string;
}

export interface AmadeusHotelSearchResponse {
  data: AmadeusHotelData[];
  meta?: {
    count: number;
    totalHotelsSearched?: number;
    totalHotelsInArea?: number;
    links?: {
      self: string;
    };
  };
  cached?: boolean;
}

export interface AmadeusHotelListItem {
  chainCode?: string;
  iataCode?: string;
  dupeId?: number;
  name?: string;
  hotelId: string;
  geoCode?: {
    latitude: number;
    longitude: number;
  };
  address?: {
    countryCode: string;
  };
  distance?: {
    value: number;
    unit: string;
  };
  lastUpdate?: string;
}

// ===== APPLICATION TYPES (Legacy - for backward compatibility) =====

export interface HotelLocation {
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface HotelAmenity {
  code: string;
  name: string;
  category: "ROOM" | "PROPERTY" | "SERVICE";
}

export interface HotelImage {
  url: string;
  category: "ROOM" | "EXTERIOR" | "LOBBY" | "RESTAURANT" | "POOL" | "OTHER";
  caption?: string;
}

export interface HotelReview {
  rating: number; // 0-5
  count: number;
  source?: string;
}

export interface RoomType {
  roomId: string;
  name: string;
  description: string;
  bedType: string;
  maxOccupancy: number;
  size?: number; // in square meters
  amenities: string[];
  images: string[];
  available: boolean;
  price: {
    amount: number;
    currency: string;
    nightlyRate: number;
    taxes: number;
    fees: number;
  };
}

export interface Hotel {
  hotelId: string;
  name: string;
  chainCode?: string;
  brandCode?: string;
  location: HotelLocation;
  rating: number; // Star rating (1-5)
  reviews?: HotelReview;
  amenities: HotelAmenity[];
  images: HotelImage[];
  rooms: RoomType[];
  checkInTime?: string;
  checkOutTime?: string;
  policies?: {
    cancellation: string;
    childPolicy?: string;
    petPolicy?: string;
  };
}

export interface HotelSearchParams {
  location?: string; // City name or location query
  cityCode?: string; // IATA city code (e.g., "NYC", "PAR")
  latitude?: number;
  longitude?: number;
  radius?: number; // Search radius in km
  checkInDate: string | Date; // YYYY-MM-DD
  checkOutDate: string | Date; // YYYY-MM-DD
  adults: number;
  children?: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number[]; // Filter by star rating [3, 4, 5]
  amenities?: string[]; // Filter by amenities
  currency?: string;
  limit?: number; // Max results
}

export interface HotelGuest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isMainGuest: boolean;
}

export interface HotelStay {
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  numberOfNights: number;
  numberOfGuests: number;
  numberOfRooms: number;
}

export interface HotelPricing {
  currency: string;
  nightlyRate: number;
  numberOfNights: number;
  subtotal: number;
  taxes: number;
  fees: number;
  totalPrice: number;
  priceBreakdown?: {
    date: string;
    rate: number;
  }[];
}

export interface HotelBooking {
  bookingId?: string;
  hotelId: string;
  hotel: {
    name: string;
    address: string;
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    rating: number;
    image?: string;
  };
  room: {
    roomId: string;
    name: string;
    bedType: string;
    maxOccupancy: number;
  };
  stay: HotelStay;
  guests: HotelGuest[];
  pricing: HotelPricing;
  specialRequests?: string;
  confirmationNumber?: string;
  status: "pending" | "confirmed" | "cancelled";
}

// For multi-booking cart
export interface HotelCartItem {
  type: "hotel";
  data: HotelBooking;
  addedAt: number;
}

// API Response types
export interface HotelSearchResponse {
  hotels: Hotel[];
  total: number;
  page?: number;
  limit?: number;
}

export interface HotelBookingResponse {
  success: boolean;
  booking?: HotelBooking;
  orderId?: string;
  confirmationNumber?: string;
  error?: string;
}
