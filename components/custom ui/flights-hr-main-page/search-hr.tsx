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
import { Minus, Plus, X } from "lucide-react";
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

import { useState, useEffect, useCallback } from "react";

import LoadingScreen from "@/components/ui/loading-screen";
import AirportCombobox, { AutocompleteOption, Airport } from "./autocomplete-hr";
import FlightDatePicker from "./date-picker-hr";
import { getCurrencyCode } from "@/lib/utils/currency";
import { formatString, cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// localStorage utility functions
const STORAGE_KEY = "flight-search-history";
const AIRPORT_DATA_KEY = "flight-search-airports";

// Enhanced localStorage checking functions
const hasStoredLocationCodes = (): {
  origin: boolean;
  destination: boolean;
} => {
  try {
    const saved = loadSearchFromLocalStorage();
    if (!saved) return { origin: false, destination: false };
    return {
      origin: Boolean(saved.originLocationCode),
      destination: Boolean(saved.destinationLocationCode),
    };
  } catch (error) {
    // console.error("Failed to check localStorage location codes:", error);
    return { origin: false, destination: false };
  }
};

interface SavedAirportData {
  originAirport?: AutocompleteOption;
  destinationAirport?: AutocompleteOption;
}

const saveSearchToLocalStorage = (data: FlightSearchType) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save search data:", error);
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

// Helper function to create airport object from IATA code when full data is missing
const createFallbackAirportFromCode = async (
  iataCode: string
): Promise<any | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/city-search?keyword=${iataCode}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const airport = data?.find((a: Airport & { iataCode: string; address: { cityName: string } }) => a.iataCode === iataCode);

    if (airport) {
      return {
        label: `${formatString(airport.name)}, ${formatString(airport.address.cityName)}, (${airport.iataCode})`,
        iataCode: airport.iataCode,
        value: airport,
      };
    }

    return null;
  } catch (error) {
    // console.error(
    //   "Failed to fetch airport data for IATA code:",
    //   iataCode,
    //   error
    // );
    return null;
  }
};

const loadSearchFromLocalStorage = (): Partial<FlightSearchType> | null => {
  try {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    // console.error("Failed to load search data:", error);
    return null;
  }
};

interface ModernFlightSearchProps {
  onClose?: () => void;
  initialExpanded?: boolean;
}

export default function SearchHr({
  onClose,
  initialExpanded,
}: ModernFlightSearchProps) {
  const t = useTranslations("searchFlight");
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [selectedDepartureDate, setSelectedDepartureDate] =
    useState<Date | null>(null);
  const [selectedReturnDate, setSelectedReturnDate] = useState<Date | null>(
    null
  );
  const [userClickedSearch, setUserClickedSearch] = useState(false);
  // Initialize savedAirportData immediately from localStorage
  const [savedAirportData, setSavedAirportData] =
    useState<SavedAirportData | null>(() => {
      // Try to load airport data immediately on component creation
      try {
        return loadAirportDataFromLocalStorage();
      } catch {
        return null;
      }
    });
  const [currentAirportSelections, setCurrentAirportSelections] =
    useState<SavedAirportData>({});
  const [shouldFetchData, setShouldFetchData] = useState<{
    origin: boolean;
    destination: boolean;
  }>({ origin: false, destination: false });

  useEffect(() => {
    // Check localStorage immediately and determine what data needs to be fetched
    const saved = loadSearchFromLocalStorage();
    const storedCodes = hasStoredLocationCodes();

    const shouldFetch = {
      origin: !storedCodes.origin,
      destination: !storedCodes.destination,
    };

    setShouldFetchData(shouldFetch);

    // Reduce loading time if we have stored data
    const hasStoredData = storedCodes.origin && storedCodes.destination;
    const loadingTime = hasStoredData ? 300 : 1500;

    // console.log("Initial localStorage check:", {
    //   storedCodes,
    //   shouldFetch,
    //   hasStoredData,
    //   loadingTime,
    //   savedData: saved
    //     ? {
    //         origin: saved.originLocationCode,
    //         dest: saved.destinationLocationCode,
    //       }
    //     : null,
    // });

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, loadingTime);

    return () => clearTimeout(timer);
  }, []);

  // Initialize form with empty values first, then populate from localStorage
  const form = useForm<FlightSearchType>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
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
      currencyCode: "USD",
      max: 200,
    },
  });

  // Watch required fields
  const originLocationCode = form.watch("originLocationCode");
  const destinationLocationCode = form.watch("destinationLocationCode");
  const departureDate = form.watch("departureDate");

  // Load and set data immediately on mount
  useEffect(() => {
    const loadAndRestoreData = async () => {
      const saved = loadSearchFromLocalStorage();
      const airportData = loadAirportDataFromLocalStorage();

      // console.log("🔍 Debug localStorage data:", {
      //   saved: saved,
      //   airportData: airportData,
      //   hasOriginCode: Boolean(saved?.originLocationCode),
      //   hasAirportData: Boolean(airportData?.originAirport),
      // });

      // eslint-disable-next-line prefer-const
      let updatedAirportData = { ...(airportData || {}) };

      // Handle case where we have IATA code but missing airport object data
      if (saved?.originLocationCode && !airportData?.originAirport) {
        // console.log(
        //   "🔄 Fetching missing origin airport data for:",
        //   saved.originLocationCode
        // );
        const originAirport = await createFallbackAirportFromCode(
          saved.originLocationCode
        );
        if (originAirport) {
          updatedAirportData.originAirport = originAirport;
          // console.log("✅ Created origin airport object:", originAirport);
        }
      }

      if (saved?.destinationLocationCode && !airportData?.destinationAirport) {
        // console.log(
        //   "🔄 Fetching missing destination airport data for:",
        //   saved.destinationLocationCode
        // );
        const destinationAirport = await createFallbackAirportFromCode(
          saved.destinationLocationCode
        );
        if (destinationAirport) {
          updatedAirportData.destinationAirport = destinationAirport;
          // console.log(
          //   "✅ Created destination airport object:",
          //   destinationAirport
          // );
        }
      }

      // Set airport data immediately - this ensures AirportCombobox gets initialValue
      if (Object.keys(updatedAirportData).length > 0) {
        setSavedAirportData(updatedAirportData);
        // Save the reconstructed data for future use
        saveAirportDataToLocalStorage(updatedAirportData);
      }

      // If we have saved form data, populate the form immediately
      if (saved) {
        // console.log("✅ Restoring from localStorage:", {
        //   origin: saved.originLocationCode,
        //   destination: saved.destinationLocationCode,
        // });

        // Set location codes first
        if (saved.originLocationCode) {
          // console.log(
          //   "🎯 Setting origin location code:",
          //   saved.originLocationCode
          // );
          form.setValue("originLocationCode", saved.originLocationCode, {
            shouldValidate: false,
            shouldDirty: false,
          });
        }

        if (saved.destinationLocationCode) {
          form.setValue(
            "destinationLocationCode",
            saved.destinationLocationCode,
            {
              shouldValidate: false,
              shouldDirty: false,
            }
          );
        }

        // Set other form data
        const otherFormData = {
          departureDate: saved.departureDate || "",
          returnDate: saved.returnDate || undefined,
          adults: saved.adults || 1,
          children: saved.children || 0,
          infants: saved.infants || 0,
          nonStop: saved.nonStop || false,
          twoWay: saved.twoWay || false,
          currencyCode: getCurrencyCode(saved.currencyCode),
          max: saved.max || 200,
        };

        Object.entries(otherFormData).forEach(([key, value]) => {
          if (value !== undefined) {
            form.setValue(key as keyof FlightSearchType, value, {
              shouldValidate: false,
              shouldDirty: false,
            });
          }
        });

        // Handle travelClass separately to ensure it gets set even if undefined
        // console.log("🎯 Setting travelClass:", saved.travelClass);
        form.setValue("travelClass", saved.travelClass, {
          shouldValidate: false,
          shouldDirty: false,
        });

        // Restore selected dates
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
    };

    loadAndRestoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount - form is stable

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

  // Memoized handlers for origin airport
  const handleOriginAirportValue = useCallback(
    (value: string) => {
      // Clear saved airport data when user makes new selection
      if (
        savedAirportData?.originAirport &&
        value !== savedAirportData.originAirport.iataCode
      ) {
        setSavedAirportData((prev) =>
          prev ? { ...prev, originAirport: undefined } : null
        );
      }
    },
    [savedAirportData?.originAirport]
  );

  const handleOriginAirportSelect = useCallback(
    (airport: AutocompleteOption) => {
      setCurrentAirportSelections((prev) => ({
        ...prev,
        originAirport: airport,
      }));
      // Immediately save to localStorage when user selects airport
      saveAirportDataToLocalStorage({
        ...currentAirportSelections,
        originAirport: airport,
      });
    },
    [currentAirportSelections]
  );

  // Memoized handlers for destination airport
  const handleDestinationAirportValue = useCallback(
    (value: string) => {
      // Clear saved airport data when user makes new selection
      if (
        savedAirportData?.destinationAirport &&
        value !== savedAirportData.destinationAirport.iataCode
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
    },
    [savedAirportData?.destinationAirport]
  );

  const handleDestinationAirportSelect = useCallback(
    (airport: AutocompleteOption) => {
      setCurrentAirportSelections((prev) => ({
        ...prev,
        destinationAirport: airport,
      }));
      // Immediately save to localStorage when user selects airport
      saveAirportDataToLocalStorage({
        ...currentAirportSelections,
        destinationAirport: airport,
      });
    },
    [currentAirportSelections]
  );

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
    <div className="w-full relative h-auto border overflow-hidden">
      {onClose && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 sm:right-3 h-8 w-8 z-10 bg-black/50 rounded-full hover:bg-black/30 transition-colors"
        >
          <X className="h-4 w-4 text-white" />
        </Button>
      )}

      {isNavigating && <LoadingScreen />}
      <section className="relative bg-transparent">
        {/* <div className="absolute inset-0 bg-black/60" /> */}

        {isLoading ? (
          <div className="w-full mx-auto">
            <div className="bg-gray-100/50 shadow-lg px-1 py-1 flex items-center gap-0 relative overflow-hidden">
              <div className="mt-4 grid grid-cols-1 w-full px-1 md:px-6">
                {/* Loading options header */}
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-start gap-4 xs:gap-6 w-full m-1 mb-4">
                  <div
                    className="h-6 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"
                    style={{
                      animation: "shimmer 1.5s infinite",
                      backgroundImage:
                        "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
                    }}
                  />
                  <div
                    className="h-10 w-40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"
                    style={{
                      animation: "shimmer 1.5s infinite",
                      animationDelay: "0.3s",
                      backgroundImage:
                        "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
                    }}
                  />
                </div>

                {/* Loading form fields */}
                <div className="flex flex-col lg:flex-row items-stretch divide-y lg:divide-y-0 lg:divide-x divide-gray-200 w-full">
                  {/* Main form fields container */}
                  <div className="w-full lg:w-4/6 flex flex-col sm:flex-row items-stretch">
                    {/* Departure Location Loading */}
                    <div className="px-2 py-2 flex-1">
                      <div
                        className="h-[57px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse border border-gray-300"
                        style={{
                          animation: "shimmer 1.5s infinite",
                          animationDelay: "0.1s",
                          backgroundImage:
                            "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
                        }}
                      />
                    </div>
                    {/* Arrival Location Loading */}
                    <div className="px-2 py-2 flex-1">
                      <div
                        className="h-[57px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse border border-gray-300"
                        style={{
                          animation: "shimmer 1.5s infinite",
                          animationDelay: "0.2s",
                          backgroundImage:
                            "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
                        }}
                      />
                    </div>
                    {/* Date Picker Loading */}
                    <div className="px-2 py-2 flex-1">
                      <div
                        className="h-[57px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse border border-gray-300"
                        style={{
                          animation: "shimmer 1.5s infinite",
                          animationDelay: "0.3s",
                          backgroundImage:
                            "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Right side container */}
                  <div className="w-full lg:w-2/6 flex flex-col sm:flex-row items-stretch">
                    {/* Passengers Loading */}
                    <div className="px-2 py-2 flex-1">
                      <div
                        className="h-[57px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse border border-gray-300"
                        style={{
                          animation: "shimmer 1.5s infinite",
                          animationDelay: "0.4s",
                          backgroundImage:
                            "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
                        }}
                      />
                    </div>
                    {/* Search Button Loading */}
                    <div className="px-2 py-2 flex-1">
                      <div
                        className="h-[57px] bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 animate-pulse rounded-full"
                        style={{
                          animation: "shimmer 1.5s infinite",
                          animationDelay: "0.5s",
                          backgroundImage:
                            "linear-gradient(90deg, #60a5fa 25%, #3b82f6 50%, #60a5fa 75%)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <div className="w-full mx-auto">
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="shadow-lg px-2 sm:px-4 py-4 flex items-center gap-0 relative overflow-visible w-full bg-gray-100/50"
              >
                <div className="grid grid-cols-1 w-full">
                  {/* Additional Options */}
                  <div className="flex flex-col xs:flex-row items-start xs:items-center justify-start gap-4 xs:gap-6 w-full m-1 mb-4 px-0 md:px-2">
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
                            {t("returnFlight")}
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="travelClass"
                      render={({ field }) => (
                        <FormItem className="w-full xs:w-auto min-w-[150px] max-w-[200px]">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 border-gray-300 rounded-none w-full">
                                <SelectValue placeholder={t("travelClass")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={"ANY"}>{t("any")}</SelectItem>
                              <SelectItem value="ECONOMY">{t("economy")}</SelectItem>
                              <SelectItem value="PREMIUM_ECONOMY">
                                {t("premiumEconomy")}
                              </SelectItem>
                              <SelectItem value="BUSINESS">{t("business")}</SelectItem>
                              <SelectItem value="FIRST">{t("first")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col lg:flex-row items-stretch divide-y lg:divide-y-0 lg:divide-x divide-gray-200 w-full">
                    {/* Main form fields container */}
                    <div className="w-full lg:w-4/6 flex flex-col sm:flex-row items-stretch">
                      {/* Departure Location */}
                      <div className="px-2 py-2 flex-1">
                        <FormField
                          control={form.control}
                          name="originLocationCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative w-full">
                                  <AirportCombobox
                                    type="Departure"
                                    getAirportValue={(value: string) => {
                                      // Don't override localStorage data with empty values during loading
                                      const currentValue =
                                        form.getValues("originLocationCode");
                                      if (
                                        value === "" &&
                                        currentValue &&
                                        isLoading
                                      ) {
                                        // Component initializing, don't override saved data
                                        return;
                                      }
                                      field.onChange(value);
                                      handleOriginAirportValue(value);
                                    }}
                                    initialValue={
                                      savedAirportData?.originAirport
                                    }
                                    onAirportSelect={handleOriginAirportSelect}
                                    shouldFetch={shouldFetchData.origin}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* Arrival Location */}
                      <div className="px-2 py-2 flex-1">
                        <FormField
                          control={form.control}
                          name="destinationLocationCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative w-full">
                                  <AirportCombobox
                                    type="Arrival"
                                    getAirportValue={(value: string) => {
                                      // Don't override localStorage data with empty values during loading
                                      const currentValue = form.getValues(
                                        "destinationLocationCode"
                                      );
                                      if (
                                        value === "" &&
                                        currentValue &&
                                        isLoading
                                      ) {
                                        // Component initializing, don't override saved data
                                        return;
                                      }
                                      field.onChange(value);
                                      handleDestinationAirportValue(value);
                                    }}
                                    initialValue={
                                      savedAirportData?.destinationAirport
                                    }
                                    onAirportSelect={
                                      handleDestinationAirportSelect
                                    }
                                    shouldFetch={shouldFetchData.destination}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* Date Picker */}
                      <div className="px-2 py-2 flex-1">
                        <FormField
                          control={form.control}
                          name="departureDate"
                          render={({ field }) => (
                            <FormItem>
                              <FlightDatePicker
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
                                    const safeDepartureDate =
                                      formatSafeDate(from);
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
                                      form.setValue(
                                        "returnDate",
                                        safeReturnDate,
                                        {
                                          shouldValidate: false,
                                          shouldDirty: false,
                                        }
                                      );
                                    } else {
                                      // For one-way trips, explicitly clear returnDate
                                      form.setValue("returnDate", undefined, {
                                        shouldValidate: false,
                                        shouldDirty: false,
                                      });
                                    }
                                  } catch (error) {
                                    // console.error(
                                    //   "Date formatting error:",
                                    //   error
                                    // );
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
                      </div>
                    </div>

                    {/* Right side container */}
                    <div className="w-full lg:w-2/6 flex flex-col sm:flex-row items-stretch">
                      {/* Passengers */}
                      <div className="px-2 py-2 flex-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full h-[57px] border-gray-500/50 px-3 text-sm font-medium border rounded-none hover:bg-gray-50 hover:text-gray-800 text-left justify-start"
                            >
                              <span className="flex items-center gap-2">
                                <span>👤</span>
                                <span className="truncate">
                                  {form.watch("adults") +
                                    form.watch("children") +
                                    form.watch("infants")}{" "}
                                  <span className="hidden xs:inline">
                                    {t("passengers")}
                                  </span>
                                  <span className="xs:hidden">{t("pax")}</span>
                                </span>
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[280px] sm:w-[320px] p-3 sm:p-4 rounded-lg mx-2">
                            <div className="grid gap-3 sm:gap-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <h4 className="font-medium leading-none">
                                    {t("passengers")}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {t("selectPassengers")}
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
                                          {t("adults")}
                                        </FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                          {t("adultsAge")}
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
                                              form.getValues("adults");
                                            if (value > 1) {
                                              form.setValue(
                                                "adults",
                                                value - 1
                                              );
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
                                          {t("children")}
                                        </FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                          {t("childrenAge")}
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
                                              form.setValue(
                                                "children",
                                                value - 1
                                              );
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
                                          {t("infants")}
                                        </FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                          {t("infantsAge")}
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
                                              form.getValues("infants");
                                            if (value > 0) {
                                              form.setValue(
                                                "infants",
                                                value - 1
                                              );
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
                      </div>
                      {/* Search Button */}
                      <div className="px-2 py-2 flex-1">
                        <Button
                          type="submit"
                          disabled={isDisabled}
                          onClick={() => setUserClickedSearch(true)}
                          className={cn(
                            "h-[57px] w-full text-white font-medium rounded-full transition-all duration-200",
                            isDisabled
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                          )}
                        >
                          <span className="text-sm font-semibold">
                            {t("searchFlights")}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </Form>
        )}
      </section>
    </div>
  );
}
