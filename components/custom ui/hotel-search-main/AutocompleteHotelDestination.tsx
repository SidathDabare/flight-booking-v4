"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface DestinationData {
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
}

interface AutocompleteHotelDestinationProps {
  getDestinationValue: (cityCode: string) => void;
  initialValue?: DestinationData;
  onDestinationSelect?: (destination: DestinationData) => void;
}

export default function AutocompleteHotelDestination({
  getDestinationValue,
  initialValue,
  onDestinationSelect,
}: AutocompleteHotelDestinationProps) {
  const t = useTranslations("hotelSearch");
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<DestinationData | null>(initialValue || null);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialValue) {
      setSelectedDestination(initialValue);
      setInputValue(initialValue.label);
    }
  }, [initialValue]);

  const fetchDestinations = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setDestinations([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/hotel-autocomplete?keyword=${encodeURIComponent(searchTerm)}&subType=CITY&max=10`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch destinations");
      }

      const data = await response.json();

      if (data.success && data.data) {
        setDestinations(data.data);
      } else {
        setDestinations([]);
        setError(data.error || "No destinations found");
      }
    } catch (err) {
      console.error("Error fetching destinations:", err);
      setError("Failed to load destinations");
      setDestinations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchDestinations(value);
    }, 300);
  };

  const handleSelectDestination = (destination: any) => {
    const cityCode = destination.address?.cityCode || destination.iataCode || "";
    const cityName = destination.address?.cityName || destination.name || "";
    const countryCode = destination.address?.countryCode || "";

    const destinationData: DestinationData = {
      label: `${cityName}${countryCode ? `, ${countryCode}` : ""}`,
      cityCode: cityCode,
      value: {
        name: destination.name,
        iataCode: destination.iataCode,
        address: destination.address,
        geoCode: destination.geoCode,
      },
    };

    setSelectedDestination(destinationData);
    setInputValue(destinationData.label);
    getDestinationValue(cityCode);

    if (onDestinationSelect) {
      onDestinationSelect(destinationData);
    }

    setOpen(false);
  };

  const displayValue = selectedDestination
    ? selectedDestination.label
    : inputValue || t("destinationPlaceholder");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-[57px] justify-start text-left font-normal border hover:border-blue-600 focus:border-blue-500 rounded-none bg-transparent hover:bg-transparent"
        >
          <MapPin className="mr-2 h-5 w-5 shrink-0" />
          <span className={selectedDestination ? "text-foreground" : "text-muted-foreground"}>
            {displayValue}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-none" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("searchDestination")}
            value={inputValue}
            onValueChange={handleInputChange}
            className="h-12"
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            )}

            {!isLoading && error && (
              <CommandEmpty>{error}</CommandEmpty>
            )}

            {!isLoading && !error && destinations.length === 0 && inputValue.length >= 2 && (
              <CommandEmpty>{t("noDestinationsFound")}</CommandEmpty>
            )}

            {!isLoading && !error && inputValue.length < 2 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                {t("enterAtLeast2Characters")}
              </div>
            )}

            {!isLoading && !error && destinations.length > 0 && (
              <CommandGroup>
                {destinations.map((destination, index) => {
                  const cityName = destination.address?.cityName || destination.name;
                  const countryCode = destination.address?.countryCode || "";
                  const cityCode = destination.address?.cityCode || destination.iataCode;

                  return (
                    <CommandItem
                      key={`${destination.id || index}-${cityCode}`}
                      value={`${cityName} ${countryCode}`}
                      onSelect={() => handleSelectDestination(destination)}
                      className="cursor-pointer"
                    >
                      <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                      <div className="flex flex-col">
                        <span className="font-medium">{cityName}</span>
                        {countryCode && (
                          <span className="text-xs text-muted-foreground">{countryCode}</span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
