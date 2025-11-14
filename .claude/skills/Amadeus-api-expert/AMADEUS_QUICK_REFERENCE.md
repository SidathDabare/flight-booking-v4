# Amadeus API Quick Reference Card

## 🔑 Authentication

```bash
# Get Access Token
POST https://test.api.amadeus.com/v1/security/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id={KEY}&client_secret={SECRET}

# Response
{
  "access_token": "YOUR_TOKEN",
  "expires_in": 1799  # 30 minutes
}

# Use Token
Authorization: Bearer YOUR_TOKEN
```

## ✈️ Flight Search

### Simple Search
```bash
GET /v2/shopping/flight-offers?originLocationCode=NYC&destinationLocationCode=LON&departureDate=2025-12-15&adults=1
```

### With Filters
```bash
# Refundable, Business Class, Direct Flights Only
GET /v2/shopping/flight-offers
  ?originLocationCode=NYC
  &destinationLocationCode=LON
  &departureDate=2025-12-15
  &adults=1
  &refundableFare=true
  &travelClass=BUSINESS
  &nonStop=true
  &max=50
```

## 💰 Price Confirmation

```bash
POST /v1/shopping/flight-offers/pricing
Content-Type: application/json

{
  "data": {
    "type": "flight-offers-pricing",
    "flightOffers": [/* from search */]
  }
}
```

## 📝 Flight Booking

```bash
POST /v1/booking/flight-orders
Content-Type: application/json

{
  "data": {
    "type": "flight-order",
    "flightOffers": [/* priced offers */],
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
          "number": "1234567890"
        }]
      }
    }]
  }
}
```

## 🏨 Hotel Search

```bash
GET /v3/shopping/hotel-offers
  ?hotelIds=RTPAR001
  &adults=2
  &checkInDate=2025-12-15
  &checkOutDate=2025-12-20
```

## 🗺️ Airport Search (Autocomplete)

```bash
GET /v1/reference-data/locations
  ?keyword=LON
  &subType=AIRPORT,CITY
```

## 🛫 Flight Status

```bash
GET /v2/schedule/flights
  ?carrierCode=BA
  &flightNumber=777
  &scheduledDepartureDate=2025-12-15
```

## 🎫 Seat Maps

```bash
POST /v1/shopping/seatmaps
Content-Type: application/json

{
  "data": [/* flight offer */]
}
```

## 📊 Flight Analytics

```bash
# Most Booked Destinations
GET /v1/travel/analytics/air-traffic/booked
  ?originCityCode=NYC
  &period=2025-12

# Price History
GET /v1/analytics/itinerary-price-metrics
  ?originIataCode=NYC
  &destinationIataCode=LON
  &departureDate=2025-12-15
```

## ⚠️ Common Error Codes

| Code | Status | Meaning | Fix |
|------|--------|---------|-----|
| 38190 | 401 | Invalid/expired token | Refresh token |
| 38187 | 401 | Invalid credentials | Check API key/secret |
| 4926 | 400 | Invalid data | Verify parameters |
| 429 | 429 | Rate limit exceeded | Implement backoff |
| 404 | 404 | Endpoint not found | Check URL spelling |
| 500 | 500 | Server error | Retry with backoff |

## 🔄 Error Handling Pattern

```javascript
async function callAmadeus(url, options) {
  const maxRetries = 3;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      // Token expired
      if (response.status === 401) {
        await refreshToken();
        options.headers.Authorization = `Bearer ${newToken}`;
        continue;
      }
      
      // Rate limited
      if (response.status === 429) {
        await sleep(Math.pow(2, i) * 1000);
        continue;
      }
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

## 🌐 Environment URLs

| Environment | Base URL |
|-------------|----------|
| Test | `https://test.api.amadeus.com` |
| Production | `https://api.amadeus.com` |

## 📦 Rate Limits

| Environment | Limit | Quota |
|-------------|-------|-------|
| Test | 1 call/100ms | 200-10k/month (free) |
| Production | 1 call/100ms | Unlimited (pay-as-you-go) |

## 🔧 Node.js SDK Quick Setup

```javascript
npm install amadeus

const Amadeus = require('amadeus');

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
  hostname: 'production' // or 'test'
});

// Search flights
const response = await amadeus.shopping.flightOffersSearch.get({
  originLocationCode: 'NYC',
  destinationLocationCode: 'LON',
  departureDate: '2025-12-15',
  adults: '1'
});
```

## 🐍 Python SDK Quick Setup

```python
pip install amadeus

from amadeus import Client, ResponseError

amadeus = Client(
    client_id='YOUR_API_KEY',
    client_secret='YOUR_API_SECRET',
    hostname='test'  # or 'production'
)

try:
    response = amadeus.shopping.flight_offers_search.get(
        originLocationCode='NYC',
        destinationLocationCode='LON',
        departureDate='2025-12-15',
        adults=1
    )
    print(response.data)
except ResponseError as error:
    print(error)
```

## 📋 Parameter Quick Reference

### Passenger Types
- `adults` - Age 12+
- `children` - Age 2-11  
- `infants` - Under 2

### Travel Classes
- `ECONOMY`
- `PREMIUM_ECONOMY`
- `BUSINESS`
- `FIRST`

### Date Format
- Always: `YYYY-MM-DD`

### IATA Codes
- City: 3 letters (NYC, LON, PAR)
- Airport: 3 letters (JFK, LHR, CDG)

### Currency Codes
- ISO 4217 (USD, EUR, GBP)

## 🚀 Complete Booking Flow

```
1. Search Flights
   GET /v2/shopping/flight-offers

2. Confirm Price
   POST /v1/shopping/flight-offers/pricing

3. Get Seat Map (optional)
   POST /v1/shopping/seatmaps

4. Create Booking
   POST /v1/booking/flight-orders

5. Retrieve Order
   GET /v1/booking/flight-orders/{orderId}

6. Cancel if needed
   DELETE /v1/booking/flight-orders/{orderId}
```

## 💡 Best Practices

1. **Cache tokens** - Valid for 30 minutes
2. **Cache reference data** - Airports, airlines (24-48 hrs)
3. **Implement retry logic** - Exponential backoff
4. **Validate before API calls** - IATA codes, dates
5. **Always confirm price** - Before booking
6. **Handle errors gracefully** - User-friendly messages
7. **Monitor quota** - Especially in test environment
8. **Use POST for complex** - Multi-city, many filters
9. **Debounce search input** - Wait 300-500ms
10. **Test in sandbox first** - Then move to production

## 🔗 Useful Links

- **Docs**: https://developers.amadeus.com
- **GitHub**: https://github.com/amadeus4dev
- **Postman**: Amadeus for Developers collection
- **Stack Overflow**: Tag `amadeus`

---

**For detailed documentation, use the Amadeus API Expert skill with Claude!**
