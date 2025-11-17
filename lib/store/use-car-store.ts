import { create } from "zustand";
import { persist, devtools, subscribeWithSelector } from "zustand/middleware";
import type { Vehicle, Driver, InsuranceOption, AdditionalService, CarLocation } from "@/types/car";

interface CarStore {
  selectedVehicle: Vehicle | null;
  pickupLocation: CarLocation | null;
  dropoffLocation: CarLocation | null;
  pickupDate: string | null;
  dropoffDate: string | null;
  durationDays: number;
  driver: Driver | null;
  additionalDrivers: Driver[];
  selectedInsurance: InsuranceOption[];
  selectedServices: AdditionalService[];
  specialRequests: string;
  selectedAt: number | null; // Timestamp when vehicle was selected

  // Actions
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  setPickupLocation: (location: CarLocation | null) => void;
  setDropoffLocation: (location: CarLocation | null) => void;
  setDates: (pickup: string, dropoff: string) => void;
  setDriver: (driver: Driver | null) => void;
  addAdditionalDriver: (driver: Driver) => void;
  removeAdditionalDriver: (driverId: string) => void;
  setInsurance: (insurance: InsuranceOption[]) => void;
  toggleInsurance: (insurance: InsuranceOption) => void;
  setServices: (services: AdditionalService[]) => void;
  toggleService: (service: AdditionalService) => void;
  setSpecialRequests: (requests: string) => void;
  clearExpiredSelection: () => boolean;
  getTimeRemaining: () => number | null;
  clearAll: () => void;
}

// 20 minutes in milliseconds (same as flight/hotel stores)
const CAR_PERSISTENCE_MS = 20 * 60 * 1000;

const useCarStore = create<CarStore>()(
  persist(
    subscribeWithSelector(
      devtools(
        (set, get) => ({
          selectedVehicle: null,
          pickupLocation: null,
          dropoffLocation: null,
          pickupDate: null,
          dropoffDate: null,
          durationDays: 0,
          driver: null,
          additionalDrivers: [],
          selectedInsurance: [],
          selectedServices: [],
          specialRequests: "",
          selectedAt: null,

          setSelectedVehicle: (vehicle) => {
            console.log("Setting vehicle:", vehicle);

            set({
              selectedVehicle: vehicle,
              selectedAt: vehicle ? Date.now() : null,
            });
          },

          setPickupLocation: (location) => {
            set({ pickupLocation: location });
          },

          setDropoffLocation: (location) => {
            set({ dropoffLocation: location });
          },

          setDates: (pickup, dropoff) => {
            console.log("Setting rental dates:", pickup, dropoff);

            // Calculate duration in days
            const pickupDate = new Date(pickup);
            const dropoffDate = new Date(dropoff);
            const days = Math.ceil((dropoffDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));

            set({
              pickupDate: pickup,
              dropoffDate: dropoff,
              durationDays: days,
            });
          },

          setDriver: (driver) => {
            set({ driver });
          },

          addAdditionalDriver: (driver) => {
            const { additionalDrivers } = get();
            set({ additionalDrivers: [...additionalDrivers, driver] });
          },

          removeAdditionalDriver: (driverId) => {
            const { additionalDrivers } = get();
            set({ additionalDrivers: additionalDrivers.filter((d) => d.id !== driverId) });
          },

          setInsurance: (insurance) => {
            set({ selectedInsurance: insurance });
          },

          toggleInsurance: (insurance) => {
            const { selectedInsurance } = get();
            const exists = selectedInsurance.find((i) => i.code === insurance.code);

            if (exists) {
              // Remove
              set({ selectedInsurance: selectedInsurance.filter((i) => i.code !== insurance.code) });
            } else {
              // Add
              set({ selectedInsurance: [...selectedInsurance, insurance] });
            }
          },

          setServices: (services) => {
            set({ selectedServices: services });
          },

          toggleService: (service) => {
            const { selectedServices } = get();
            const exists = selectedServices.find((s) => s.code === service.code);

            if (exists) {
              // Remove
              set({ selectedServices: selectedServices.filter((s) => s.code !== service.code) });
            } else {
              // Add
              set({ selectedServices: [...selectedServices, service] });
            }
          },

          setSpecialRequests: (requests) => {
            set({ specialRequests: requests });
          },

          clearExpiredSelection: () => {
            const { selectedAt, selectedVehicle } = get();

            if (!selectedAt || !selectedVehicle) return false;

            const now = Date.now();
            const elapsed = now - selectedAt;

            if (elapsed > CAR_PERSISTENCE_MS) {
              console.log("Car selection expired (20 minutes), clearing...");
              set({
                selectedVehicle: null,
                selectedAt: null,
                driver: null,
                additionalDrivers: [],
                selectedInsurance: [],
                selectedServices: [],
                specialRequests: "",
              });
              return true;
            }
            return false;
          },

          getTimeRemaining: () => {
            const { selectedAt } = get();
            if (!selectedAt) return null;

            const now = Date.now();
            const elapsed = now - selectedAt;
            const remaining = CAR_PERSISTENCE_MS - elapsed;

            return remaining > 0 ? remaining : 0;
          },

          clearAll: () => {
            set({
              selectedVehicle: null,
              pickupLocation: null,
              dropoffLocation: null,
              pickupDate: null,
              dropoffDate: null,
              durationDays: 0,
              driver: null,
              additionalDrivers: [],
              selectedInsurance: [],
              selectedServices: [],
              specialRequests: "",
              selectedAt: null,
            });
          },
        }),
        {
          name: "Car Store",
          enabled: true,
        }
      )
    ),
    {
      name: "car-storage", // localStorage key

      // Called when hydrating from storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check expiration immediately after hydration
          const expired = state.clearExpiredSelection();
          if (expired) {
            console.log("Car selection expired during hydration, cleared");
          }
        }
      },
    }
  )
);

// Subscribe to state changes
useCarStore.subscribe(
  (state) => state.selectedVehicle,
  (selectedVehicle) => {
    console.log("Car store updated:", selectedVehicle);
  }
);

// Auto-check expiration on initial load and periodically
if (typeof window !== "undefined") {
  // Check expiration on initial load
  setTimeout(() => {
    useCarStore.getState().clearExpiredSelection();
  }, 100);

  // Periodic check every minute to ensure cleanup
  setInterval(() => {
    const expired = useCarStore.getState().clearExpiredSelection();
    if (expired) {
      console.log("Car selection expired during periodic check");
    }
  }, 60 * 1000);

  // Add the store to the window object for debugging
  (window as any).carStore = useCarStore;
}

export default useCarStore;
export { CAR_PERSISTENCE_MS };
