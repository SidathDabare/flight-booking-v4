# Amadeus API Expert Skill - User Guide

## Overview

This skill transforms Claude into a comprehensive Amadeus API integration expert with complete knowledge of all Amadeus Self-Service APIs, authentication, error handling, and best practices. It's specifically designed for your B2C travel booking platform development.

## What This Skill Provides

### 1. Complete API Knowledge
- **All Flight APIs**: Search, pricing, booking, seat maps, ancillaries
- **Hotel APIs**: Search, booking, ratings
- **Airport & Airline Data**: Autocomplete, lookups, destinations
- **Travel Analytics**: Market insights, predictions, trends
- **Transfers & Activities**: Ground transportation, tours

### 2. Practical Tools
- **Codebase Analyzer**: Scans your project to find all Amadeus API usage
- **Request Builder**: Helps construct properly formatted API calls
- **Error Decoder**: Explains error codes and provides fixes
- **Authentication Manager**: Token lifecycle and refresh patterns

### 3. Integration Patterns
- Complete booking flows
- Error handling with retry logic
- Token management strategies
- Data transformation examples
- Production migration guidance

## Installation

Upload the `amadeus-api-expert.skill` file to Claude through:
1. Click the paperclip icon in Claude
2. Select "Upload files"
3. Choose the .skill file
4. The skill is now available in your conversation

## Usage Examples

### Example 1: Understanding an Endpoint

**You ask:**
> "Explain the flight-offers-search endpoint with all parameters"

**Claude will:**
1. Read the API reference documentation
2. Provide complete endpoint details:
   - Full path: `GET /v2/shopping/flight-offers`
   - All required parameters with examples
   - All optional parameters with use cases
   - Response structure
   - Code examples in your tech stack

### Example 2: Building a Request

**You ask:**
> "Create a request to search for refundable business class flights from NYC to London"

**Claude will:**
1. Identify the correct endpoint
2. Build complete request with:
   - URL with query parameters
   - Required headers with authentication
   - All necessary filters (refundableFare=true, travelClass=BUSINESS)
3. Show both cURL and Next.js/Node.js examples
4. Explain how to handle the response

### Example 3: Debugging Errors

**You ask:**
> "I'm getting error 38190 from Amadeus API"

**Claude will:**
1. Look up error code 38190 in the reference
2. Explain: "Invalid or expired access token"
3. Show how to:
   - Detect this error in code
   - Refresh the token automatically
   - Implement retry logic
4. Provide code example for token refresh

### Example 4: Analyzing Your Codebase

**You ask:**
> "Analyze my project for Amadeus API usage"

**Claude will:**
1. Run the codebase analyzer script on your project
2. Generate a detailed report showing:
   - Which files use Amadeus APIs
   - What endpoints you're currently using
   - How many API calls in each file
   - Code samples from your project
3. Provide recommendations for:
   - Missing endpoints that could enhance your app
   - Better error handling
   - Authentication improvements

### Example 5: Production Migration

**You ask:**
> "How do I move my Amadeus integration to production?"

**Claude will:**
1. Explain test vs production differences
2. Guide you through:
   - Getting production credentials
   - Updating base URLs
   - Understanding real-time data
   - Ticketing requirements
3. Provide environment configuration code
4. Discuss monitoring and error tracking

## Key Features

### 🔍 Comprehensive API Reference
- 30+ endpoints documented
- Request/response formats
- All parameters explained
- Error codes with solutions
- Rate limits and quotas

### 🛠️ Codebase Analysis Tool
The included Python script scans your entire project and finds:
- All Amadeus API calls
- Which endpoints you're using
- Patterns and anti-patterns
- Missing error handling
- Optimization opportunities

**Run manually:**
```bash
python scripts/analyze_codebase.py /path/to/your/project
```

### 📚 Real-World Patterns
- Token management with auto-refresh
- Error handling with exponential backoff
- Data transformation utilities
- Complete booking flow examples
- Performance optimization tips

## When Claude Uses This Skill

The skill automatically triggers when you:
- Ask about Amadeus APIs
- Mention specific endpoints (flight-offers-search, etc.)
- Ask about authentication or errors
- Request code examples for Amadeus
- Want to analyze your codebase
- Need help debugging API issues
- Ask about production deployment

## What Makes This Skill Unique

### 1. Built from Official Docs
All information comes directly from Amadeus developer documentation and official SDKs - no hallucinations.

### 2. Context-Aware
Understands your B2C platform context and provides relevant examples for Next.js, TypeScript, and MongoDB.

### 3. Practical Tools
Includes working Python script to analyze your actual codebase, not just theoretical knowledge.

### 4. Production-Ready
Covers real-world concerns like:
- Ticketing requirements
- Rate limiting
- Error handling
- Token management
- Performance optimization

### 5. Complete Coverage
Every major Amadeus API endpoint:
- Flight search, pricing, booking
- Hotels, transfers, activities
- Analytics and predictions
- Reference data

## Skill Structure

```
amadeus-api-expert/
├── SKILL.md                          # Main skill guide with workflows
├── references/
│   └── api_reference.md              # Complete API documentation
└── scripts/
    └── analyze_codebase.py           # Codebase analyzer tool
```

## Tips for Best Results

### 1. Be Specific
❌ "How do I use Amadeus?"
✅ "Show me how to search for round-trip flights with the Amadeus API"

### 2. Mention Your Tech Stack
❌ "Create an API call"
✅ "Create a Next.js API route for Amadeus flight search"

### 3. Ask for Code
❌ "Explain flight booking"
✅ "Show me complete TypeScript code for the Amadeus booking flow"

### 4. Use the Analyzer
Run the codebase analyzer on your project to get specific, actionable feedback about YOUR Amadeus integration.

### 5. Ask Follow-ups
The skill retains context, so you can drill down:
- "Now add refundable fare filtering"
- "What if the token expires?"
- "Show me error handling for that"

## Common Use Cases

### For New Integration
1. "What Amadeus APIs do I need for a flight booking platform?"
2. "Show me the complete authentication flow"
3. "Create a Next.js API route for flight search"
4. "How do I handle errors?"

### For Existing Integration
1. "Analyze my codebase for Amadeus usage"
2. "How can I optimize my API calls?"
3. "I'm getting this error, how do I fix it?"
4. "Help me add refundable fare filtering"

### For Production
1. "How do I move to production?"
2. "What are the ticketing requirements?"
3. "Set up proper error handling"
4. "Implement token refresh logic"

## Integration with Your Project

This skill is designed specifically for your travel booking platform refactoring from B2B to B2C. It understands:

- Your Next.js 14 + TypeScript stack
- MongoDB data storage needs
- Stripe payment integration context
- Your 8-10 week MVP timeline
- B2C consumer-facing requirements

When you ask questions, Claude will provide answers that fit your specific tech stack and project goals.

## Updating the Skill

As Amadeus releases new APIs or you discover new patterns, you can:
1. Modify the reference documentation
2. Add new scripts
3. Update workflows in SKILL.md
4. Re-package using the included packaging script

## Support & Troubleshooting

### If the skill doesn't trigger:
- Make sure it's uploaded to your conversation
- Mention "Amadeus API" explicitly in your question
- Try asking "What Amadeus endpoints are available?"

### If you need more detail:
- Ask Claude to read specific sections of the references
- Request code examples
- Ask for step-by-step explanations

### For codebase analysis:
- Ensure Python 3 is installed
- Run from project root directory
- Check output JSON file for detailed results

## Next Steps

1. **Upload the skill** to your Claude conversation
2. **Test it** with a question like "Explain the flight-offers-search API"
3. **Analyze your codebase** if you have existing Amadeus code
4. **Build your integration** with Claude's guidance
5. **Iterate** as you encounter specific challenges

## Summary

This skill gives Claude expert-level knowledge of Amadeus APIs with practical tools to help you build your B2C travel platform. It combines comprehensive documentation, real code examples, and a codebase analyzer to provide specific, actionable guidance for your integration.

**Key Benefits:**
✅ Complete API coverage (30+ endpoints)
✅ Production-ready code examples
✅ Error handling and retry logic
✅ Codebase analysis tool
✅ Context-aware for your Next.js/TypeScript stack
✅ Based on official Amadeus documentation
✅ Practical integration patterns

Ready to build your travel platform with expert Amadeus integration support!
