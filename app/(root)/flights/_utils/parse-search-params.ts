import { FlightSearch, flightSearchSchema } from "@/lib/zod/search";
import { format } from "date-fns";

type SearchParamsInput = {
  [key: string]: string | string[] | undefined;
};

export default function parseSearchParams(searchParams: SearchParamsInput) {
  const parseDate = (
    value: string | string[] | undefined,
  ): string | undefined => {
    if (!value || Array.isArray(value)) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : format(date, "yyyy-MM-dd");
  };

  const parseNumber = (
    value: string | string[] | undefined,
  ): number | undefined => {
    if (!value || Array.isArray(value)) return undefined;
    const num = parseInt(value);
    return isNaN(num) ? undefined : num;
  };

  const parseBoolean = (
    value: string | string[] | undefined,
  ): boolean | undefined => {
    if (!value || Array.isArray(value)) return undefined;
    return value === "true";
  };

  const getString = (
    value: string | string[] | undefined,
  ): string | undefined => {
    if (!value) return undefined;
    return Array.isArray(value) ? value[0] : value;
  };

  const parsedParams: Partial<FlightSearch> = {
    originLocationCode: getString(searchParams.originLocationCode),
    destinationLocationCode: getString(searchParams.destinationLocationCode),
    departureDate: parseDate(searchParams.departureDate),
    returnDate: parseDate(searchParams.returnDate),
    travelClass: getString(
      searchParams.travelClass,
    ) as FlightSearch["travelClass"],
    adults: parseNumber(searchParams.adults),
    children: parseNumber(searchParams.children),
    infants: parseNumber(searchParams.infants),
    currencyCode: getString(searchParams.currencyCode),
    max: parseNumber(searchParams.max),
    nonStop: parseBoolean(searchParams.nonStop),
    twoWay: parseBoolean(searchParams.twoWay),
    excludedAirlineCodes: getString(searchParams.excludedAirlineCodes),
    includedAirlineCodes: getString(searchParams.includedAirlineCodes),
    maxPrice: parseNumber(searchParams.maxPrice),
    minPrice: parseNumber(searchParams.minPrice),
  };

  // Remove undefined values
  const cleanParams = Object.fromEntries(
    Object.entries(parsedParams).filter(([_, value]) => value !== undefined),
  ) as Partial<FlightSearch>;

  const result = flightSearchSchema.safeParse(cleanParams);

  if (result.success) {
    return {
      parsedParams: {
        originLocationCode: result.data.originLocationCode.toUpperCase(),
        destinationLocationCode:
          result.data.destinationLocationCode.toUpperCase(),
        adults: result.data.adults,
        children: result.data.children,
        infants: result.data.infants,
        departureDate: result.data.departureDate,
        returnDate: result.data.returnDate,
        currencyCode: result.data.currencyCode,
        nonStop: result.data.nonStop,
        travelClass:
          result.data.travelClass === "ANY"
            ? undefined
            : (result.data.travelClass as "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST" | undefined),
      },
      error: null,
    };
  }

  return {
    parsedParams: null,
    error: result.error,
  };
}
