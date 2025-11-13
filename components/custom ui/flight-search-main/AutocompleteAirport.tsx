"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Grid2 from "@mui/material/Grid2";
import CircularProgress from "@mui/material/CircularProgress";
// import { MapPinCheckInside } from "lucide-react";
import { formatString } from "@/lib/utils";
import { toast } from "../../ui/use-toast";
import { useTranslations } from "next-intl";

interface Airport {
  name: string;
  city: string;
  country: string;
  IATA?: string;
  ICAO: string;
  lat: string;
  lon: string;
  timezone: string;
}

interface AutocompleteOption {
  label: string;
  value: Airport;
  iataCode: string;
}

interface SearchType {
  type: string;
  getAirportValue: (value: string) => void;
  initialValue?: AutocompleteOption;
  onAirportSelect?: (airport: AutocompleteOption) => void;
}

const filterOptions = (
  options: AutocompleteOption[],
  { inputValue }: { inputValue: string }
) =>
  options.filter((option) =>
    option.label?.toLowerCase().includes(inputValue.toLowerCase())
  );

// Helper function to check localStorage for location codes
const checkLocationCodeInLocalStorage = (type: string): string | null => {
  try {
    if (typeof window === "undefined") return null;
    const searchHistory = localStorage.getItem("flight-search-history");
    if (!searchHistory) return null;

    const parsedData = JSON.parse(searchHistory);

    if (type.toLowerCase() === "departure" && parsedData.originLocationCode) {
      return parsedData.originLocationCode;
    } else if (
      type.toLowerCase() === "arrival" &&
      parsedData.destinationLocationCode
    ) {
      return parsedData.destinationLocationCode;
    }

    return null;
  } catch (error) {
    // console.error("Failed to check localStorage location codes:", error);
    return null;
  }
};

// Helper function to get localStorage airport data
const getLocalStorageAirportData = (type: string) => {
  try {
    if (typeof window === "undefined") return null;
    const airportData = localStorage.getItem("flight-search-airports");
    if (!airportData) return null;

    const parsedData = JSON.parse(airportData);

    if (type.toLowerCase() === "departure" && parsedData.originAirport) {
      return parsedData.originAirport;
    } else if (
      type.toLowerCase() === "arrival" &&
      parsedData.destinationAirport
    ) {
      return parsedData.destinationAirport;
    }

    return null;
  } catch (error) {
    // console.error("Failed to get localStorage airport data:", error);
    return null;
  }
};

const AutocompleteAirport: React.FC<SearchType> = ({
  type,
  getAirportValue,
  initialValue,
  onAirportSelect,
}) => {
  const t = useTranslations("flightSearch");
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [selectedAirport, setSelectedAirport] =
    useState<AutocompleteOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [hasLocalStorageData, setHasLocalStorageData] = useState(false);
  const [shouldTriggerFetch, setShouldTriggerFetch] = useState(false);

  // Use refs to store callback functions and avoid dependency issues
  const getAirportValueRef = useRef(getAirportValue);
  const onAirportSelectRef = useRef(onAirportSelect);

  // Update refs when props change
  useEffect(() => {
    getAirportValueRef.current = getAirportValue;
    onAirportSelectRef.current = onAirportSelect;
  });

  const fetchOptions = useCallback(
    async (value: string, shouldAutoSelect = false) => {
      if (!value.trim()) {
        setOptions([]);
        setIsLoading(false);
        return;
      }

      // If localStorage data is not available, still allow basic search functionality
      // but skip any localStorage-dependent operations
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/airports?q=${value}`
        );

        if (!response.ok) {
          // console.log(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.airports && Array.isArray(data.airports)) {
          const formattedCities =
            data.airports?.map((airport: Airport) => ({
              label: `${formatString(airport.name)}, ${formatString(
                airport.city
              )}, (${airport.IATA || airport.ICAO})`,
              value: airport,
              iataCode: airport.IATA || airport.ICAO,
            })) || [];

          setOptions(formattedCities);
          setError(null);

          // If we're auto-selecting (searching for localStorage location code),
          // find exact match and set it as selected
          if (
            shouldAutoSelect &&
            formattedCities.length > 0 &&
            !hasUserInteracted
          ) {
            const exactMatch = formattedCities.find(
              (airport: AutocompleteOption) =>
                airport.iataCode.toLowerCase() === value.toLowerCase()
            );
            const airportToSelect = exactMatch || formattedCities[0];

            // console.log(
            //   `[${type}] 🎯 Auto-selecting airport from search:`,
            //   airportToSelect.label
            // );
            // console.log(
            //   `[${type}] 📊 Search results count:`,
            //   formattedCities.length
            // );
            // console.log(`[${type}] 🎪 Exact match found:`, !!exactMatch);

            setSelectedAirport(airportToSelect);
            getAirportValueRef.current(airportToSelect.iataCode);
            if (onAirportSelectRef.current) {
              onAirportSelectRef.current(airportToSelect);
            }
          }
        } else {
          setOptions([]);
          // setError("No results found");
          // console.log("City data not ok");
        }
      } catch (error) {
        setOptions([]);
        // setError(
        //   error instanceof Error ? error.message : "Failed to search airports"
        // );
        // console.error("Error fetching cities:", error);
        toast({
          title: t("error.title"),
          description: t("error.searchAirports"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [hasUserInteracted, type]
  );

  // Initialize hydration and window width
  useEffect(() => {
    setHydrated(true);
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
    }
  }, []);

  // Handle localStorage check after hydration
  useEffect(() => {
    if (!hydrated) return;

    // console.log(`[${type}] 🚀 Component hydrated, checking localStorage...`);

    try {
      // Check for specific location codes first (primary requirement)
      const locationCode = checkLocationCodeInLocalStorage(type);

      if (locationCode) {
        // console.log(
        //   `[${type}] ✅ Found location code in localStorage:`,
        //   locationCode
        // );
        setHasLocalStorageData(true);
        // Location code exists, we can pre-fill
        getAirportValueRef.current(locationCode);

        // Try to find detailed airport data to set the visual field
        const localStorageAirport = getLocalStorageAirportData(type);
        if (localStorageAirport) {
          // console.log(
          //   `[${type}] 🎯 Setting visual field from detailed localStorage data:`,
          //   localStorageAirport.label
          // );
          setSelectedAirport(localStorageAirport);
          if (onAirportSelectRef.current) {
            onAirportSelectRef.current(localStorageAirport);
          }
        } else {
          // We have location code but no detailed data, search for it
          // console.log(
          //   `[${type}] 🔍 Have location code but no detailed data, searching for:`,
          //   locationCode
          // );
          fetchOptions(locationCode, true);
        }
      } else {
        // No location code exists, trigger fetch functionality
        // console.log(
        //   `[${type}] 📭 No location code in localStorage, triggering fetch`
        // );
        setHasLocalStorageData(false);
        setShouldTriggerFetch(true);
      }
    } catch (error) {
      // console.error(`[${type}] ❌ Failed to check localStorage:`, error);
      setHasLocalStorageData(false);
      setShouldTriggerFetch(true);
    }
  }, [hydrated, type, fetchOptions]);

  // Handle initial data loading from localStorage (separate effect to avoid function dependencies)
  useEffect(() => {
    if (!hydrated || hasUserInteracted) return;

    // Priority: initialValue > localStorage detailed airport data > fetch
    if (initialValue) {
      // Only update if the current selection is different from initialValue
      if (
        !selectedAirport ||
        selectedAirport.iataCode !== initialValue.iataCode
      ) {
        // console.log(
        //   `[${type}] Setting initial value from prop:`,
        //   initialValue.label
        // );
        setSelectedAirport(initialValue);
        getAirportValueRef.current(initialValue.iataCode);
        if (onAirportSelectRef.current) {
          onAirportSelectRef.current(initialValue);
        }
      }
      return;
    }

    // Check for detailed airport data in localStorage if location codes exist
    if (hasLocalStorageData && !selectedAirport) {
      const localStorageAirport = getLocalStorageAirportData(type);
      if (localStorageAirport) {
        // console.log(
        //   `[${type}] Setting initial value from localStorage detailed data:`,
        //   localStorageAirport.label
        // );
        setSelectedAirport(localStorageAirport);
        getAirportValueRef.current(localStorageAirport.iataCode);
        if (onAirportSelectRef.current) {
          onAirportSelectRef.current(localStorageAirport);
        }
      } else {
        // Location code exists but no detailed data, try to fetch based on location code
        const locationCode = checkLocationCodeInLocalStorage(type);
        if (locationCode) {
          // console.log(
          //   `[${type}] Have location code but no detailed data, searching for:`,
          //   locationCode
          // );
          fetchOptions(locationCode, true);
        }
      }
    }
  }, [
    hydrated,
    hasUserInteracted,
    initialValue,
    type,
    selectedAirport,
    hasLocalStorageData,
    fetchOptions,
  ]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const getResponsiveWidth = () => {
    if (windowWidth < 640) return { minWidth: 200, maxWidth: 300 };
    if (windowWidth < 1024) return { minWidth: 300, maxWidth: 450 };
    return { minWidth: 350, maxWidth: 600 };
  };

  // const fetchNearestAirport = useCallback(
  //   async (latitude: number, longitude: number) => {
  //     // Only proceed if we need to fetch data (no localStorage data available)
  //     if (hasLocalStorageData && !shouldTriggerFetch) {
  //       setIsLoading(false);
  //       return;
  //     }

  //     setIsLoading(true);
  //     try {
  //       const [airportRes, cityRes] = await Promise.all([
  //         fetch(
  //           `${process.env.NEXT_PUBLIC_API_URL}/api/nearest-airport?latitude=${latitude}&longitude=${longitude}`
  //         ),
  //         fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/airports?q=a`),
  //       ]);

  //       const airportData = await airportRes.json();

  //       if (airportData.data && !hasUserInteracted) {
  //         const formattedAirports =
  //           airportData?.data?.map((airport: Airport) => ({
  //             label: `${formatString(airport.name)}, ${formatString(
  //               airport.city
  //             )}, (${airport.IATA || airport.ICAO})`,
  //             value: airport,
  //             iataCode: airport.IATA || airport.ICAO,
  //           })) || [];

  //         setSelectedAirport(formattedAirports[0] || null);
  //         getAirportValueRef.current(formattedAirports[0]?.iataCode || "");
  //       } else {
  //         // console.log("Airport data not ok");
  //       }
  //       const cityData = await cityRes.json();

  //       if (cityData && cityData.airports) {
  //         const formattedCities =
  //           cityData.airports?.map((airport: Airport) => ({
  //             label: `${formatString(airport.name)}, ${formatString(
  //               airport.city
  //             )}, (${airport.IATA || airport.ICAO})`,
  //             value: airport,
  //             iataCode: airport.IATA || airport.ICAO,
  //           })) || [];

  //         setOptions(formattedCities);
  //       } else {
  //         // console.log("City data not ok");
  //       }
  //     } catch (error) {
  //       setOptions([]);
  //       // console.log("Error fetching airport data:", error);
  //     } finally {
  //       setIsLoading(false);
  //       setShouldTriggerFetch(false);
  //     }
  //   },
  //   [hasUserInteracted, hasLocalStorageData, shouldTriggerFetch]
  // );

  // useEffect(() => {
  //   // Trigger fetch for departure field when no localStorage data exists
  //   if (
  //     shouldTriggerFetch &&
  //     type.toLowerCase() === "departure" &&
  //     typeof window !== "undefined" &&
  //     navigator.geolocation
  //   ) {
  //     // console.log(
  //     //   `[${type}] Triggering geolocation fetch due to missing localStorage data`
  //     // );
  //     navigator.geolocation.getCurrentPosition(
  //       ({ coords: { latitude, longitude } }) =>
  //         fetchNearestAirport(latitude, longitude),
  //       (error) => {
  //         // console.log("Error getting location:", error);
  //         setIsLoading(false);
  //         setShouldTriggerFetch(false);
  //       }
  //     );
  //   } else if (shouldTriggerFetch && type.toLowerCase() === "arrival") {
  //     // For arrival field, fetch basic options when no localStorage data
  //     // console.log(
  //     //   `[${type}] Triggering basic fetch due to missing localStorage data`
  //     // );
  //     fetchOptions("a", false);
  //     setShouldTriggerFetch(false);
  //   }
  // }, [type, fetchNearestAirport, shouldTriggerFetch, fetchOptions]);

  // Return a consistent loading state during hydration to prevent mismatch
  if (!hydrated) {
    return (
      <Autocomplete
        sx={{
          width: "100%",
          minWidth: 200,
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
            color: "var(--white)",
            "& fieldset": {
              borderRadius: 0,
              borderColor: "hsl(var(--gray))",
              borderWidth: "0.5px",
            },
            "&:hover fieldset": {
              borderColor: "hsl(var(--blue-border))",
              borderWidth: "0.5px",
            },
            "&.Mui-focused fieldset": {
              borderColor: "hsl(var(--blue-border))",
              borderWidth: "0.5px",
            },
          },
          "& .MuiAutocomplete-clearIndicator": {
            color: "var(--white)",
          },
          "& .MuiAutocomplete-popupIndicator": {
            color: "var(--white)",
          },
        }}
        options={[]}
        loading={false}
        value={null}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t(type.toLowerCase())}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 0,
                borderColor: "hsl(var(--gray))",
                color: "var(--white)",
                "& fieldset": {
                  borderRadius: 0,
                  borderColor: "hsl(var(--gray))",
                  borderWidth: "0.5px",
                },
                "&:hover fieldset": {
                  borderColor: "hsl(var(--blue-border))",
                  borderWidth: "0.5px",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "hsl(var(--blue-border))",
                  borderWidth: "0.5px",
                },
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.875rem",
                color: "var(--white)",
              },
            }}
          />
        )}
      />
    );
  }

  const responsiveWidth = getResponsiveWidth();

  return (
    <Autocomplete
      sx={{
        width: "100%",
        minWidth: 200,
        "& .MuiOutlinedInput-root": {
          borderRadius: 0,
          color: "var(--white)",
          "& fieldset": {
            borderRadius: 0,
            borderColor: selectedAirport
              ? "hsl(var(--blue-border))"
              : "hsl(var(--gray))",
            borderWidth: "0.5px",
          },
          "&:hover fieldset": {
            borderColor: "hsl(var(--blue-border))",
            borderWidth: "0.5px",
          },
          "&.Mui-focused fieldset": {
            borderColor: "hsl(var(--blue-border))",
            borderWidth: "0.5px",
          },
        },

        "& .MuiAutocomplete-clearIndicator": {
          color: "var(--white)",
        },

        "& .MuiAutocomplete-popupIndicator": {
          color: "var(--white)",
        },
      }}
      filterOptions={filterOptions}
      getOptionLabel={(option) => option.label}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      ListboxProps={{
        style: {
          maxHeight: "400px",
          overflowY: "auto",
        },
      }}
      size="medium"
      loading={isLoading}
      value={selectedAirport}
      onChange={(_, newValue) => {
        setHasUserInteracted(true);
        setSelectedAirport(newValue);
        getAirportValueRef.current(newValue?.iataCode || "");
        if (newValue && onAirportSelectRef.current) {
          onAirportSelectRef.current(newValue);
        }
      }}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === "input") {
          setHasUserInteracted(true);
          setInputValue(newInputValue);
          fetchOptions(newInputValue);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t(type.toLowerCase())}
          fullWidth
          error={!!error}
          helperText={error}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
              borderColor: "hsl(var(--gray))",
              color: "var(--white)",

              "& fieldset": {
                borderRadius: 0,
                borderColor: selectedAirport
                  ? "hsl(var(--blue-border))"
                  : "hsl(var(--gray))",
                borderWidth: "0.5px",
              },
              "&:hover fieldset": {
                borderColor: "hsl(var(--blue-border))",
                borderWidth: "0.5px",
              },
              "&.Mui-focused fieldset": {
                borderColor: "hsl(var(--blue-border))",
                borderWidth: "2px",
              },
            },
            "& .MuiInputLabel-root": {
              fontSize: "0.875rem",
              color: "var(--white)",
            },
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {isLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li
          {...props}
          key={`${option.value.IATA || option.value.ICAO || option.value.name}-${option.value.lat}-${option.value.lon}`}
        >
          <Grid2
            container
            className="flex flex-1 border-b border-gray-200 py-2 px-1 lg:px-3"
            sx={{
              width: "100%",
              alignItems: "flex-start",
              "& .MuiOutlinedInput-root": {
                borderRadius: 0,
                "& fieldset": {
                  borderRadius: 0,
                },
              },
            }}
          >
            <Grid2 size={9} className="pr-0" sx={{ flexGrow: 1 }}>
              <Typography
                variant="caption"
                className="font-semibold mb-1 truncate pr-2"
                sx={{ fontSize: "0.75rem" }}
              >
                {formatString(option.value.name)}
              </Typography>
              <Typography
                variant="caption"
                className="text-gray-600 block truncate pr-2"
                sx={{
                  fontSize: "0.75rem",
                  lineHeight: 1.2,
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
              >
                <span className="font-semibold">
                  {" "}
                  {formatString(option.value.city)}
                </span>{" "}
                , <span> {formatString(option.value.country)}</span>
              </Typography>
            </Grid2>
            <Grid2
              size={3}
              className="flex justify-end items-end pt-1"
              sx={{ flexShrink: 0 }}
            >
              <span className="bg-blue-700 text-white text-xs px-3 py-1 rounded w-[50px] mx-auto">
                {option.value.IATA || option.value.ICAO}
              </span>
            </Grid2>
          </Grid2>
        </li>
      )}
    />
  );
};

export default AutocompleteAirport;
