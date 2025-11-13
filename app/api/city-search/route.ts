import amadeusToken from "@/lib/amadeusToken";
import { NextRequest, NextResponse } from "next/server";
import { ResponseError } from "amadeus-ts";

// Utility function for retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      // Don't retry if it's not a rate limit error or if we've exhausted retries
      if (error.response?.status !== 429 || attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      //console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// GET /api/city-search -search for cities and airports by params

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export const GET = async (req: NextRequest) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  const keyword = new URL(req.url).searchParams.get("keyword");

  if (!keyword || keyword.trim().length === 0) {
    return NextResponse.json(
      { error: "Keyword parameter is required" },
      { status: 400, headers }
    );
  }

  try {
    //console.log(`Searching for locations with keyword: ${keyword}`);

    const data = await retryWithBackoff(async () => {
      return await amadeusToken.referenceData.locations.get({
        keyword: keyword as string,
        subType: "AIRPORT",
        page: { offset: 0, limit: 10 },
      });
    });

    return NextResponse.json(data.data, { status: 200, headers });
  } catch (error: any) {
    //console.error("Amadeus API Error in city-search:", error);

    // Handle specific Amadeus errors
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: "Authentication failed with Amadeus API" },
        { status: 401, headers }
      );
    }

    if (error.response?.status === 400) {
      return NextResponse.json(
        { error: "Invalid search parameters" },
        { status: 400, headers }
      );
    }

    if (error.response?.status === 429) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: error.response?.headers?.['retry-after'] || 60
        },
        { 
          status: 429, 
          headers: {
            ...headers,
            'Retry-After': error.response?.headers?.['retry-after'] || '60'
          }
        }
      );
    }

    return NextResponse.json(
      {
        error: error.message || "An error occurred while fetching city data",
        details: error.response?.data || error.response?.body || null,
      },
      { status: 500, headers }
    );
  }
};

// // url structure: /api/city-search?keyword=london
