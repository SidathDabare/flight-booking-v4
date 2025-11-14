import { create } from "zustand";
import { persist, devtools, subscribeWithSelector } from "zustand/middleware";
import { FlightOffer } from "amadeus-ts";

interface FlightStore {
  selectedFlight: FlightOffer | null;
  selectedAt: number | null; // Timestamp when flight was selected
  setSelectedFlight: (flight: FlightOffer | null) => void;
  clearExpiredFlight: () => boolean;
  getTimeRemaining: () => number | null;
}

// 20 minutes in milliseconds
const FLIGHT_PERSISTENCE_MS = 20 * 60 * 1000;

const useFlightStore = create<FlightStore>()(
  persist(
    subscribeWithSelector(
      devtools(
        (set, get) => ({
          selectedFlight: null,
          selectedAt: null,

          setSelectedFlight: (flight) => {
            console.log("Setting flight:", flight);
            set({
              selectedFlight: flight,
              selectedAt: flight ? Date.now() : null,
            });
          },

          clearExpiredFlight: () => {
            const { selectedAt, selectedFlight } = get();

            if (!selectedAt || !selectedFlight) return false;

            const now = Date.now();
            const elapsed = now - selectedAt;

            if (elapsed > FLIGHT_PERSISTENCE_MS) {
              console.log("Flight selection expired (20 minutes), clearing...");
              set({ selectedFlight: null, selectedAt: null });
              return true;
            }
            return false;
          },

          getTimeRemaining: () => {
            const { selectedAt } = get();
            if (!selectedAt) return null;

            const now = Date.now();
            const elapsed = now - selectedAt;
            const remaining = FLIGHT_PERSISTENCE_MS - elapsed;

            return remaining > 0 ? remaining : 0;
          },
        }),
        {
          name: "Flight Store",
          enabled: true,
        }
      )
    ),
    {
      name: "flight-storage", // localStorage key

      // Called when hydrating from storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check expiration immediately after hydration
          const expired = state.clearExpiredFlight();
          if (expired) {
            console.log("Flight selection expired during hydration, cleared");
          }
        }
      },
    }
  )
);

// Subscribe to state changes
useFlightStore.subscribe(
  (state) => state.selectedFlight,
  (selectedFlight) => {
    console.log("Flight store updated:", selectedFlight);
  }
);

// Auto-check expiration on initial load and periodically
if (typeof window !== "undefined") {
  // Check expiration on initial load
  setTimeout(() => {
    useFlightStore.getState().clearExpiredFlight();
  }, 100);

  // Periodic check every minute to ensure cleanup
  setInterval(() => {
    const expired = useFlightStore.getState().clearExpiredFlight();
    if (expired) {
      console.log("Flight selection expired during periodic check");
    }
  }, 60 * 1000);

  // Add the store to the window object for debugging
  (window as any).flightStore = useFlightStore;
}

export default useFlightStore;
export { FLIGHT_PERSISTENCE_MS };
