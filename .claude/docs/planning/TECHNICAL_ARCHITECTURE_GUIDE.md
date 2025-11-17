# Technical Architecture Guide - Hotel & Car Rental Extension

**Purpose**: Quick reference for developers implementing hotel and car rental features
**Date**: 2025-11-17

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Flights    │  │   Hotels     │  │  Car Rentals │         │
│  │   Search     │  │   Search     │  │   Search     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                     │
│                   ┌────────▼────────┐                           │
│                   │  Booking Cart   │                           │
│                   │  (Multi-Item)   │                           │
│                   └────────┬────────┘                           │
└────────────────────────────┼──────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                     STATE LAYER (Zustand)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │ Flight Store│  │ Hotel Store │  │  Car Store  │           │
│  │ (20-min)    │  │ (20-min)    │  │  (20-min)   │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                   ┌─────────────────┐                          │
│                   │ Booking Cart    │                          │
│                   │ Store           │                          │
│                   └─────────────────┘                          │
└────────────────────────────┬──────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                      API LAYER (Next.js Routes)                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐│
│  │ /api/flight-*   │  │ /api/hotel-*    │  │ /api/car-*     ││
│  │ - search        │  │ - search        │  │ - search       ││
│  │ - create-booking│  │ - create-booking│  │ - create-booking││
│  └─────────────────┘  └─────────────────┘  └────────────────┘│
│                   ┌─────────────────┐                          │
│                   │ /api/checkout   │                          │
│                   │ - payment-intent│                          │
│                   │ - webhooks      │                          │
│                   └─────────────────┘                          │
└────────────────────────────┬──────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                    EXTERNAL SERVICES LAYER                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  Amadeus    │  │   Stripe    │  │  Resend     │           │
│  │  Flight API │  │  Payments   │  │  Email      │           │
│  │  Hotel API  │  └─────────────┘  └─────────────┘           │
│  │  Car API    │                                               │
│  └─────────────┘                                               │
└────────────────────────────┬──────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                     DATABASE LAYER (MongoDB)                   │
│  ┌─────────────────────────────────────────────────┐          │
│  │ Orders Collection (Flexible Schema)             │          │
│  │ ┌──────────────┐  ┌──────────────┐  ┌─────────┐│          │
│  │ │ Flight Orders│  │ Hotel Orders │  │Car Orders││          │
│  │ │ type: flight │  │ type: hotel  │  │type: car ││          │
│  │ └──────────────┘  └──────────────┘  └─────────┘│          │
│  └─────────────────────────────────────────────────┘          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Users     │  │  Messages   │  │  Customers  │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└───────────────────────────────────────────────────────────────┘
```

---

## Key Design Patterns

### 1. Generic Order Model (CRITICAL)

**Why It Works**: The existing Order model uses a flexible `data` field that can accommodate any booking type.

```typescript
// Order Schema (lib/db/models/Order.ts)
{
  userId: ObjectId,
  data: {
    type: "flight-offer" | "hotel-booking" | "car-rental",  // Discriminator
    // Type-specific nested data...
  },
  metadata: {
    // Shared metadata (price, currency, timestamps)
  },
  status: "pending" | "confirmed" | "cancelled",
  stripe_payment_intent: String,
  ticketSent: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Implementation Strategy**:
- Use `data.type` to discriminate booking types
- Each type has its own nested schema within `data`
- Shared fields go in `metadata`
- No need for separate collections (Hotel, Car) - all in Orders

**Example: Flight Order**
```typescript
{
  data: {
    type: "flight-offer",
    id: "AMADEUS123",
    itineraries: [...],
    travelers: [...]
  }
}
```

**Example: Hotel Order (NEW)**
```typescript
{
  data: {
    type: "hotel-booking",
    hotelId: "HOTEL456",
    hotel: {
      name: "Grand Plaza Hotel",
      address: "123 Main St, NYC",
      rating: 4.5
    },
    stay: {
      checkInDate: "2025-12-01",
      checkOutDate: "2025-12-05",
      numberOfNights: 4,
      guests: [...]
    },
    pricing: {
      nightlyRate: 150,
      totalPrice: 600
    }
  },
  metadata: {
    currency: "USD",
    totalAmount: 600
  }
}
```

---

### 2. API Endpoint Pattern

**Pattern**: `/api/[resource]-[action]/route.ts`

**Existing Examples**:
- `/api/flight-offers-search/route.ts` - Search flights
- `/api/create-booking-amadeus/route.ts` - Create flight booking
- `/api/create-payment-intent/route.ts` - Generic payment

**New Endpoints to Create**:
```
POST /api/hotel-search
  Input: { location, checkIn, checkOut, guests }
  Output: { hotels: [...] }

POST /api/hotel-details/[hotelId]
  Input: { hotelId }
  Output: { hotel: {...}, rooms: [...] }

POST /api/create-booking-hotel
  Input: { hotelId, roomId, guests, dates }
  Output: { orderId, confirmation }

POST /api/car-search
  Input: { pickup, dropoff, dates }
  Output: { cars: [...] }

POST /api/create-booking-car
  Input: { carId, driver, dates }
  Output: { orderId, confirmation }
```

**Standard API Route Structure**:
```typescript
// app/api/hotel-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Input Validation (Zod)
    const body = await req.json();
    const validated = hotelSearchSchema.parse(body);

    // 3. Business Logic (call external API)
    const hotels = await searchHotels(validated);

    // 4. Response
    return NextResponse.json({ hotels }, { status: 200 });

  } catch (error) {
    // 5. Error Handling
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

---

### 3. State Management (Zustand)

**Pattern**: Time-limited stores with auto-expiry (20 minutes)

**Existing Example**: `lib/store/use-flight-store.ts`
```typescript
interface FlightStore {
  flightOffer: FlightOffer | null;
  setFlightOffer: (offer: FlightOffer) => void;
  clearFlightOffer: () => void;
  expiresAt: number | null;
  // ... 20-minute expiry logic
}
```

**New Stores to Create**:

```typescript
// lib/store/use-hotel-store.ts
interface HotelStore {
  selectedHotel: Hotel | null;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  guests: Guest[];
  setHotel: (hotel: Hotel) => void;
  setDates: (checkIn: Date, checkOut: Date) => void;
  addGuest: (guest: Guest) => void;
  clearHotel: () => void;
  expiresAt: number | null;
}

// lib/store/use-car-store.ts
interface CarStore {
  selectedCar: Car | null;
  pickupDate: Date | null;
  dropoffDate: Date | null;
  pickupLocation: string;
  dropoffLocation: string;
  driver: Driver | null;
  setCar: (car: Car) => void;
  setDates: (pickup: Date, dropoff: Date) => void;
  setDriver: (driver: Driver) => void;
  clearCar: () => void;
  expiresAt: number | null;
}

// lib/store/use-booking-cart-store.ts
interface BookingCartStore {
  items: BookingItem[];  // Array of flights, hotels, cars
  addItem: (item: BookingItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

type BookingItem =
  | { type: "flight", data: FlightOffer }
  | { type: "hotel", data: Hotel }
  | { type: "car", data: Car };
```

---

### 4. Payment Flow (Reuse Existing)

**Current Flow** (already works for any booking):
1. User completes booking form
2. Frontend calls `/api/create-payment-intent`
3. Stripe payment modal opens
4. On success → Stripe webhook triggers `/api/webhooks`
5. Webhook creates Order in database
6. Email confirmation sent

**What Needs to Change**:
- **Nothing in the payment flow itself!**
- Just update webhook to handle different `data.type` values
- Create orders with appropriate type

```typescript
// app/api/webhooks/route.ts (UPDATE)
export async function POST(req: Request) {
  const event = stripe.webhooks.constructEvent(/* ... */);

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata;

    // Create order based on type
    if (metadata.type === "hotel-booking") {
      await createHotelOrder(metadata);
    } else if (metadata.type === "car-rental") {
      await createCarOrder(metadata);
    } else {
      await createFlightOrder(metadata);  // Existing
    }
  }
}
```

---

### 5. Authentication & Authorization

**Current Setup**: NextAuth with MongoDB adapter

**Roles**:
- `client` - Can search and book
- `agent` - Can view client bookings and messages
- `admin` - Full access

**No Changes Needed**: All roles already support any booking type!

**Example Authorization Check**:
```typescript
// In API route
const session = await auth();
if (!session || session.user.role !== "admin") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

---

### 6. Email Templates

**Current Pattern**: `lib/email-templates.ts` - HTML email templates

**Existing Templates**:
- Flight confirmation email
- Password reset email
- Order confirmation email

**New Templates to Add**:
```typescript
// lib/email-templates.ts (ADD)

export function hotelConfirmationEmail(order: Order): string {
  const { hotel, stay, pricing } = order.data;
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Hotel Booking Confirmed!</h1>
        <p>Hotel: ${hotel.name}</p>
        <p>Check-in: ${stay.checkInDate}</p>
        <p>Check-out: ${stay.checkOutDate}</p>
        <p>Total: ${pricing.totalPrice} ${order.metadata.currency}</p>
        <a href="${process.env.NEXT_PUBLIC_URL}/bookings/${order._id}">
          View Booking
        </a>
      </body>
    </html>
  `;
}

export function carRentalConfirmationEmail(order: Order): string {
  const { vehicle, rental, pricing } = order.data;
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Car Rental Confirmed!</h1>
        <p>Vehicle: ${vehicle.make} ${vehicle.model}</p>
        <p>Pickup: ${rental.pickupDate} at ${rental.pickupLocation}</p>
        <p>Dropoff: ${rental.dropoffDate} at ${rental.dropoffLocation}</p>
        <p>Total: ${pricing.totalPrice} ${order.metadata.currency}</p>
      </body>
    </html>
  `;
}
```

---

### 7. Real-time Messaging (Socket.IO)

**Current Setup**: `server.ts` - Socket.IO server
**Context**: `lib/socket-context.tsx`

**Events Already Supported**:
- `message:new` - New message
- `message:read` - Message read
- `message:delivered` - Message delivered

**New Events to Add** (optional):
```typescript
// For real-time price updates
socket.emit("hotel:price-update", { hotelId, newPrice });
socket.emit("car:availability-update", { carId, available });

// For booking notifications
socket.emit("booking:hotel-confirmed", { orderId, userId });
socket.emit("booking:car-confirmed", { orderId, userId });
```

---

### 8. PDF Generation

**Current**: `lib/ticket-service.ts` - Uses Puppeteer to generate flight tickets

**Pattern**: Generate HTML → Puppeteer → PDF

**Extend for Hotels/Cars**:
```typescript
// lib/ticket-service.ts (ADD)

export async function generateHotelConfirmation(order: Order): Promise<Buffer> {
  const html = hotelConfirmationTemplate(order);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({ format: "A4" });
  await browser.close();
  return pdf;
}

export async function generateCarRentalConfirmation(order: Order): Promise<Buffer> {
  const html = carRentalConfirmationTemplate(order);
  // Same pattern...
}
```

---

## Database Schema Reference

### Order Model (Extended)

```typescript
// lib/db/models/Order.ts
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  data: {
    type: {
      type: String,
      enum: ["flight-offer", "hotel-booking", "car-rental"],
      required: true,
      index: true  // IMPORTANT: Index for filtering
    },
    // Flexible nested structure - depends on type
    // For flights: itineraries, travelers, etc.
    // For hotels: hotel, stay, guests, etc.
    // For cars: vehicle, rental, driver, etc.
  },
  metadata: {
    currency: String,
    totalAmount: Number,
    // Other shared fields
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
    index: true
  },
  stripe_payment_intent: {
    type: String,
    unique: true,
    sparse: true
  },
  ticketSent: {
    type: Boolean,
    default: false
  },
  groupId: {
    type: String,  // NEW: For multi-item bookings
    index: true
  }
}, { timestamps: true });

// Indexes for efficient queries
OrderSchema.index({ userId: 1, "data.type": 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ groupId: 1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
```

---

## Frontend Component Structure

### Recommended Structure:

```
components/
├── hotel-search/
│   ├── SearchForm.tsx          # Location, dates, guests input
│   ├── HotelCard.tsx           # Single hotel result card
│   ├── HotelList.tsx           # List of hotels
│   ├── FilterSidebar.tsx       # Price, amenities, rating filters
│   └── SortDropdown.tsx        # Sort by price, rating, etc.
│
├── hotel-booking/
│   ├── HotelDetails.tsx        # Detailed hotel view
│   ├── RoomSelector.tsx        # Select room type
│   ├── GuestForm.tsx           # Guest information form
│   └── BookingSummary.tsx      # Review before payment
│
├── car-search/
│   ├── SearchForm.tsx          # Pickup/dropoff, dates
│   ├── CarCard.tsx             # Single car result card
│   ├── CarList.tsx             # List of cars
│   ├── FilterSidebar.tsx       # Car type, transmission, etc.
│   └── SortDropdown.tsx        # Sort options
│
├── car-booking/
│   ├── CarDetails.tsx          # Detailed car view
│   ├── DriverForm.tsx          # Driver info + license
│   ├── InsuranceOptions.tsx    # Insurance selection
│   └── RentalTerms.tsx         # Terms and conditions
│
├── booking-cart/
│   ├── CartPage.tsx            # Main cart page
│   ├── CartItem.tsx            # Single item in cart (flight/hotel/car)
│   ├── CartSummary.tsx         # Price breakdown
│   └── PromoCodeInput.tsx      # Promo code entry
│
└── ui/                         # Existing shadcn/ui components
    ├── button.tsx              # Reuse
    ├── card.tsx                # Reuse
    ├── dialog.tsx              # Reuse
    └── ...
```

### Component Reuse Strategy:

**Reuse These**:
- `components/ui/*` - All shadcn/ui components
- `components/layouts/*` - Header, footer, navigation
- `components/messages/*` - Messaging components (no changes)
- Form components (inputs, buttons, validation)

**Create New**:
- Hotel-specific search and booking components
- Car-specific search and booking components
- Multi-booking cart components

---

## API Integration Guide

### Amadeus API (RECOMMENDED)

**Already Integrated**: ✓ Flight Search API

**Available APIs**:
1. **Hotel Search API** - Search hotels by location, dates
2. **Hotel Booking API** - Book hotel rooms
3. **Car Rental API** - Search and book car rentals

**Setup**:
```bash
# Already in .env (flights)
AMADEUS_CLIENT_ID=your_client_id
AMADEUS_CLIENT_SECRET=your_client_secret
```

**Sample Request** (Hotel Search):
```typescript
// lib/actions/hotel-search.ts
import Amadeus from "amadeus";

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID!,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET!
});

export async function searchHotels(params: HotelSearchParams) {
  const response = await amadeus.shopping.hotelOffers.get({
    cityCode: params.cityCode,
    checkInDate: params.checkInDate,
    checkOutDate: params.checkOutDate,
    adults: params.adults,
    roomQuantity: params.rooms
  });

  return response.data;
}
```

**Rate Limits**:
- Free tier: 100 requests/day
- Production: Contact Amadeus for quota increase

---

## Testing Strategy

### 1. Unit Tests (Jest)
```typescript
// __tests__/lib/store/use-hotel-store.test.ts
import { renderHook, act } from "@testing-library/react";
import { useHotelStore } from "@/lib/store/use-hotel-store";

describe("useHotelStore", () => {
  it("should set hotel and expiry time", () => {
    const { result } = renderHook(() => useHotelStore());

    act(() => {
      result.current.setHotel(mockHotel);
    });

    expect(result.current.selectedHotel).toEqual(mockHotel);
    expect(result.current.expiresAt).toBeDefined();
  });

  it("should clear hotel after 20 minutes", () => {
    // Test expiry logic
  });
});
```

### 2. Integration Tests (API)
```typescript
// __tests__/api/hotel-search.test.ts
import { POST } from "@/app/api/hotel-search/route";

describe("/api/hotel-search", () => {
  it("should return hotels for valid search", async () => {
    const req = new Request("http://localhost/api/hotel-search", {
      method: "POST",
      body: JSON.stringify({
        location: "New York",
        checkInDate: "2025-12-01",
        checkOutDate: "2025-12-05",
        guests: 2
      })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.hotels).toBeInstanceOf(Array);
  });

  it("should return 400 for invalid input", async () => {
    // Test validation
  });
});
```

### 3. E2E Tests (Playwright)
```typescript
// e2e/hotel-booking.spec.ts
import { test, expect } from "@playwright/test";

test("complete hotel booking flow", async ({ page }) => {
  // 1. Search for hotels
  await page.goto("/hotels");
  await page.fill('input[name="location"]', "New York");
  await page.fill('input[name="checkIn"]', "2025-12-01");
  await page.fill('input[name="checkOut"]', "2025-12-05");
  await page.click('button[type="submit"]');

  // 2. Select hotel
  await page.click('.hotel-card:first-child button');

  // 3. Fill guest info
  await page.fill('input[name="firstName"]', "John");
  await page.fill('input[name="lastName"]', "Doe");

  // 4. Payment
  await page.click('button:has-text("Proceed to Payment")');
  // ... payment flow

  // 5. Verify confirmation
  await expect(page).toHaveURL(/\/booking\/confirmation/);
  await expect(page.locator("h1")).toContainText("Booking Confirmed");
});
```

---

## Performance Optimization

### 1. Caching Strategy

```typescript
// Simple in-memory cache (for development)
const cache = new Map<string, { data: any, expires: number }>();

export function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

export function setCache(key: string, data: any, ttl: number = 15 * 60 * 1000) {
  cache.set(key, { data, expires: Date.now() + ttl });
}

// Usage in API route
export async function POST(req: NextRequest) {
  const body = await req.json();
  const cacheKey = `hotel-search:${JSON.stringify(body)}`;

  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  const hotels = await searchHotels(body);
  setCache(cacheKey, hotels, 15 * 60 * 1000);  // 15 minutes

  return NextResponse.json(hotels);
}
```

### 2. Database Indexes

```typescript
// CRITICAL: Add these indexes for performance
OrderSchema.index({ userId: 1, "data.type": 1 });  // User's bookings by type
OrderSchema.index({ createdAt: -1 });              // Recent bookings
OrderSchema.index({ status: 1 });                  // Filter by status
OrderSchema.index({ groupId: 1 });                 // Multi-item bookings
```

### 3. Image Optimization

```typescript
// Use Next.js Image component for hotel/car images
import Image from "next/image";

<Image
  src={hotel.imageUrl}
  alt={hotel.name}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

---

## Security Checklist

### API Security:
- [ ] All endpoints require authentication (NextAuth session)
- [ ] Input validation with Zod schemas
- [ ] Rate limiting on search endpoints
- [ ] CSRF protection (built into Next.js)
- [ ] Sanitize user inputs (prevent XSS)
- [ ] Secure API keys (never expose in client code)

### Payment Security:
- [ ] Use Stripe Payment Intents (PCI-compliant)
- [ ] Verify webhook signatures
- [ ] Never store credit card info
- [ ] Use HTTPS only

### Database Security:
- [ ] Use parameterized queries (Mongoose does this)
- [ ] Validate all data before saving
- [ ] Implement soft deletes (don't expose deleted data)
- [ ] Encrypt sensitive fields (if needed)

---

## Deployment Checklist

### Environment Variables:
```bash
# .env.production
AMADEUS_CLIENT_ID=xxx
AMADEUS_CLIENT_SECRET=xxx
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
MONGODB_URI=xxx
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=https://your-domain.com
GOOGLE_MAPS_API_KEY=xxx
RESEND_API_KEY=xxx
```

### Build Checks:
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] All tests pass (`npm test`)
- [ ] Lighthouse score > 90
- [ ] No console errors in production build

### Post-Deployment:
- [ ] Test all booking flows in production
- [ ] Monitor API rate limits
- [ ] Check error logs (Sentry/LogRocket)
- [ ] Monitor Stripe webhook delivery
- [ ] Test email delivery

---

## Troubleshooting Guide

### Common Issues:

**Issue**: API returns 401 Unauthorized
**Fix**: Check NextAuth session, ensure user is logged in

**Issue**: Hotel search returns no results
**Fix**: Verify Amadeus API credentials, check rate limits

**Issue**: Payment fails
**Fix**: Check Stripe webhook configuration, verify API keys

**Issue**: Zustand store clears unexpectedly
**Fix**: Check 20-minute expiry logic, verify localStorage persistence

**Issue**: Images not loading
**Fix**: Check Cloudinary/image host CORS settings, use Next.js Image component

---

## Contact & Support

**Technical Lead**: [TBD]
**Backend Lead**: [TBD]
**Frontend Lead**: [TBD]

**Resources**:
- Amadeus API Docs: https://developers.amadeus.com
- Stripe Docs: https://stripe.com/docs
- Next.js Docs: https://nextjs.org/docs
- Zustand Docs: https://zustand-demo.pmnd.rs

---

**Document Version**: 1.0
**Last Updated**: 2025-11-17
