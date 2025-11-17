# Amadeus API Research & Implementation Plan

## Current Status: CRITICAL ISSUES FOUND

### Issues Discovered:
1. **Hotel API Implementation**: Currently using incorrect endpoint
2. **Car Rental API**: Amadeus does NOT have a car rental API in the amadeus-ts package
3. **API Flow**: Not following the correct 2-step process for hotels

---

## 1. HOTEL SEARCH API - Correct Implementation

### Official Amadeus Hotel Search Flow (2-Step Process):

#### **Step 1: Get Hotel IDs**
You MUST first get hotel IDs using one of these endpoints:

**Option A: Search by City Code**
```typescript
amadeus.referenceData.locations.hotels.byCity.get({
  cityCode: 'PAR',  // 3-letter IATA city code
  radius: 5,        // Search radius in KM
  radiusUnit: 'KM',
  ratings: '1,2,3,4,5',  // Hotel ratings
  amenities: 'SWIMMING_POOL,SPA,FITNESS_CENTER,AIR_CONDITIONING,RESTAURANT,PARKING,PETS_ALLOWED,AIRPORT_SHUTTLE,BUSINESS_CENTER,DISABLED_FACILITIES,WIFI,FAMILY_ROOMS,NON_SMOKING_ROOMS'
})
```

**Option B: Search by Geographic Coordinates**
```typescript
amadeus.referenceData.locations.hotels.byGeocode.get({
  latitude: 48.85341,
  longitude: 2.3488,
  radius: 5,
  radiusUnit: 'KM'
})
```

**Option C: Search by Hotel IDs (if you already know them)**
```typescript
amadeus.referenceData.locations.hotels.byHotels.get({
  hotelIds: 'ACPAR245,HLPAR001'
})
```

**Response Example:**
```json
{
  "data": [
    {
      "chainCode": "AC",
      "iataCode": "PAR",
      "dupeId": 700033211,
      "name": "Hotel Paris",
      "hotelId": "ACPAR245",
      "geoCode": {
        "latitude": 48.8534,
        "longitude": 2.3488
      },
      "address": {
        "countryCode": "FR"
      }
    }
  ]
}
```

#### **Step 2: Search Hotel Offers (Availability & Pricing)**
After getting hotel IDs, search for offers:

```typescript
amadeus.shopping.hotelOffersSearch.get({
  hotelIds: 'ACPAR245,HLPAR001',  // Comma-separated hotel IDs from Step 1
  adults: 2,
  checkInDate: '2025-12-01',      // YYYY-MM-DD format
  checkOutDate: '2025-12-05',
  roomQuantity: 1,
  currency: 'USD',
  priceRange: '100-500',
  paymentPolicy: 'NONE',          // GUARANTEE | DEPOSIT | NONE
  boardType: 'ROOM_ONLY',         // ROOM_ONLY | BREAKFAST | HALF_BOARD | FULL_BOARD | ALL_INCLUSIVE
  bestRateOnly: true,
  includeClosed: false,
  lang: 'en'
})
```

**Parameters Available:**
- `hotelIds` (required): String of comma-separated hotel IDs
- `adults`: Number of adult guests (1-9)
- `checkInDate`: YYYY-MM-DD
- `checkOutDate`: YYYY-MM-DD
- `countryOfResidence`: 2-letter country code
- `priceRange`: "min-max" format
- `currencyCode`: Currency for pricing
- `paymentPolicy`: Payment requirements
- `boardType`: Meal plan included
- `bestRateOnly`: Boolean - return only best rate per hotel
- `includeClosed`: Include hotels that don't return offers
- `lang`: Language code for descriptions

**Response Type:**
```typescript
{
  data: HotelOffers[]
}

type HotelOffers = {
  type: "hotel-offers"
  hotel: {
    hotelId: string
    chainCode?: string
    dupeId?: string
    name?: string
    cityCode?: string
    latitude?: number
    longitude?: number
  }
  offers: HotelOffer[]
}

type HotelOffer = {
  id: string
  checkInDate: string
  checkOutDate: string
  rateCode?: string
  room: {
    type?: string
    typeEstimated?: {
      category?: string
      beds?: number
      bedType?: string
    }
    description?: {
      text?: string
      lang?: string
    }
  }
  guests: {
    adults: number
  }
  price: {
    currency: string
    base: string
    total: string
    taxes?: Array<{
      amount: string
      currency: string
      code: string
      percentage?: string
      included?: boolean
      description?: string
      pricingFrequency?: string
      pricingMode?: string
    }>
  }
  policies: {
    paymentType?: string
    cancellation?: {
      deadline?: string
      amount?: string
      type?: string
    }
  }
}
```

---

## 2. CAR RENTAL API - CRITICAL FINDING

### ⚠️ **Amadeus DOES NOT have a Car Rental API**

After thorough research:
- The `amadeus-ts` package does NOT include car rental endpoints
- Amadeus Self-Service APIs do NOT currently offer car rental search
- Only **Transfer Search API** exists (for airport transfers/shuttles, NOT car rentals)

### Transfer Search API (NOT for car rentals):
```typescript
amadeus.shopping.transferOffers.post({
  startLocationCode: 'CDG',
  endAddressLine: 'Avenue Anatole France, 5',
  endCityName: 'Paris',
  endZipCode: '75007',
  endCountryCode: 'FR',
  transferType: 'PRIVATE',
  startDateTime: '2023-11-10T10:30:00',
  passengers: 2
})
```

### **Solutions for Car Rental:**

#### Option 1: Use a different car rental API (Recommended)
- **Travelpayouts** (Economybookings, DiscoverCars)
- **Rental Cars API** (rentalcars.com)
- **CarTrawler API**
- **Skyscanner Car Hire API**

#### Option 2: Mock car rental data
- Create realistic mock data for demonstration
- Plan to integrate actual car rental API later

#### Option 3: Remove car rental feature
- Focus only on flights and hotels (Amadeus supported)

---

## 3. CURRENT IMPLEMENTATION PROBLEMS

### Hotel Search API (`app/api/hotel-search/route.ts`):

**WRONG:**
```typescript
// Line 85 - This won't work without hotel IDs!
const response = await amadeusToken.shopping.hotelOffersSearch.get(searchParams);
```

**Problem**: `hotelOffersSearch.get()` REQUIRES `hotelIds` parameter. You can't search by city code directly.

**CORRECT Approach:**
```typescript
// Step 1: Get hotel IDs by city or geocode
const hotelsListResponse = await amadeusToken.referenceData.locations.hotels.byCity.get({
  cityCode: validatedData.cityCode,
  radius: validatedData.radius || 5,
  radiusUnit: 'KM'
});

// Extract hotel IDs
const hotelIds = hotelsListResponse.data.map(hotel => hotel.hotelId).join(',');

// Step 2: Search for offers with those hotel IDs
const offersResponse = await amadeusToken.shopping.hotelOffersSearch.get({
  hotelIds: hotelIds,
  checkInDate: validatedData.checkInDate,
  checkOutDate: validatedData.checkOutDate,
  adults: validatedData.adults,
  roomQuantity: validatedData.rooms,
  currency: validatedData.currency
});
```

### Car Search API (`app/api/car-search/route.ts`):

**WRONG:**
```typescript
// Lines 89-99 - This API doesn't exist!
// const response = await amadeusToken.shopping.carRentals.get(searchParams);
const result = {
  data: [],
  meta: { count: 0 }
};
```

**Problem**: Returning empty data because there's no Amadeus car rental API.

---

## 4. EDREAMS-STYLE INTERFACE REQUIREMENTS

### Hotel Search Form Features:
1. **Location Input**
   - Autocomplete with city names
   - Support for city codes
   - Recent searches
   - Popular destinations

2. **Date Selection**
   - Calendar with date range picker
   - Flexible dates option
   - Show prices by date (optional)

3. **Guests & Rooms**
   - Adults/children counters
   - Multiple rooms support
   - Age-specific requirements

4. **Filters (Results Page)**
   - Price range slider
   - Star rating
   - Amenities checkboxes
   - Meal plan options
   - Guest rating
   - Distance from center

### Car Rental Form Features (If implementing):
1. **Location**
   - Pickup location autocomplete
   - Return to different location option
   - Airport vs city locations

2. **Dates & Times**
   - Date + time pickers
   - Minimum rental period

3. **Driver Info**
   - Age selection
   - License requirements

4. **Filters**
   - Car type/category
   - Transmission
   - Fuel policy
   - Unlimited mileage
   - Insurance options

---

## 5. RECOMMENDED IMPLEMENTATION PLAN

### Phase 1: Fix Hotel Search (Priority: HIGH)
1. ✅ Update `app/api/hotel-search/route.ts` to use 2-step process
2. ✅ Add hotel list caching to improve performance
3. ✅ Update types to match Amadeus response structure
4. ✅ Add proper error handling for each step
5. ✅ Update frontend to handle new response format

### Phase 2: Decision on Car Rentals (Priority: HIGH)
**Choose ONE:**
- [ ] Option A: Integrate third-party car rental API (Recommended)
- [ ] Option B: Use mock data for demonstration
- [ ] Option C: Remove car rental feature

### Phase 3: Enhance UI/UX (Priority: MEDIUM)
1. [ ] Implement eDreams-style hotel search form
2. [ ] Add autocomplete for city search
3. [ ] Improve date picker UX
4. [ ] Add filters to results page
5. [ ] Implement sorting options

### Phase 4: Testing & Optimization (Priority: MEDIUM)
1. [ ] Test with real Amadeus Test API credentials
2. [ ] Optimize caching strategy
3. [ ] Add loading states and skeletons
4. [ ] Error handling improvements
5. [ ] Performance monitoring

---

## 6. API CREDENTIALS NEEDED

### For Amadeus (Hotels Only):
- ✅ `AMADEUS_CLIENT_ID` - Already configured
- ✅ `AMADEUS_CLIENT_SECRET` - Already configured
- ✅ Currently using TEST environment

### For Car Rentals (If choosing Option A):
Need to register with one of:
- Travelpayouts
- RentalCars.com API
- CarTrawler
- Skyscanner

---

## 7. CODE EXAMPLES

### Example: Complete Hotel Search Flow

```typescript
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { cityCode, checkInDate, checkOutDate, adults, rooms, currency } = body;

    // STEP 1: Get hotels by city
    const hotelsListResponse = await amadeusToken.referenceData.locations.hotels.byCity.get({
      cityCode: cityCode,
      radius: 5,
      radiusUnit: 'KM'
    });

    if (!hotelsListResponse.data || hotelsListResponse.data.length === 0) {
      return NextResponse.json({
        error: "No hotels found in this city"
      }, { status: 404 });
    }

    // STEP 2: Get offers for those hotels
    const hotelIds = hotelsListResponse.data
      .slice(0, 50) // Limit to 50 hotels to avoid timeout
      .map(hotel => hotel.hotelId)
      .join(',');

    const offersResponse = await amadeusToken.shopping.hotelOffersSearch.get({
      hotelIds: hotelIds,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      adults: adults,
      roomQuantity: rooms,
      currency: currency,
      bestRateOnly: true
    });

    return NextResponse.json({
      data: offersResponse.data,
      meta: {
        count: offersResponse.data.length
      }
    });

  } catch (error) {
    console.error("Hotel search error:", error);
    return NextResponse.json({
      error: "Hotel search failed"
    }, { status: 500 });
  }
}
```

---

## 8. NEXT STEPS

### Immediate Actions Required:

1. **DECIDE on car rental approach** (Option A, B, or C above)
2. **FIX hotel search API** to use 2-step process
3. **UPDATE hotel types** to match Amadeus response
4. **TEST with real Amadeus credentials**
5. **IMPROVE UI** to match eDreams style

### Questions to Answer:

1. Do you want to keep car rental feature?
2. If yes, which third-party API should we use?
3. What's your priority: speed to market or feature completeness?
4. Do you have budget for additional API subscriptions?

---

## References

- [Amadeus Hotels APIs](https://developers.amadeus.com/self-service/category/hotels)
- [Hotel Search API V3 Docs](https://developers.amadeus.com/self-service/category/hotels/api-doc/hotel-search)
- [Hotel List API Docs](https://developers.amadeus.com/self-service/category/hotels/api-doc/hotel-list)
- [amadeus-ts GitHub](https://github.com/darseen/amadeus-ts)
- [amadeus-ts npm package](https://www.npmjs.com/package/amadeus-ts)
