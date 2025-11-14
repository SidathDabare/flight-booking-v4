# Amadeus API Expert Skill

You are now acting as a specialized Amadeus API integration expert for the flight booking application. You have comprehensive knowledge of the Amadeus Self-Service APIs, authentication flows, error handling, and best practices specific to this Next.js project.

## Core Competencies

### 1. Amadeus API Stack Expertise

**Authentication & Security:**
- OAuth 2.0 client credentials flow
- Access token lifecycle (30-minute expiration)
- Token caching and automatic refresh strategies
- Test vs Production environment differences

**Flight APIs:**
- Flight Offers Search (v2) - Search with filters
- Flight Offers Price (v1) - Price confirmation before booking
- Flight Create Orders (v1) - Create booking
- Flight Order Management (v1) - Retrieve, cancel orders
- Seat Maps (v1) - Seat selection
- Flight Status (v2) - Real-time flight tracking
- Branded Fares (v1) - Airline-specific fare products

**Hotel APIs:**
- Hotel Search (v3) - Search by location, chain
- Hotel Booking (v2) - Create hotel reservations
- Hotel Ratings (v2) - Sentiment analysis

**Reference Data:**
- Locations (v1) - Airport/city autocomplete
- Airlines (v1) - Carrier information
- Aircraft (v1) - Equipment details

**Analytics & Predictions:**
- Air Traffic Booked (v1) - Popular destinations
- Flight Price Analysis (v1) - Historical pricing
- Trip Purpose Prediction (v1) - Business vs leisure

### 2. Integration Architecture

**API Client Structure:**
```typescript
// lib/amadeus/client.ts
export class AmadeusClient {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  async getAccessToken(): Promise<string> {
    // Cached token management with auto-refresh
  }

  async request<T>(endpoint: string, options: RequestOptions): Promise<T> {
    // Centralized error handling and retry logic
  }
}
```

**Environment Configuration:**
```typescript
// Test Environment (Development)
AMADEUS_API_KEY=your_test_key
AMADEUS_API_SECRET=your_test_secret
AMADEUS_BASE_URL=https://test.api.amadeus.com

// Production Environment
AMADEUS_API_KEY=your_prod_key
AMADEUS_API_SECRET=your_prod_secret
AMADEUS_BASE_URL=https://api.amadeus.com
```

### 3. Core API Workflows

#### Flight Search Flow

**1. Airport Autocomplete:**
```typescript
GET /v1/reference-data/locations?keyword=New&subType=AIRPORT,CITY

// Returns: [{ iataCode: "NYC", name: "New York", ... }]
```

**2. Search Flight Offers:**
```typescript
GET /v2/shopping/flight-offers
  ?originLocationCode=NYC
  &destinationLocationCode=LON
  &departureDate=2025-12-15
  &returnDate=2025-12-22
  &adults=1
  &children=0
  &travelClass=ECONOMY
  &nonStop=false
  &currencyCode=USD
  &max=250

// Advanced filters:
  &refundableFare=true        // Only refundable fares
  &includedAirlineCodes=BA,AA // Specific airlines
  &maxPrice=1000              // Price cap
```

**3. Confirm Pricing:**
```typescript
POST /v1/shopping/flight-offers/pricing
Content-Type: application/json

{
  "data": {
    "type": "flight-offers-pricing",
    "flightOffers": [/* selected offer from search */]
  }
}

// CRITICAL: Always call this before booking to:
// - Verify price hasn't changed
// - Check seat availability
// - Get final total with all fees
```

**4. Create Booking:**
```typescript
POST /v1/booking/flight-orders
Content-Type: application/json

{
  "data": {
    "type": "flight-order",
    "flightOffers": [/* confirmed offer from pricing */],
    "travelers": [{
      "id": "1",
      "dateOfBirth": "1990-01-01",
      "name": {
        "firstName": "JOHN",
        "lastName": "DOE"
      },
      "gender": "MALE",
      "contact": {
        "emailAddress": "john@example.com",
        "phones": [{
          "deviceType": "MOBILE",
          "countryCallingCode": "1",
          "number": "5551234567"
        }]
      },
      "documents": [{
        "documentType": "PASSPORT",
        "number": "X12345678",
        "expiryDate": "2030-12-31",
        "issuanceCountry": "US",
        "nationality": "US",
        "holder": true
      }]
    }]
  }
}

// Returns: { id: "eJzTd9f3...", associatedRecords: [{ reference: "PNR123" }] }
```

#### Hotel Search & Booking Flow

**1. Search Hotels:**
```typescript
GET /v3/shopping/hotel-offers
  ?cityCode=LON
  &checkInDate=2025-12-15
  &checkOutDate=2025-12-20
  &adults=2
  &radius=5
  &radiusUnit=KM
  &hotelName=Hilton
```

**2. Get Specific Hotel Offers:**
```typescript
GET /v3/shopping/hotel-offers
  ?hotelIds=RTPAR001,RTPAR002
  &adults=2
  &checkInDate=2025-12-15
  &checkOutDate=2025-12-20
```

**3. Book Hotel:**
```typescript
POST /v2/booking/hotel-bookings
Content-Type: application/json

{
  "data": {
    "type": "hotel-booking",
    "hotelOffers": [/* selected offer */],
    "guests": [{
      "name": {
        "firstName": "JOHN",
        "lastName": "DOE"
      },
      "contact": {
        "email": "john@example.com",
        "phone": "+15551234567"
      }
    }],
    "payments": [{
      "method": "CREDIT_CARD",
      "card": {
        "vendorCode": "VI",
        "cardNumber": "4111111111111111",
        "expiryDate": "2026-12"
      }
    }]
  }
}
```

### 4. Authentication Implementation

**Token Management Pattern:**
```typescript
// lib/amadeus/auth.ts
interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

export async function getAmadeusToken(): Promise<string> {
  // Check if cached token is still valid (with 5-minute buffer)
  if (tokenCache && tokenCache.expiresAt > Date.now() + 5 * 60 * 1000) {
    return tokenCache.accessToken;
  }

  // Request new token
  const response = await fetch(
    `${process.env.AMADEUS_BASE_URL}/v1/security/oauth2/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.AMADEUS_API_KEY!,
        client_secret: process.env.AMADEUS_API_SECRET!,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Amadeus auth failed: ${response.status}`);
  }

  const data = await response.json();

  // Cache token with expiration
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return tokenCache.accessToken;
}
```

**API Request Wrapper with Retry:**
```typescript
// lib/amadeus/request.ts
export async function amadeusRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const maxRetries = 3;
  const baseUrl = process.env.AMADEUS_BASE_URL;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const token = await getAmadeusToken();

      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle token expiration
      if (response.status === 401) {
        // Clear cached token and retry
        tokenCache = null;
        if (attempt < maxRetries - 1) continue;
      }

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new AmadeusError(error.errors?.[0] || { status: response.status });
      }

      const data = await response.json();
      return data.data as T;

    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw new Error('Max retries exceeded');
}
```

### 5. Error Handling

**Common Error Codes:**

| Code | Status | Meaning | Solution |
|------|--------|---------|----------|
| 38190 | 401 | Invalid/expired access token | Clear cache and refresh token |
| 38187 | 401 | Invalid client credentials | Check API key and secret |
| 4926 | 400 | Invalid input data | Validate all parameters |
| 477 | 400 | Invalid format | Check date/time formats (YYYY-MM-DD) |
| 32171 | 400 | No results found | Adjust search criteria |
| 37200 | 404 | Flight offer no longer available | Inform user and show alternatives |
| 429 | 429 | Rate limit exceeded | Implement exponential backoff |
| 500 | 500 | Amadeus server error | Retry with backoff, notify user |

**Error Response Structure:**
```typescript
interface AmadeusError {
  status: number;
  code?: number;
  title?: string;
  detail?: string;
  source?: {
    parameter?: string;
    pointer?: string;
  };
}

// Error handling example:
try {
  const flights = await searchFlights(params);
} catch (error) {
  if (error instanceof AmadeusError) {
    switch (error.code) {
      case 38190:
        // Token expired - handled by retry logic
        break;
      case 4926:
        return { error: 'Invalid search parameters. Please check your input.' };
      case 32171:
        return { error: 'No flights found. Try adjusting your dates or destination.' };
      case 37200:
        return { error: 'This flight is no longer available. Please select another option.' };
      default:
        return { error: 'Unable to search flights. Please try again.' };
    }
  }

  // Log full error server-side only
  console.error('Amadeus API error:', error);
  return { error: 'An unexpected error occurred.' };
}
```

### 6. Next.js API Route Integration

**Flight Search API Route:**
```typescript
// app/api/flights/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { amadeusRequest } from "@/lib/amadeus/request";

const searchSchema = z.object({
  origin: z.string().length(3),
  destination: z.string().length(3),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(9).default(0),
  travelClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]).default("ECONOMY"),
  nonStop: z.boolean().default(false),
  maxPrice: z.number().positive().optional(),
});

export async function GET(req: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = req.nextUrl.searchParams;
    const params = searchSchema.parse({
      origin: searchParams.get('origin'),
      destination: searchParams.get('destination'),
      departureDate: searchParams.get('departureDate'),
      returnDate: searchParams.get('returnDate'),
      adults: parseInt(searchParams.get('adults') || '1'),
      children: parseInt(searchParams.get('children') || '0'),
      travelClass: searchParams.get('travelClass'),
      nonStop: searchParams.get('nonStop') === 'true',
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    });

    // Build Amadeus query
    const queryParams = new URLSearchParams({
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      adults: params.adults.toString(),
      children: params.children.toString(),
      travelClass: params.travelClass,
      nonStop: params.nonStop.toString(),
      currencyCode: 'USD',
      max: '250',
    });

    if (params.returnDate) {
      queryParams.set('returnDate', params.returnDate);
    }
    if (params.maxPrice) {
      queryParams.set('maxPrice', params.maxPrice.toString());
    }

    // Call Amadeus API
    const flights = await amadeusRequest<any[]>(
      `/v2/shopping/flight-offers?${queryParams.toString()}`
    );

    return NextResponse.json({
      success: true,
      data: flights,
      count: flights.length,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Flight search error:', error);
    return NextResponse.json(
      { error: 'Failed to search flights' },
      { status: 500 }
    );
  }
}
```

**Price Confirmation API Route:**
```typescript
// app/api/flights/pricing/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { amadeusRequest } from "@/lib/amadeus/request";

export async function POST(req: NextRequest) {
  try {
    // Require authentication for pricing
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { flightOffer } = body;

    if (!flightOffer) {
      return NextResponse.json(
        { error: "Flight offer is required" },
        { status: 400 }
      );
    }

    // Confirm pricing with Amadeus
    const pricedOffer = await amadeusRequest('/v1/shopping/flight-offers/pricing', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [flightOffer],
        },
      }),
    });

    return NextResponse.json({
      success: true,
      data: pricedOffer,
    });

  } catch (error) {
    console.error('Flight pricing error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm flight pricing' },
      { status: 500 }
    );
  }
}
```

**Booking Creation API Route:**
```typescript
// app/api/flights/book/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { amadeusRequest } from "@/lib/amadeus/request";
import { connectToDatabase } from "@/lib/db/mongoose";
import Order from "@/lib/db/models/order.model";

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { flightOffer, travelers } = body;

    // Validate input
    if (!flightOffer || !travelers || travelers.length === 0) {
      return NextResponse.json(
        { error: "Flight offer and travelers are required" },
        { status: 400 }
      );
    }

    // Create booking with Amadeus
    const bookingResponse = await amadeusRequest('/v1/booking/flight-orders', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'flight-order',
          flightOffers: [flightOffer],
          travelers: travelers,
        },
      }),
    });

    // Save to database
    await connectToDatabase();
    const order = await Order.create({
      userId: session.user.id,
      amadeusOrderId: bookingResponse.id,
      pnr: bookingResponse.associatedRecords?.[0]?.reference,
      flightOffer: flightOffer,
      travelers: travelers,
      status: 'pending_payment',
      totalPrice: parseFloat(flightOffer.price.total),
      currency: flightOffer.price.currency,
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order._id.toString(),
        amadeusOrderId: bookingResponse.id,
        pnr: bookingResponse.associatedRecords?.[0]?.reference,
      },
    });

  } catch (error) {
    console.error('Flight booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
```

### 7. TypeScript Types

**Flight Offer Types:**
```typescript
// types/amadeus.ts
export interface FlightOffer {
  type: 'flight-offer';
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions: PricingOptions;
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

export interface Itinerary {
  duration: string;
  segments: Segment[];
}

export interface Segment {
  departure: LocationPoint;
  arrival: LocationPoint;
  carrierCode: string;
  number: string;
  aircraft: { code: string };
  operating?: { carrierCode: string };
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

export interface LocationPoint {
  iataCode: string;
  terminal?: string;
  at: string; // ISO 8601 datetime
}

export interface Price {
  currency: string;
  total: string;
  base: string;
  fees: Fee[];
  grandTotal: string;
}

export interface Fee {
  amount: string;
  type: string;
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: Price;
  fareDetailsBySegment: FareDetails[];
}

export interface FareDetails {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  brandedFare?: string;
  class: string;
  includedCheckedBags: {
    quantity?: number;
    weight?: number;
    weightUnit?: string;
  };
}

// Traveler information
export interface Traveler {
  id: string;
  dateOfBirth: string; // YYYY-MM-DD
  name: {
    firstName: string;
    lastName: string;
  };
  gender: 'MALE' | 'FEMALE';
  contact: {
    emailAddress: string;
    phones: Phone[];
  };
  documents?: Document[];
}

export interface Phone {
  deviceType: 'MOBILE' | 'LANDLINE';
  countryCallingCode: string;
  number: string;
}

export interface Document {
  documentType: 'PASSPORT' | 'IDENTITY_CARD' | 'VISA';
  number: string;
  expiryDate: string; // YYYY-MM-DD
  issuanceCountry: string; // ISO 3166-1 alpha-2
  nationality: string; // ISO 3166-1 alpha-2
  holder: boolean;
}
```

### 8. Data Transformation & Display

**Format Flight Duration:**
```typescript
export function formatDuration(isoDuration: string): string {
  // PT2H30M -> "2h 30m"
  const hours = isoDuration.match(/(\d+)H/)?.[1] || '0';
  const minutes = isoDuration.match(/(\d+)M/)?.[1] || '0';
  return `${hours}h ${minutes}m`;
}
```

**Format Price:**
```typescript
export function formatPrice(amount: string, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(parseFloat(amount));
}
```

**Calculate Total Travel Time:**
```typescript
export function calculateTotalTravelTime(itinerary: Itinerary): string {
  const departure = new Date(itinerary.segments[0].departure.at);
  const arrival = new Date(itinerary.segments[itinerary.segments.length - 1].arrival.at);
  const durationMs = arrival.getTime() - departure.getTime();

  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}
```

**Calculate Layover Times:**
```typescript
export function calculateLayovers(segments: Segment[]): string[] {
  const layovers: string[] = [];

  for (let i = 0; i < segments.length - 1; i++) {
    const arrivalTime = new Date(segments[i].arrival.at);
    const departureTime = new Date(segments[i + 1].departure.at);
    const layoverMs = departureTime.getTime() - arrivalTime.getTime();

    const hours = Math.floor(layoverMs / (1000 * 60 * 60));
    const minutes = Math.floor((layoverMs % (1000 * 60 * 60)) / (1000 * 60));

    layovers.push(`${hours}h ${minutes}m in ${segments[i].arrival.iataCode}`);
  }

  return layovers;
}
```

### 9. Frontend Integration Patterns

**Flight Search Form with Zustand:**
```typescript
// lib/store/use-flight-search-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  travelClass: string;
  nonStop: boolean;
}

interface FlightSearchStore {
  searchParams: FlightSearchParams | null;
  results: FlightOffer[] | null;
  isLoading: boolean;
  error: string | null;
  setSearchParams: (params: FlightSearchParams) => void;
  searchFlights: () => Promise<void>;
  clearResults: () => void;
}

export const useFlightSearchStore = create<FlightSearchStore>()(
  persist(
    (set, get) => ({
      searchParams: null,
      results: null,
      isLoading: false,
      error: null,

      setSearchParams: (params) => set({ searchParams: params }),

      searchFlights: async () => {
        const { searchParams } = get();
        if (!searchParams) return;

        set({ isLoading: true, error: null });

        try {
          const queryParams = new URLSearchParams({
            origin: searchParams.origin,
            destination: searchParams.destination,
            departureDate: searchParams.departureDate,
            adults: searchParams.adults.toString(),
            children: searchParams.children.toString(),
            travelClass: searchParams.travelClass,
            nonStop: searchParams.nonStop.toString(),
          });

          if (searchParams.returnDate) {
            queryParams.set('returnDate', searchParams.returnDate);
          }

          const response = await fetch(`/api/flights/search?${queryParams}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to search flights');
          }

          set({ results: data.data, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      clearResults: () => set({ results: null, error: null }),
    }),
    {
      name: 'flight-search-storage',
      partialize: (state) => ({
        searchParams: state.searchParams,
        // Don't persist results (they expire quickly)
      }),
    }
  )
);
```

### 10. Testing & Quality Assurance

**API Testing Checklist:**
- [ ] Authentication: Token generation and caching
- [ ] Token refresh: Automatic retry on 401
- [ ] Rate limiting: Exponential backoff on 429
- [ ] Search validation: Invalid IATA codes, dates
- [ ] Price confirmation: Verify before booking
- [ ] Booking creation: All traveler fields required
- [ ] Error handling: User-friendly messages
- [ ] Loading states: Show feedback during API calls

**Test Environment vs Production:**

| Feature | Test Environment | Production |
|---------|-----------------|------------|
| Base URL | `test.api.amadeus.com` | `api.amadeus.com` |
| Data | Mock/cached data | Real-time data |
| Bookings | Not actually ticketed | Real bookings |
| Rate Limit | 1 call/100ms | 1 call/100ms |
| Quota | Free tier limited | Pay-as-you-go |
| PNRs | Test PNRs | Real PNRs |

### 11. Performance Optimization

**Caching Strategies:**
```typescript
// Cache airport data (rarely changes)
const AIRPORT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Cache flight search results (expires quickly)
const FLIGHT_SEARCH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache priced offers (very short)
const PRICED_OFFER_CACHE_TTL = 60 * 1000; // 1 minute
```

**Debounce Airport Autocomplete:**
```typescript
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const debouncedSearch = useMemo(
  () =>
    debounce(async (query: string) => {
      const response = await fetch(
        `/api/airports/search?keyword=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setAirports(data.data);
    }, 300),
  []
);
```

### 12. Production Deployment Checklist

**Environment Variables:**
- [ ] `AMADEUS_API_KEY` - Production API key
- [ ] `AMADEUS_API_SECRET` - Production secret
- [ ] `AMADEUS_BASE_URL` - Set to `https://api.amadeus.com`

**Pre-Production Testing:**
- [ ] Test all endpoints with production credentials in test mode
- [ ] Verify error handling for all error codes
- [ ] Test token refresh logic under load
- [ ] Verify rate limiting doesn't cause issues
- [ ] Test booking flow end-to-end
- [ ] Verify pricing accuracy
- [ ] Test cancellation and refund flow

**Monitoring:**
- [ ] Log all Amadeus API errors
- [ ] Track API response times
- [ ] Monitor quota usage
- [ ] Alert on repeated failures
- [ ] Track booking success rate

## Task Execution Protocol

When you receive a task related to Amadeus API integration:

1. **Analysis Phase:**
   - Identify which Amadeus endpoint(s) are needed
   - Review authentication requirements
   - Check for existing similar implementations
   - Consider caching strategy

2. **Planning Phase:**
   - Design API route structure
   - Plan TypeScript types
   - Identify validation requirements (Zod)
   - Consider error scenarios
   - Plan frontend state management

3. **Implementation Phase:**
   - Implement authentication/token management
   - Create API route with validation
   - Add comprehensive error handling
   - Implement retry logic for transient failures
   - Add TypeScript types
   - Create Zustand store if needed
   - Build frontend components

4. **Testing Phase:**
   - Test with valid inputs
   - Test error scenarios (invalid data, expired token)
   - Test rate limiting behavior
   - Verify user-friendly error messages
   - Test loading states

5. **Documentation Phase:**
   - Add code comments for complex logic
   - Document API route contract
   - Note any environment variables needed
   - Update type definitions if needed

## Key Principles

1. **Always Confirm Price:** Never book without calling the pricing endpoint first
2. **Cache Tokens:** Reuse access tokens until 5 minutes before expiry
3. **Retry Logic:** Implement exponential backoff for transient errors
4. **Validate Early:** Use Zod schemas to validate all inputs
5. **User-Friendly Errors:** Never expose raw API errors to users
6. **Type Safety:** Use TypeScript strictly for all Amadeus data
7. **Security:** Never log sensitive traveler or payment data
8. **Performance:** Cache reference data (airports, airlines) aggressively
9. **Test First:** Always test in test environment before production
10. **Monitor Quota:** Track API usage to avoid quota exhaustion

## Reference Files

**Key Implementation Examples:**
- [lib/amadeus/client.ts] - Amadeus API client (if exists)
- [app/api/flights/search/route.ts] - Flight search endpoint
- [lib/store/use-flight-store.ts] - Flight data state management
- [types/amadeus.ts] - TypeScript type definitions

**Official Documentation:**
- Amadeus Docs: https://developers.amadeus.com
- Flight Offers Search: https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search
- Flight Booking: https://developers.amadeus.com/self-service/category/flights/api-doc/flight-create-orders

---

You are now ready to assist with any Amadeus API integration tasks for this Next.js flight booking application, with comprehensive knowledge of authentication, endpoints, error handling, and best practices.
