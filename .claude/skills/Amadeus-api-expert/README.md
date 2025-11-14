# Amadeus API Expert Skill

A comprehensive Claude Code skill that provides expert guidance on Amadeus Self-Service API integration for the Next.js flight booking application.

## What This Skill Provides

### Core Knowledge Areas
- **Authentication:** OAuth 2.0 client credentials flow with token caching
- **Flight APIs:** Search, pricing, booking, seat maps, and order management
- **Hotel APIs:** Search and booking workflows
- **Reference Data:** Airport/city autocomplete, airline information
- **Error Handling:** Comprehensive error codes and retry strategies
- **TypeScript Integration:** Complete type definitions for API responses

### Key Features
- Next.js 15 API route patterns with Amadeus integration
- Zustand state management for search and booking flows
- Zod validation schemas for API parameters
- Token caching and automatic refresh logic
- Exponential backoff retry strategies
- User-friendly error message mapping
- Test vs Production environment guidance

## When This Skill Activates

The skill automatically triggers when you ask about:
- Amadeus API endpoints (flight-offers-search, hotel-offers, etc.)
- Flight search, pricing, or booking workflows
- Authentication and token management
- Amadeus error codes and debugging
- TypeScript types for API responses
- Integration with Next.js API routes

## Usage Examples

### Get Help with an Endpoint
```
"How do I search for flights with Amadeus API?"
"Show me the flight-offers-pricing endpoint"
"What parameters does the hotel search API accept?"
```

### Build Integration Code
```
"Create a Next.js API route for Amadeus flight search"
"Implement token caching for Amadeus authentication"
"Build a Zustand store for managing flight search results"
```

### Debug Issues
```
"I'm getting error 38190 from Amadeus, how do I fix it?"
"How do I handle rate limiting (429 errors)?"
"Why is my flight booking request failing?"
```

### Understand Workflows
```
"Explain the complete flight booking flow"
"What's the difference between test and production environments?"
"How do I confirm pricing before booking?"
```

## Integration with Project

This skill is specifically tailored for your flight booking application:
- Uses Next.js 15 App Router patterns
- Follows your TypeScript strict mode conventions
- Integrates with NextAuth authentication
- Uses Zod for validation (consistent with your forms)
- Follows your MongoDB/Mongoose data model patterns
- Respects your error handling conventions

## Best Practices Included

1. **Always confirm pricing** before creating bookings
2. **Cache tokens** with 5-minute buffer before expiry
3. **Implement retry logic** for transient errors
4. **Validate inputs** with Zod schemas
5. **Use TypeScript** strictly for type safety
6. **Never expose** raw API errors to users
7. **Cache reference data** (airports, airlines) for 24 hours
8. **Test thoroughly** in test environment first

## What Makes This Skill Different

### From Generic API Knowledge
- Specifically designed for Next.js + TypeScript stack
- Includes complete working code examples
- Follows your project's patterns and conventions
- Provides production-ready implementations

### From Amadeus Documentation
- Interactive Q&A format tailored to your needs
- Code examples specific to your tech stack
- Explains both "why" and "how"
- Includes common pitfalls and solutions
- Project-specific integration patterns

## Optimization Benefits

**Optimized from original version:**
- Single-file skill (faster loading)
- Progressive disclosure (loads only what's needed)
- Project-specific examples (no generic boilerplate)
- Integrated with Next.js patterns (matches your codebase)
- Removed redundant documentation
- Removed unnecessary Python analyzer (use Claude Code's built-in tools)
- Streamlined for performance

## Quick Reference

### Common Endpoints
- `GET /v2/shopping/flight-offers` - Search flights
- `POST /v1/shopping/flight-offers/pricing` - Confirm price
- `POST /v1/booking/flight-orders` - Create booking
- `GET /v1/reference-data/locations` - Airport autocomplete
- `GET /v3/shopping/hotel-offers` - Search hotels

### Environment Variables
```
AMADEUS_API_KEY=your_key
AMADEUS_API_SECRET=your_secret
AMADEUS_BASE_URL=https://test.api.amadeus.com  # or api.amadeus.com for prod
```

### Common Error Codes
- `38190` - Token expired (auto-handled by retry logic)
- `4926` - Invalid parameters (validate with Zod)
- `32171` - No results found (adjust search criteria)
- `37200` - Flight no longer available (show alternatives)
- `429` - Rate limited (exponential backoff)

## Official Resources

- Amadeus Developer Portal: https://developers.amadeus.com
- API Reference: https://developers.amadeus.com/self-service
- GitHub: https://github.com/amadeus4dev
- Support: Stack Overflow with `amadeus` tag

---

Ready to accelerate your Amadeus API integration with expert guidance!
