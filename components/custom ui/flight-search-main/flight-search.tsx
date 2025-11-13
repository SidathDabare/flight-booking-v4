"use client";

import { Button } from "@/components/ui/button";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  FlightSearch as FlightSearchType,
  flightSearchSchema,
} from "@/lib/zod/search";
import { Minus, Plus } from "lucide-react";
import { format, isValid } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoadingScreen from "@/components/ui/loading-screen";
import { ClientCarousel } from "../ClientCarousel";
import { getCurrencyCode } from "@/lib/utils/currency";
import AutocompleteAirport from "./AutocompleteAirport";
import DateRangePickerAirport from "./DateRangePickerAirport";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";

// localStorage utility functions
const STORAGE_KEY = "flight-search-history";
const AIRPORT_DATA_KEY = "flight-search-airports";

interface SavedAirportData {
  originAirport?: {
    label: string;
    iataCode: string;
    value: {
      name: string;
      city: string;
      country: string;
      IATA?: string;
      ICAO: string;
      lat: string;
      lon: string;
      timezone: string;
    };
  };
  destinationAirport?: {
    label: string;
    iataCode: string;
    value: {
      name: string;
      city: string;
      country: string;
      IATA?: string;
      ICAO: string;
      lat: string;
      lon: string;
      timezone: string;
    };
  };
}

const saveSearchToLocalStorage = (data: FlightSearchType) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // console.error("Failed to save search data:", error);
  }
};

const saveAirportDataToLocalStorage = (airportData: SavedAirportData) => {
  try {
    localStorage.setItem(AIRPORT_DATA_KEY, JSON.stringify(airportData));
  } catch (error) {
    // console.error("Failed to save airport data:", error);
  }
};

const loadAirportDataFromLocalStorage = (): SavedAirportData | null => {
  try {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(AIRPORT_DATA_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    // console.error("Failed to load airport data:", error);
    return null;
  }
};

const loadSearchFromLocalStorage = (): Partial<FlightSearchType> | null => {
  try {
    // Check if we're in the browser environment
    if (typeof window === "undefined") return null;

    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    // console.error("Failed to load search data:", error);
    return null;
  }
};

export default function FlightSearch({
  onCarouselLoadingChange,
}: {
  onCarouselLoadingChange?: (loading: boolean) => void;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations('flightSearch');
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [selectedDepartureDate, setSelectedDepartureDate] =
    useState<Date | null>(null);
  const [selectedReturnDate, setSelectedReturnDate] = useState<Date | null>(
    null
  );
  const [userClickedSearch, setUserClickedSearch] = useState(false);
  const [savedAirportData, setSavedAirportData] =
    useState<SavedAirportData | null>(null);
  const [currentAirportSelections, setCurrentAirportSelections] =
    useState<SavedAirportData>({});

  useEffect(() => {
    // Simulate loading time for initial data fetch
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Get default values - use safe defaults during SSR
  const getDefaultValues = (): FlightSearchType => {
    // Don't access localStorage during initial render to prevent hydration mismatch
    if (typeof window === "undefined") {
      return {
        originLocationCode: "",
        destinationLocationCode: "",
        departureDate: "",
        returnDate: undefined,
        adults: 1,
        children: 0,
        infants: 0,
        nonStop: false,
        twoWay: false,
        travelClass: undefined,
        currencyCode: getCurrencyCode(),
        max: 200,
      };
    }

    const saved = loadSearchFromLocalStorage();
    return {
      originLocationCode: saved?.originLocationCode || "",
      destinationLocationCode: saved?.destinationLocationCode || "",
      departureDate: saved?.departureDate || "",
      returnDate: saved?.returnDate || undefined,
      adults: saved?.adults || 1,
      children: saved?.children || 0,
      infants: saved?.infants || 0,
      nonStop: saved?.nonStop || false,
      twoWay: saved?.twoWay || false,
      travelClass: saved?.travelClass || undefined,
      currencyCode: getCurrencyCode(saved?.currencyCode),
      max: saved?.max || 200,
    };
  };

  const form = useForm<FlightSearchType>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: getDefaultValues(),
  });

  // Load saved values from localStorage after component mounts
  useEffect(() => {
    if (isLoading) return; // Wait for loading to complete

    // Use timeout to ensure this runs after hydration
    const timer = setTimeout(() => {
      const saved = loadSearchFromLocalStorage();
      const airportData = loadAirportDataFromLocalStorage();

      // Always set airport data first (even if null) to ensure the autocomplete components have the prop
      setSavedAirportData(airportData);

      if (saved) {
        // Reset form with saved values
        form.reset({
          originLocationCode: saved.originLocationCode || "",
          destinationLocationCode: saved.destinationLocationCode || "",
          departureDate: saved.departureDate || "",
          returnDate: saved.returnDate || undefined,
          adults: saved.adults || 1,
          children: saved.children || 0,
          infants: saved.infants || 0,
          nonStop: saved.nonStop || false,
          twoWay: saved.twoWay || false,
          travelClass: saved.travelClass || undefined,
          currencyCode: getCurrencyCode(saved.currencyCode),
          max: saved.max || 200,
        });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [form, isLoading]);

  // Watch required fields
  const originLocationCode = form.watch("originLocationCode");
  const destinationLocationCode = form.watch("destinationLocationCode");
  const departureDate = form.watch("departureDate");

  // Update disabled state based on required fields
  useEffect(() => {
    const hasRequiredFields =
      originLocationCode !== "" &&
      destinationLocationCode !== "" &&
      departureDate !== "";
    setIsDisabled(!hasRequiredFields);
  }, [originLocationCode, destinationLocationCode, departureDate]);

  // Restore selected dates from localStorage after form initialization
  useEffect(() => {
    const saved = loadSearchFromLocalStorage();
    if (saved && !isLoading) {
      // Restore departure date
      if (saved.departureDate) {
        try {
          const departureDate = new Date(saved.departureDate);
          if (!isNaN(departureDate.getTime())) {
            setSelectedDepartureDate(departureDate);
          }
        } catch (error) {
          // console.error("Failed to parse saved departure date:", error);
        }
      }

      // Restore return date if twoWay is true
      if (saved.returnDate && saved.twoWay) {
        try {
          const returnDate = new Date(saved.returnDate);
          if (!isNaN(returnDate.getTime())) {
            setSelectedReturnDate(returnDate);
          }
        } catch (error) {
          // console.error("Failed to parse saved return date:", error);
        }
      }
    }
  }, [isLoading]);

  const onSubmit = async (data: FlightSearchType) => {
    if (isDisabled || !userClickedSearch) return;

    try {
      setIsNavigating(true);

      // Save search data to localStorage
      saveSearchToLocalStorage(data);

      // Save current airport selections to localStorage
      if (
        currentAirportSelections.originAirport ||
        currentAirportSelections.destinationAirport
      ) {
        saveAirportDataToLocalStorage(currentAirportSelections);
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const stringifiedParams = Object.entries(data).reduce<
        Record<string, string>
      >((acc, [key, value]) => {
        // Skip returnDate if it's undefined, empty, or if twoWay is false
        if (
          key === "returnDate" &&
          (value === undefined || !value || !data.twoWay)
        ) {
          return acc;
        }
        if (value !== undefined && value !== null && value !== "") {
          acc[key] = String(value);
        }
        return acc;
      }, {});

      const searchParams = new URLSearchParams(stringifiedParams).toString();
      // console.log("Form data being sent:", data);
      // console.log("Stringified params:", stringifiedParams);
      // console.log("URL params:", searchParams);
      await router.push(`/flights?${searchParams}`);
    } catch (error) {
      setIsNavigating(false);
      toast({
        title: "Error",
        description:
          "An error occurred while searching for flights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUserClickedSearch(false);
    }
  };
  // console.log("Values", form.getValues());

  return (
    <div className="w-full relative h-screen min:h-screen mt-[-50px]">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <ClientCarousel onLoadingChange={onCarouselLoadingChange} />
      </div>

      {/* Dark Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-l from-gray-900/10 to-gray-900/0 z-0 pointer-events-none" />

      {isNavigating && <LoadingScreen />}
      <section className="relative z-20 bg-transparent top-20 lg:top-1/3">
        {/* <div className="absolute inset-0 bg-black/60" /> */}

        <div className="relative flex h-full w-full max-w-full flex-col items-start justify-center gap-4 sm:gap-6 px-2 sm:px-6 mx-auto py-4 sm:py-6 lg:py-8">
          <div className="w-full mx-auto">
            {isLoading ? (
              <div className="w-full lg:w-1/2 flight-search-bg p-3 sm:p-4 md:p-4 lg:p-4">
                <div className="space-y-3 sm:space-y-4">
                  {/* Title Section */}
                  <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto w-full pb-2">
                    <div className="flex items-center gap-2 border-b-2 border-red-600 pb-2">
                      <div className="h-6 w-32 bg-blue-200/30 animate-pulse rounded-sm" />
                    </div>
                  </div>

                  {/* Checkbox Section */}
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-1 sm:gap-0 md:gap-0 mb-2 md:mb-2 py-1 items-center px-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-blue-200/40 animate-pulse rounded-sm" />
                      <div className="h-4 w-24 bg-blue-200/30 animate-pulse rounded-sm" />
                    </div>
                  </div>

                  {/* Main Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-1 md:gap-3 mb-1 sm:mb-1 md:mb-0 py-2 items-center">
                    {[1, 2].map((i) => (
                      <div key={i} className="w-full">
                        <div
                          className="h-[57px] bg-gradient-to-r from-blue-200/20 via-blue-300/30 to-blue-200/20 bg-[length:200%_100%] animate-pulse border border-blue-300/40"
                          style={{ animation: "shimmer 2s infinite" }}
                        />
                      </div>
                    ))}

                    {/* Date Picker Skeleton */}
                    <div className="w-full">
                      <div
                        className="h-[57px] bg-gradient-to-r from-blue-200/20 via-blue-300/30 to-blue-200/20 bg-[length:200%_100%] animate-pulse border border-blue-300/40"
                        style={{
                          animation: "shimmer 2s infinite",
                          animationDelay: "0.3s",
                        }}
                      />
                    </div>

                    {/* Passengers & Class Dropdowns */}
                    <div className="w-full">
                      <div
                        className="h-[57px] bg-gradient-to-r from-blue-200/20 via-blue-300/30 to-blue-200/20 bg-[length:200%_100%] animate-pulse border border-blue-300/40"
                        style={{
                          animation: "shimmer 2s infinite",
                          animationDelay: "0.4s",
                        }}
                      />
                    </div>

                    <div className="w-full">
                      <div
                        className="h-[57px] bg-gradient-to-r from-blue-200/20 via-blue-300/30 to-blue-200/20 bg-[length:200%_100%] animate-pulse border border-blue-300/40"
                        style={{
                          animation: "shimmer 2s infinite",
                          animationDelay: "0.5s",
                        }}
                      />
                    </div>

                    {/* Search Button */}
                    <div className="flex justify-end items-center">
                      <div
                        className="w-full h-[48px] sm:h-[57px] bg-gradient-to-r from-red-400/40 via-red-500/50 to-red-400/40 bg-[length:200%_100%] animate-pulse"
                        style={{
                          animation: "shimmer 2s infinite",
                          animationDelay: "0.6s",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full lg:w-1/2 flight-search-bg p-3 sm:p-4 md:p-4 lg:p-4"
                >
                  <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto w-full pb-2 hide-scrollbar ">
                    <div className="flex items-center gap-2 border-b-2 border-red-600 pb-2 whitespace-nowrap">
                      <span className="text-base sm:text-lg font-medium">
                        {t('title')}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-1 sm:gap-0 md:gap-0 mb-2 md:mb-2 py-1 items-center px-3">
                    <FormField
                      control={form.control}
                      name="twoWay"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                // Clear returnDate when switching to one-way
                                if (!checked) {
                                  form.setValue("returnDate", undefined, {
                                    shouldValidate: false,
                                  });
                                  setSelectedReturnDate(null);
                                }
                              }}
                              className="border-2 border-blue-400 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 mt-1"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-medium cursor-pointer">
                            {t('returnFlight')}
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    {/* <FormField
                      control={form.control}
                      name="nonStop"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-2 border-blue-400 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 mt-1"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-medium text-gray-700 cursor-pointer">
                            Non-stop flights only
                          </FormLabel>
                        </FormItem>
                      )}
                    /> */}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2  sm:gap-1 md:gap-3 mb-1 sm:mb-1 md:mb-0 py-2 items-center">
                    <FormField
                      control={form.control}
                      name="originLocationCode"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <AutocompleteAirport
                              type="Departure"
                              getAirportValue={(value) => {
                                field.onChange(value);
                                // Clear saved airport data when user makes new selection
                                if (
                                  savedAirportData?.originAirport &&
                                  value !==
                                    savedAirportData.originAirport.iataCode
                                ) {
                                  setSavedAirportData((prev) =>
                                    prev
                                      ? { ...prev, originAirport: undefined }
                                      : null
                                  );
                                }
                              }}
                              initialValue={savedAirportData?.originAirport}
                              onAirportSelect={(airport) => {
                                setCurrentAirportSelections((prev) => ({
                                  ...prev,
                                  originAirport: airport,
                                }));
                                // Immediately save to localStorage when user selects airport
                                const updatedSelections = {
                                  ...currentAirportSelections,
                                  originAirport: airport,
                                };
                                saveAirportDataToLocalStorage(
                                  updatedSelections
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="destinationLocationCode"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <AutocompleteAirport
                              type="Arrival"
                              getAirportValue={(value) => {
                                field.onChange(value);
                                // Clear saved airport data when user makes new selection
                                if (
                                  savedAirportData?.destinationAirport &&
                                  value !==
                                    savedAirportData.destinationAirport.iataCode
                                ) {
                                  setSavedAirportData((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          destinationAirport: undefined,
                                        }
                                      : null
                                  );
                                }
                              }}
                              initialValue={
                                savedAirportData?.destinationAirport
                              }
                              onAirportSelect={(airport) => {
                                setCurrentAirportSelections((prev) => ({
                                  ...prev,
                                  destinationAirport: airport,
                                }));
                                // Immediately save to localStorage when user selects airport
                                const updatedSelections = {
                                  ...currentAirportSelections,
                                  destinationAirport: airport,
                                };
                                saveAirportDataToLocalStorage(
                                  updatedSelections
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="departureDate"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <DateRangePickerAirport
                            departureDate={selectedDepartureDate}
                            returnDate={selectedReturnDate}
                            twoWay={form.getValues("twoWay")}
                            getDateValue={({
                              from,
                              to,
                            }: {
                              from: Date | null;
                              to: Date | null;
                            }) => {
                              setSelectedDepartureDate(from);
                              setSelectedReturnDate(to);
                              setUserClickedSearch(false);

                              try {
                                const isValidDateObj = (
                                  date: Date | null
                                ): date is Date => {
                                  if (!date) return false;
                                  if (!(date instanceof Date)) return false;
                                  const time = date.getTime();
                                  return !isNaN(time) && isFinite(time);
                                };

                                const formatSafeDate = (
                                  date: Date | null
                                ): string => {
                                  if (!isValidDateObj(date)) {
                                    return "";
                                  }
                                  try {
                                    // Additional validation: Check if getTime() returns a valid number
                                    const timeValue = date.getTime();
                                    if (
                                      isNaN(timeValue) ||
                                      !isFinite(timeValue)
                                    ) {
                                      // console.warn(
                                      //   "Invalid time value:",
                                      //   timeValue,
                                      //   "from date:",
                                      //   date
                                      // );
                                      return "";
                                    }

                                    // Ensure date is within valid range before formatting
                                    const year = date.getFullYear();
                                    if (
                                      isNaN(year) ||
                                      year < 1900 ||
                                      year > 2100
                                    ) {
                                      // console.warn(
                                      //   "Date year out of range:",
                                      //   year
                                      // );
                                      return "";
                                    }

                                    // Additional check with date-fns isValid before formatting
                                    if (!isValid(date)) {
                                      // console.warn(
                                      //   "Date-fns isValid failed for date:",
                                      //   date
                                      // );
                                      return "";
                                    }

                                    return format(date, "yyyy-MM-dd");
                                  } catch (formatError) {
                                    // console.error(
                                    //   "Date format error:",
                                    //   formatError,
                                    //   "Date:",
                                    //   date
                                    // );
                                    return "";
                                  }
                                };

                                // Validate dates before setting them
                                const safeDepartureDate = formatSafeDate(from);
                                const safeReturnDate = formatSafeDate(to);

                                // Only set valid dates - prevent empty strings from triggering Zod validation
                                if (safeDepartureDate || !from) {
                                  form.setValue(
                                    "departureDate",
                                    safeDepartureDate,
                                    {
                                      shouldValidate: false,
                                      shouldDirty: false,
                                    }
                                  );
                                }

                                if (form.getValues("twoWay")) {
                                  form.setValue("returnDate", safeReturnDate, {
                                    shouldValidate: false,
                                    shouldDirty: false,
                                  });
                                } else {
                                  // For one-way trips, explicitly clear returnDate
                                  form.setValue("returnDate", undefined, {
                                    shouldValidate: false,
                                    shouldDirty: false,
                                  });
                                }
                              } catch (error) {
                                // console.error("Date formatting error:", error);
                                // Clear the form values on error to prevent Zod validation issues
                                form.setValue("departureDate", "", {
                                  shouldValidate: false,
                                  shouldDirty: false,
                                });
                                form.setValue("returnDate", undefined, {
                                  shouldValidate: false,
                                  shouldDirty: false,
                                });
                              }
                            }}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full sm:w-50 h-[57px] border hover:border-blue-600 focus:border-blue-500 rounded-none bg-transparent hover:bg-transparent hover:text-gray-800"
                        >
                          {form.watch("adults") +
                            form.watch("children") +
                            form.watch("infants")}{" "}
                          {t('passengers')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] sm:w-[320px] p-3 sm:p-4 rounded-none">
                        <div className="grid gap-3 sm:gap-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium leading-none">
                                {t('passengers')}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {t('selectPassengers')}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                const trigger = document.querySelector(
                                  '[data-state="open"]'
                                );
                                if (trigger instanceof HTMLElement) {
                                  trigger.click();
                                }
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                          <div className="grid gap-2">
                            <FormField
                              control={form.control}
                              name="adults"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <div>
                                    <FormLabel className="text-sm font-medium">
                                      {t('adults')}
                                    </FormLabel>
                                    <p className="text-xs text-muted-foreground">
                                      {t('adultsAge')}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        const value = form.getValues("adults");
                                        if (value > 1) {
                                          form.setValue("adults", value - 1);
                                        }
                                      }}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center">
                                      {field.value}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        form.setValue(
                                          "adults",
                                          form.getValues("adults") + 1
                                        );
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="children"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <div>
                                    <FormLabel className="text-sm font-medium">
                                      {t('children')}
                                    </FormLabel>
                                    <p className="text-xs text-muted-foreground">
                                      {t('childrenAge')}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        const value =
                                          form.getValues("children");
                                        if (value > 0) {
                                          form.setValue("children", value - 1);
                                        }
                                      }}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center">
                                      {field.value}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        form.setValue(
                                          "children",
                                          form.getValues("children") + 1
                                        );
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="infants"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <div>
                                    <FormLabel className="text-sm font-medium">
                                      {t('infants')}
                                    </FormLabel>
                                    <p className="text-xs text-muted-foreground">
                                      {t('infantsAge')}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        const value = form.getValues("infants");
                                        if (value > 0) {
                                          form.setValue("infants", value - 1);
                                        }
                                      }}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center">
                                      {field.value}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        form.setValue(
                                          "infants",
                                          form.getValues("infants") + 1
                                        );
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <FormField
                      control={form.control}
                      name="travelClass"
                      render={({ field }) => (
                        <FormItem className="w-full sm:w-50">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-[57px] sm:h-[57px] rounded-none border-gray-300 hover:border-blue-600 focus:border-blue-500">
                                <SelectValue placeholder={t('travelClass')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-none">
                              <SelectItem value="ANY">ANY</SelectItem>
                              <SelectItem value="ECONOMY">Economy</SelectItem>
                              <SelectItem value="PREMIUM_ECONOMY">
                                Premium Economy
                              </SelectItem>
                              <SelectItem value="BUSINESS">Business</SelectItem>
                              <SelectItem value="FIRST">First</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end items-center">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isDisabled}
                        onClick={() => setUserClickedSearch(true)}
                        className={cn(
                          "w-full min-w-0 sm:min-w-[200px] h-[48px] sm:h-[57px] text-base rounded-none",
                          isDisabled
                            ? "bg-gray-400 cursor-not-allowed"
                            : "shining-button"
                        )}
                      >
                        {t('searchButton')}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
