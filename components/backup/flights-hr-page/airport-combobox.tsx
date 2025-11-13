"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Grid2 from "@mui/material/Grid2";
import CircularProgress from "@mui/material/CircularProgress";
// import { MapPinCheckInside } from "lucide-react";
import { formatString } from "@/lib/utils";

interface Airport {
  id: string;
  name: string;
  iataCode: string;
  location: {
    latitude: number;
    longitude: number;
  };
  detailedName: string;
  address: {
    cityName: string;
    countryCode: string;
    countryName: string;
  };
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
  shouldFetch?: boolean; // New prop to control fetching behavior
}

const filterOptions = (
  options: AutocompleteOption[],
  { inputValue }: { inputValue: string }
) =>
  options.filter((option) =>
    option.label?.toLowerCase().includes(inputValue.toLowerCase())
  );

const AirportCombobox: React.FC<SearchType> = ({ type, getAirportValue, initialValue, onAirportSelect, shouldFetch = true }) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [selectedAirport, setSelectedAirport] =
    useState<AutocompleteOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // Use refs to store callback functions and avoid dependency issues
  const getAirportValueRef = useRef(getAirportValue);
  const onAirportSelectRef = useRef(onAirportSelect);

  // Update refs when props change
  useEffect(() => {
    getAirportValueRef.current = getAirportValue;
    onAirportSelectRef.current = onAirportSelect;
  });

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Priority handling for initialValue - always respect localStorage data
  useEffect(() => {
    console.log(`🔍 [${type}] AirportCombobox Debug:`, {
      hasInitialValue: Boolean(initialValue),
      initialValue: initialValue,
      hydrated: hydrated,
      hasUserInteracted: hasUserInteracted,
      selectedAirport: selectedAirport
    });
    
    if (initialValue && hydrated && !hasUserInteracted) {
      console.log(`✅ [${type}] Auto-filling from localStorage:`, initialValue.label);
      setSelectedAirport(initialValue);
      getAirportValueRef.current(initialValue.iataCode);
      if (onAirportSelectRef.current) {
        onAirportSelectRef.current(initialValue);
      }
      setIsLoading(false);
    }
  }, [initialValue, hydrated, hasUserInteracted, type]);

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

  const fetchNearestAirport = useCallback(
    async (latitude: number, longitude: number) => {
      setIsLoading(true);
      try {
        const [airportRes, cityRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/nearest-airport?latitude=${latitude}&longitude=${longitude}`
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/city-search?keyword=a`),
        ]);

        const airportData = await airportRes.json();

        if (airportData.data && !hasUserInteracted) {
          const formattedAirports =
            airportData?.data?.map((airport: Airport) => ({
              label: `${formatString(airport.name)}, ${formatString(
                airport.address.cityName
              )}, (${airport.iataCode})`,
              value: airport,
              iataCode: airport.iataCode,
            })) || [];

          const nearestAirport = formattedAirports[0];
          if (nearestAirport) {
            setSelectedAirport(nearestAirport);
            getAirportValueRef.current(nearestAirport.iataCode);
          }
        } else {
          console.log(`[${type}] No geolocation airport data available`);
        }
        const cityData = await cityRes.json();

        if (cityData) {
          const formattedCities =
            cityData?.map((airport: Airport) => ({
              label: `${formatString(airport.name)}, ${formatString(
                airport.address.cityName
              )}, (${airport.iataCode})`,
              value: airport,
              iataCode: airport.iataCode,
            })) || [];

          setOptions(formattedCities);
        } else {
          console.log("City data not ok");
        }
      } catch (error) {
        setOptions([]);
        console.log("Error fetching airport data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [hasUserInteracted, type]
  );

  // Geolocation fetching - only when no localStorage data exists
  useEffect(() => {
    // Skip geolocation entirely if we have localStorage data
    if (initialValue) {
      setIsLoading(false);
      return;
    }

    // Only fetch geolocation for departure when no localStorage data
    if (
      shouldFetch &&
      !selectedAirport &&
      type.toLowerCase() === "departure" &&
      typeof window !== "undefined" &&
      navigator.geolocation &&
      hydrated &&
      !hasUserInteracted
    ) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) =>
          fetchNearestAirport(latitude, longitude),
        (error) => {
          console.log(`[${type}] Geolocation error:`, error);
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  }, [type, fetchNearestAirport, shouldFetch, initialValue, hydrated, selectedAirport, hasUserInteracted]);

  const fetchOptions = useCallback(async (value: string) => {
    if (!value.trim()) {
      setOptions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/city-search?keyword=${value}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data)) {
        const formattedCities =
          data?.map((airport: Airport) => ({
            label: `${formatString(airport.name)}, ${formatString(
              airport.address.cityName
            )}, (${airport.iataCode})`,
            value: airport,
            iataCode: airport.iataCode,
          })) || [];

        setOptions(formattedCities);
        setError(null);
      } else {
        setOptions([]);
        setError("No results found");
      }
    } catch (error) {
      setOptions([]);
      setError(
        error instanceof Error ? error.message : "Failed to search airports"
      );
      console.error("Error fetching cities:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (!hydrated) return null;

  const responsiveWidth = getResponsiveWidth();

  return (
    <Autocomplete
      sx={{
        width: "100%",
        minWidth: 200,
        "& .MuiOutlinedInput-root": {
          borderRadius: 0,
          // color: "var(--white)",
        },

        "& fieldset": {
          borderRadius: 0,
          // color: "var(--white)",
        },

        "& .MuiAutocomplete-clearIndicator": {
          // color: "var(--white)",
        },

        "& .MuiAutocomplete-popupIndicator": {
          // color: "var(--white)",
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
          label={`${type}`}
          fullWidth
          error={!!error}
          helperText={error}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
              // borderColor: "var(--white)",
              // color: "var(--white)",

              "& fieldset": {
                borderRadius: 0,
                // borderColor: "var(--white)",
              },
              "&:hover fieldset": {
                // borderColor: "var(--blue-border)",
              },
              "&.Mui-focused fieldset": {
                // borderColor: "var(--blue-border)",
                // borderWidth: "2px",
              },
            },
            "& .MuiInputLabel-root": {
              // fontSize: "0.875rem",
              // color: "var(--white)",
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
        <li {...props} key={option.value.id}>
          <Grid2
            container
            className="flex flex-1 border-b py-2 px-1 lg:px-3"
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
                className="block truncate pr-2"
                sx={{
                  fontSize: "0.75rem",
                  lineHeight: 1.2,
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
              >
                <span className="font-semibold">
                  {" "}
                  {formatString(option.value.address.cityName)}
                </span>{" "}
                , <span> {formatString(option.value.address.countryName)}</span>
              </Typography>
            </Grid2>
            <Grid2
              size={3}
              className="flex justify-end items-end pt-1"
              sx={{ flexShrink: 0 }}
            >
              <span className="bg-blue-700 text-white text-xs px-3 py-1 rounded w-[50px] mx-auto">
                {option.value.iataCode}
              </span>
            </Grid2>
          </Grid2>
        </li>
      )}
    />
  );
};

export default AirportCombobox;
