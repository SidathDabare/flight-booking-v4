"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Grid2 from "@mui/material/Grid2";
import CircularProgress from "@mui/material/CircularProgress";
// import { MapPinCheckInside } from "lucide-react";
import { formatString } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface Airport {
  name: string;
  city: string;
  country: string;
  IATA?: string;
  ICAO: string;
  lat: string;
  lon: string;
  timezone: string;
}

export interface AutocompleteOption {
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

const AutocompleteHr: React.FC<SearchType> = ({
  type,
  getAirportValue,
  initialValue,
  onAirportSelect,
  shouldFetch = true,
}) => {
  const t = useTranslations("airportSearch");
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
    // console.log(`🔍 [${type}] AirportCombobox Debug:`, {
    //   hasInitialValue: Boolean(initialValue),
    //   initialValue: initialValue,
    //   hydrated: hydrated,
    //   hasUserInteracted: hasUserInteracted,
    //   selectedAirport: selectedAirport,
    // });

    if (initialValue && hydrated && !hasUserInteracted) {
      // console.log(
      //   `✅ [${type}] Auto-filling from localStorage:`,
      //   initialValue.label
      // );
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

  const fetchInitialAirports = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/airports?q=a`);
      const cityData = await response.json();

      if (cityData && cityData.airports) {
        const formattedCities =
          cityData.airports?.map((airport: Airport) => ({
            label: `${formatString(airport.name)}, ${formatString(
              airport.city
            )}, (${airport.IATA || airport.ICAO})`,
            value: airport,
            iataCode: airport.IATA || airport.ICAO,
          })) || [];

        setOptions(formattedCities);
      } else {
        // console.log("Airport data not available");
      }
    } catch (error) {
      setOptions([]);
      // console.log("Error fetching airport data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial airports fetching - only when no localStorage data exists
  useEffect(() => {
    // Skip fetching entirely if we have localStorage data
    if (initialValue) {
      setIsLoading(false);
      return;
    }

    // Fetch initial airports when no localStorage data
    if (
      shouldFetch &&
      !selectedAirport &&
      hydrated &&
      !hasUserInteracted
    ) {
      fetchInitialAirports();
    } else {
      setIsLoading(false);
    }
  }, [
    type,
    fetchInitialAirports,
    shouldFetch,
    initialValue,
    hydrated,
    selectedAirport,
    hasUserInteracted,
  ]);

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/airports?q=${value}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
      } else {
        setOptions([]);
        setError(t("noResults"));
      }
    } catch (error) {
      setOptions([]);
      setError(
        error instanceof Error ? error.message : t("searchFailed")
      );
      // console.error("Error fetching cities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

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
          label={type === "Departure" ? t("departure") : t("arrival")}
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
        <li
          {...props}
          key={`${option.value.IATA || option.value.ICAO || option.value.name}-${option.value.lat}-${option.value.lon}`}
        >
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

export default AutocompleteHr;
