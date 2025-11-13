import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { FlightOffer } from "amadeus-ts";

interface FlightStore {
  selectedFlight: FlightOffer | null;
  setSelectedFlight: (flight: FlightOffer | null) => void;
}

const useFlightStore = create<FlightStore>()(
  subscribeWithSelector(
    devtools(
      (set) => ({
        selectedFlight: null,
        setSelectedFlight: (flight) => {
          console.log("Setting flight:", flight);
          set({ selectedFlight: flight });
        },
      }),
      {
        name: "Flight Store",
        enabled: true,
      }
    )
  )
);

// Subscribe to state changes
useFlightStore.subscribe(
  (state) => state.selectedFlight,
  (selectedFlight) => {
    console.log("Flight store updated:", selectedFlight);
  }
);

// Add the store to the window object for debugging
if (typeof window !== "undefined") {
  (window as any).flightStore = useFlightStore;
}

export default useFlightStore;
