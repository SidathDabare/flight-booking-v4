import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Hotel Store Interface
 * Manages selected hotel and search criteria with persistence
 */
interface HotelStore {
  // Selected hotel offer
  selectedHotel: any | null;
  selectedHotelTimestamp: number | null;

  // Search criteria
  searchCriteria: {
    cityCode?: string;
    cityName?: string;
    checkInDate?: string;
    checkOutDate?: string;
    adults?: number;
    children?: number;
    rooms?: number;
    currency?: string;
  } | null;

  // Actions
  setSelectedHotel: (hotel: any) => void;
  clearSelectedHotel: () => void;
  clearExpiredHotel: () => void;
  getTimeRemaining: () => number;
  isHotelExpired: () => boolean;

  setSearchCriteria: (criteria: HotelStore["searchCriteria"]) => void;
  clearSearchCriteria: () => void;
}

/**
 * Hotel expiry time: 20 minutes (same as flights)
 * Hotel availability can change frequently
 */
const HOTEL_EXPIRY_TIME = 20 * 60 * 1000; // 20 minutes in milliseconds

export const useHotelStore = create<HotelStore>()(
  persist(
    (set, get) => ({
      selectedHotel: null,
      selectedHotelTimestamp: null,
      searchCriteria: null,

      /**
       * Set selected hotel and timestamp
       */
      setSelectedHotel: (hotel: any) => {
        set({
          selectedHotel: hotel,
          selectedHotelTimestamp: Date.now(),
        });
      },

      /**
       * Clear selected hotel
       */
      clearSelectedHotel: () => {
        set({
          selectedHotel: null,
          selectedHotelTimestamp: null,
        });
      },

      /**
       * Clear hotel if expired (> 20 minutes)
       */
      clearExpiredHotel: () => {
        const state = get();
        if (state.isHotelExpired()) {
          state.clearSelectedHotel();
        }
      },

      /**
       * Get time remaining in milliseconds
       * Returns 0 if no hotel selected or expired
       */
      getTimeRemaining: () => {
        const state = get();
        if (!state.selectedHotelTimestamp) {
          return 0;
        }

        const elapsed = Date.now() - state.selectedHotelTimestamp;
        const remaining = HOTEL_EXPIRY_TIME - elapsed;

        return remaining > 0 ? remaining : 0;
      },

      /**
       * Check if hotel has expired
       */
      isHotelExpired: () => {
        const state = get();
        if (!state.selectedHotelTimestamp) {
          return true;
        }

        const elapsed = Date.now() - state.selectedHotelTimestamp;
        return elapsed > HOTEL_EXPIRY_TIME;
      },

      /**
       * Set search criteria for reference
       */
      setSearchCriteria: (criteria: HotelStore["searchCriteria"]) => {
        set({ searchCriteria: criteria });
      },

      /**
       * Clear search criteria
       */
      clearSearchCriteria: () => {
        set({ searchCriteria: null });
      },
    }),
    {
      name: "hotel-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),

      // Only persist selected hotel and search criteria
      partialize: (state) => ({
        selectedHotel: state.selectedHotel,
        selectedHotelTimestamp: state.selectedHotelTimestamp,
        searchCriteria: state.searchCriteria,
      }),

      // Clear expired hotel on rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.clearExpiredHotel();
        }
      },
    }
  )
);

/**
 * Hook to get formatted time remaining
 */
export const useHotelTimeRemaining = () => {
  const getTimeRemaining = useHotelStore((state) => state.getTimeRemaining);
  const timeRemaining = getTimeRemaining();

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  return {
    timeRemaining,
    minutes,
    seconds,
    formatted: `${minutes}:${seconds.toString().padStart(2, "0")}`,
  };
};
