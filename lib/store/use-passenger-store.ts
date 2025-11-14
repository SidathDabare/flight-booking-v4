import { create } from "zustand";
import { persist, devtools, subscribeWithSelector } from "zustand/middleware";

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  passportNumber: string;
  travelerType: string;
}

interface PassengerStore {
  passengers: Passenger[];
  persistedAt: number | null; // Timestamp when first persisted
  addPassenger: (passenger: Omit<Passenger, "id">) => void;
  updatePassenger: (id: string, passenger: Partial<Passenger>) => void;
  deletePassenger: (id: string) => void;
  clearPassengers: () => void;
  clearExpiredPassengers: () => boolean;
  getTimeRemaining: () => number | null;
}

// Match flight persistence duration (20 minutes)
const PASSENGER_PERSISTENCE_MS = 20 * 60 * 1000;

const usePassengerStore = create<PassengerStore>()(
  persist(
    subscribeWithSelector(
      devtools(
        (set, get) => ({
          passengers: [],
          persistedAt: null,

          addPassenger: (passenger) => {
            const state = get();
            const now = Date.now();
            set({
              passengers: [
                ...state.passengers,
                { ...passenger, id: Math.random().toString(36).substr(2, 9) },
              ],
              persistedAt: state.persistedAt || now, // Set timestamp on first add
            });
          },

          updatePassenger: (id, updatedPassenger) =>
            set((state) => ({
              passengers: state.passengers.map((p) =>
                p.id === id ? { ...p, ...updatedPassenger } : p
              ),
            })),

          deletePassenger: (id) =>
            set((state) => ({
              passengers: state.passengers.filter((p) => p.id !== id),
            })),

          clearPassengers: () => {
            console.log("Clearing all passenger data from storage");
            set({ passengers: [], persistedAt: null });
          },

          clearExpiredPassengers: () => {
            const { persistedAt, passengers } = get();

            if (!persistedAt || passengers.length === 0) return false;

            const now = Date.now();
            const elapsed = now - persistedAt;

            if (elapsed > PASSENGER_PERSISTENCE_MS) {
              console.log("Passenger data expired (20 minutes), clearing...");
              set({ passengers: [], persistedAt: null });
              return true;
            }
            return false;
          },

          getTimeRemaining: () => {
            const { persistedAt } = get();
            if (!persistedAt) return null;

            const now = Date.now();
            const elapsed = now - persistedAt;
            const remaining = PASSENGER_PERSISTENCE_MS - elapsed;

            return remaining > 0 ? remaining : 0;
          },
        }),
        {
          name: "Passenger Store",
          enabled: true,
        }
      )
    ),
    {
      name: "passenger-storage", // localStorage key

      // Check expiration on hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          const expired = state.clearExpiredPassengers();
          if (expired) {
            console.log("Passenger data expired during hydration, cleared");
          }
        }
      },
    }
  )
);

// Subscribe to state changes
usePassengerStore.subscribe(
  (state) => state.passengers,
  (passengers) => {
    console.log("Passenger store updated:", passengers.length, "passengers");
  }
);

// Auto-check expiration on initial load and periodically
if (typeof window !== "undefined") {
  // Check expiration on initial load
  setTimeout(() => {
    usePassengerStore.getState().clearExpiredPassengers();
  }, 100);

  // Periodic check every 2 minutes to ensure cleanup
  setInterval(() => {
    const expired = usePassengerStore.getState().clearExpiredPassengers();
    if (expired) {
      console.log("Passenger data expired during periodic check");
    }
  }, 2 * 60 * 1000);

  // Add the store to the window object for debugging
  (window as any).passengerStore = usePassengerStore;
}

export default usePassengerStore;
export { PASSENGER_PERSISTENCE_MS };
