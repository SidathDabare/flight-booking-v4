// Car Rental Type Definitions

export interface CarLocation {
  locationId: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  type: "AIRPORT" | "CITY" | "RAILWAY_STATION" | "PORT";
  iataCode?: string; // For airports
  openingHours?: {
    [day: string]: string; // e.g., "monday": "08:00-20:00"
  };
}

export interface VehicleSpecifications {
  make: string; // Brand (e.g., "Toyota", "BMW")
  model: string; // Model (e.g., "Camry", "X5")
  year?: number;
  category: "ECONOMY" | "COMPACT" | "INTERMEDIATE" | "STANDARD" | "FULL_SIZE" | "LUXURY" | "SUV" | "VAN" | "CONVERTIBLE";
  transmission: "MANUAL" | "AUTOMATIC";
  fuelType: "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID";
  seating: number;
  doors: number;
  luggage: {
    large: number;
    small: number;
  };
  features: string[]; // e.g., ["GPS", "Air Conditioning", "Bluetooth"]
  airConditioning: boolean;
  unlimitedMileage: boolean;
  mileageLimit?: number; // miles or km per day
}

export interface Vehicle {
  vehicleId: string;
  specifications: VehicleSpecifications;
  images: string[];
  available: boolean;
  vendor: {
    code: string;
    name: string;
    logo?: string;
    rating?: number;
  };
  price: {
    amount: number;
    currency: string;
    dailyRate: number;
    totalDays: number;
    taxes: number;
    fees: number;
  };
}

export interface CarSearchParams {
  pickupLocation: string; // Location ID, IATA code, or city name
  dropoffLocation?: string; // If different from pickup (one-way rental)
  pickupDate: string | Date; // YYYY-MM-DD HH:mm
  dropoffDate: string | Date; // YYYY-MM-DD HH:mm
  driverAge?: number;
  category?: VehicleSpecifications["category"];
  transmission?: "MANUAL" | "AUTOMATIC";
  minSeating?: number;
  maxPrice?: number;
  currency?: string;
  vendorCodes?: string[]; // Filter by specific vendors
  limit?: number;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  licenseNumber: string;
  licenseIssuingCountry: string;
  licenseExpiryDate: string; // YYYY-MM-DD
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface InsuranceOption {
  code: string;
  name: string;
  description: string;
  coverage: string;
  price: {
    amount: number;
    currency: string;
    per: "DAY" | "RENTAL";
  };
  mandatory: boolean;
}

export interface RentalDetails {
  pickupLocation: CarLocation;
  dropoffLocation: CarLocation;
  pickupDate: string; // ISO 8601
  dropoffDate: string; // ISO 8601
  durationDays: number;
  durationHours: number;
  isOneWay: boolean;
}

export interface CarPricing {
  currency: string;
  dailyRate: number;
  numberOfDays: number;
  subtotal: number;
  insurance: {
    name: string;
    amount: number;
  }[];
  additionalServices: {
    name: string;
    amount: number;
  }[];
  taxes: number;
  fees: number;
  oneWayFee?: number;
  totalPrice: number;
}

export interface AdditionalService {
  code: string;
  name: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    per: "DAY" | "RENTAL";
  };
  available: boolean;
}

export interface CarRental {
  rentalId?: string;
  vehicleId: string;
  vehicle: {
    make: string;
    model: string;
    category: string;
    transmission: string;
    seating: number;
    image?: string;
  };
  vendor: {
    code: string;
    name: string;
    logo?: string;
  };
  rental: RentalDetails;
  driver: Driver;
  additionalDrivers?: Driver[];
  insurance: InsuranceOption[];
  additionalServices?: AdditionalService[];
  pricing: CarPricing;
  specialRequests?: string;
  confirmationNumber?: string;
  voucherUrl?: string;
  status: "pending" | "confirmed" | "cancelled";
  terms?: {
    cancellationPolicy: string;
    fuelPolicy: string;
    depositAmount?: number;
    paymentMethod: string[];
  };
}

// For multi-booking cart
export interface CarCartItem {
  type: "car";
  data: CarRental;
  addedAt: number;
}

// API Response types
export interface CarSearchResponse {
  vehicles: Vehicle[];
  total: number;
  page?: number;
  limit?: number;
}

export interface CarBookingResponse {
  success: boolean;
  rental?: CarRental;
  orderId?: string;
  confirmationNumber?: string;
  voucherUrl?: string;
  error?: string;
}

// Common rental terms
export interface RentalTerms {
  minimumAge: number;
  youngDriverFee?: {
    ageRange: string;
    amount: number;
  };
  seniorDriverFee?: {
    ageRange: string;
    amount: number;
  };
  additionalDriverFee?: number;
  cancellationPolicy: string;
  fuelPolicy: "FULL_TO_FULL" | "SAME_TO_SAME" | "PREPAID";
  mileagePolicy: "UNLIMITED" | "LIMITED";
  requiredDocuments: string[];
  depositAmount: number;
  depositMethod: string[];
}
