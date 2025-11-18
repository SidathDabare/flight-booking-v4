"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { HotelSearch as HotelSearchType, hotelSearchSchema } from "@/lib/zod/hotel-search";
import { Minus, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoadingScreen from "@/components/ui/loading-screen";
import { getCurrencyCode } from "@/lib/utils/currency";
import AutocompleteHotelDestination from "./AutocompleteHotelDestination";
import DateRangePickerHotel from "./DateRangePickerHotel";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { z } from "zod";

// localStorage utility functions
const STORAGE_KEY = "hotel-search-history";
const DESTINATION_DATA_KEY = "hotel-search-destination";

interface SavedDestinationData {
  destination?: {
    label: string;
    cityCode: string;
    value: {
      name: string;
      iataCode?: string;
      address?: {
        cityCode?: string;
        cityName?: string;
        countryCode?: string;
      };
      geoCode?: {
        latitude?: number;
        longitude?: number;
      };
    };
  };
}

const saveSearchToLocalStorage = (data: Partial<HotelSearchType>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save hotel search data:", error);
  }
};

const saveDestinationDataToLocalStorage = (destinationData: SavedDestinationData) => {
  try {
    localStorage.setItem(DESTINATION_DATA_KEY, JSON.stringify(destinationData));
  } catch (error) {
    console.error("Failed to save destination data:", error);
  }
};

const loadDestinationDataFromLocalStorage = (): SavedDestinationData | null => {
  try {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(DESTINATION_DATA_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Failed to load destination data:", error);
    return null;
  }
};

const loadSearchFromLocalStorage = (): Partial<HotelSearchType> | null => {
  try {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Failed to load hotel search data:", error);
    return null;
  }
};

export default function HotelSearch({
  onCarouselLoadingChange,
}: {
  onCarouselLoadingChange?: (loading: boolean) => void;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("hotelSearch");
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [selectedCheckInDate, setSelectedCheckInDate] = useState<Date | null>(null);
  const [selectedCheckOutDate, setSelectedCheckOutDate] = useState<Date | null>(null);
  const [userClickedSearch, setUserClickedSearch] = useState(false);
  const [savedDestinationData, setSavedDestinationData] = useState<SavedDestinationData | null>(null);
  const [currentDestinationSelection, setCurrentDestinationSelection] = useState<SavedDestinationData>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getDefaultValues = (): Partial<HotelSearchType> => {
    if (typeof window === "undefined") {
      return {
        cityCode: "",
        checkInDate: "",
        checkOutDate: "",
        adults: 2,
        children: 0,
        rooms: 1,
        currency: getCurrencyCode(),
        max: 20,
      };
    }

    const saved = loadSearchFromLocalStorage();
    return {
      cityCode: saved?.cityCode || "",
      checkInDate: saved?.checkInDate || "",
      checkOutDate: saved?.checkOutDate || "",
      adults: saved?.adults || 2,
      children: saved?.children || 0,
      rooms: saved?.rooms || 1,
      currency: getCurrencyCode(saved?.currency),
      max: saved?.max || 20,
    };
  };

  // Create a partial schema for the form
  const partialHotelSearchSchema = z.object({
    cityCode: z.string().optional(),
    checkInDate: z.string().optional(),
    checkOutDate: z.string().optional(),
    adults: z.number().optional(),
    children: z.number().optional(),
    rooms: z.number().optional(),
    currency: z.string().optional(),
    max: z.number().optional(),
  });

  const form = useForm<Partial<HotelSearchType>>({
    resolver: zodResolver(partialHotelSearchSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      const saved = loadSearchFromLocalStorage();
      const destinationData = loadDestinationDataFromLocalStorage();

      setSavedDestinationData(destinationData);

      if (saved) {
        form.reset({
          cityCode: saved.cityCode || "",
          checkInDate: saved.checkInDate || "",
          checkOutDate: saved.checkOutDate || "",
          adults: saved.adults || 2,
          children: saved.children || 0,
          rooms: saved.rooms || 1,
          currency: getCurrencyCode(saved.currency),
          max: saved.max || 20,
        });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [form, isLoading]);

  const cityCode = form.watch("cityCode");
  const checkInDate = form.watch("checkInDate");
  const checkOutDate = form.watch("checkOutDate");

  useEffect(() => {
    const hasRequiredFields = cityCode !== "" && checkInDate !== "" && checkOutDate !== "";
    setIsDisabled(!hasRequiredFields);
  }, [cityCode, checkInDate, checkOutDate]);

  useEffect(() => {
    const saved = loadSearchFromLocalStorage();
    if (saved && !isLoading) {
      if (saved.checkInDate) {
        try {
          const checkIn = new Date(saved.checkInDate);
          if (!isNaN(checkIn.getTime())) {
            setSelectedCheckInDate(checkIn);
          }
        } catch (error) {
          console.error("Failed to parse saved check-in date:", error);
        }
      }

      if (saved.checkOutDate) {
        try {
          const checkOut = new Date(saved.checkOutDate);
          if (!isNaN(checkOut.getTime())) {
            setSelectedCheckOutDate(checkOut);
          }
        } catch (error) {
          console.error("Failed to parse saved check-out date:", error);
        }
      }
    }
  }, [isLoading]);

  const onSubmit = async (data: Partial<HotelSearchType>) => {
    if (isDisabled || !userClickedSearch) return;

    try {
      setIsNavigating(true);

      saveSearchToLocalStorage(data);

      if (currentDestinationSelection.destination) {
        saveDestinationDataToLocalStorage(currentDestinationSelection);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const stringifiedParams = Object.entries(data).reduce<Record<string, string>>((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          acc[key] = String(value);
        }
        return acc;
      }, {});

      const searchParams = new URLSearchParams(stringifiedParams).toString();
      await router.push(`/hotels?${searchParams}`);
    } catch (error) {
      setIsNavigating(false);
      toast({
        title: "Error",
        description: "An error occurred while searching for hotels. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUserClickedSearch(false);
    }
  };

  return (
    <>
      {isNavigating && <LoadingScreen />}
      <div className="w-full mx-auto">
        {isLoading ? (
          <div className="w-full flight-search-bg p-3 sm:p-4 md:p-4 lg:p-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-1 md:gap-3 mb-1 sm:mb-1 md:mb-0 py-2 items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-full">
                    <div
                      className="h-[57px] bg-gradient-to-r from-blue-200/20 via-blue-300/30 to-blue-200/20 bg-[length:200%_100%] animate-pulse border border-blue-300/40"
                      style={{ animation: "shimmer 2s infinite", animationDelay: `${i * 0.1}s` }}
                    />
                  </div>
                ))}
                <div className="flex justify-end items-center">
                  <div
                    className="w-full h-[48px] sm:h-[57px] bg-gradient-to-r from-red-400/40 via-red-500/50 to-red-400/40 bg-[length:200%_100%] animate-pulse"
                    style={{ animation: "shimmer 2s infinite", animationDelay: "0.6s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flight-search-bg p-3 sm:p-4 md:p-4 lg:p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-1 md:gap-3 mb-1 sm:mb-1 md:mb-0 py-2 items-center">
                <FormField
                  control={form.control}
                  name="cityCode"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <AutocompleteHotelDestination
                          getDestinationValue={(value) => {
                            field.onChange(value);
                            if (savedDestinationData?.destination && value !== savedDestinationData.destination.cityCode) {
                              setSavedDestinationData((prev) => (prev ? { ...prev, destination: undefined } : null));
                            }
                          }}
                          initialValue={savedDestinationData?.destination}
                          onDestinationSelect={(destination) => {
                            setCurrentDestinationSelection({ destination });
                            saveDestinationDataToLocalStorage({ destination });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkInDate"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <DateRangePickerHotel
                        checkInDate={selectedCheckInDate}
                        checkOutDate={selectedCheckOutDate}
                        getDateValue={({ checkIn, checkOut }) => {
                          setSelectedCheckInDate(checkIn);
                          setSelectedCheckOutDate(checkOut);
                          setUserClickedSearch(false);

                          if (checkIn) {
                            form.setValue("checkInDate", checkIn.toISOString().split("T")[0]);
                          }
                          if (checkOut) {
                            form.setValue("checkOutDate", checkOut.toISOString().split("T")[0]);
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
                      {(form.watch("adults") || 0) + (form.watch("children") || 0)} {t("guests")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] sm:w-[320px] p-3 sm:p-4 rounded-none">
                    <div className="grid gap-3 sm:gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium leading-none">{t("guests")}</h4>
                          <p className="text-sm text-muted-foreground">{t("selectGuests")}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            const trigger = document.querySelector('[data-state="open"]');
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
                                <FormLabel className="text-sm font-medium">{t("adults")}</FormLabel>
                                <p className="text-xs text-muted-foreground">{t("adultsAge")}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    const value = form.getValues("adults")!;
                                    if (value > 1) {
                                      form.setValue("adults", value - 1);
                                    }
                                  }}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">{field.value}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    form.setValue("adults", form.getValues("adults")! + 1);
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
                                <FormLabel className="text-sm font-medium">{t("children")}</FormLabel>
                                <p className="text-xs text-muted-foreground">{t("childrenAge")}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    const value = form.getValues("children")!;
                                    if (value > 0) {
                                      form.setValue("children", value - 1);
                                    }
                                  }}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">{field.value}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    form.setValue("children", form.getValues("children")! + 1);
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

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-50 h-[57px] border hover:border-blue-600 focus:border-blue-500 rounded-none bg-transparent hover:bg-transparent hover:text-gray-800"
                    >
                      {form.watch("rooms")} {form.watch("rooms") === 1 ? t("room") : t("rooms")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] sm:w-[320px] p-3 sm:p-4 rounded-none">
                    <div className="grid gap-3 sm:gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium leading-none">{t("rooms")}</h4>
                          <p className="text-sm text-muted-foreground">{t("selectRooms")}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            const trigger = document.querySelector('[data-state="open"]');
                            if (trigger instanceof HTMLElement) {
                              trigger.click();
                            }
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name="rooms"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-sm font-medium">{t("rooms")}</FormLabel>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  const value = form.getValues("rooms")!;
                                  if (value > 1) {
                                    form.setValue("rooms", value - 1);
                                  }
                                }}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{field.value}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  if (form.getValues("rooms")! < 9) {
                                    form.setValue("rooms", form.getValues("rooms")! + 1);
                                  }
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex justify-end items-center">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isDisabled}
                    onClick={() => setUserClickedSearch(true)}
                    className={cn(
                      "w-full min-w-0 sm:min-w-[200px] h-[48px] sm:h-[57px] text-base rounded-none",
                      isDisabled ? "bg-gray-400 cursor-not-allowed" : "shining-button"
                    )}
                  >
                    {t("searchButton")}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </div>
    </>
  );
}
