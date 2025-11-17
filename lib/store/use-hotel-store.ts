import { create } from "zustand";
import { persist, devtools, subscribeWithSelector } from "zustand/middleware";
import type { Hotel, HotelGuest, HotelStay } from "@/types/hotel";

interface HotelStore {
  selectedHotel: Hotel | null;
  selectedRoomId: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  guests: HotelGuest[];
  numberOfNights: number;
  specialRequests: string;
  selectedAt: number | null; // Timestamp when hotel was selected

  // Actions
  setSelectedHotel: (hotel: Hotel | null, roomId?: string) => void;
  setDates: (checkIn: string, checkOut: string) => void;
  setGuests: (guests: HotelGuest[]) => void;
  addGuest: (guest: HotelGuest) => void;
  removeGuest: (guestId: string) => void;
  updateGuest: (guestId: string, updates: Partial<HotelGuest>) => void;
  setSpecialRequests: (requests: string) => void;
  clearExpiredSelection: () => boolean;
  getTimeRemaining: () => number | null;
  clearAll: () => void;
}

// 20 minutes in milliseconds (same as flight store)
const HOTEL_PERSISTENCE_MS = 20 * 60 * 1000;

const useHotelStore = create<HotelStore>()(
  persist(
    subscribeWithSelector(
      devtools(
        (set, get) => ({
          selectedHotel: null,
          selectedRoomId: null,
          checkInDate: null,
          checkOutDate: null,
          guests: [],
          numberOfNights: 0,
          specialRequests: "",
          selectedAt: null,

          setSelectedHotel: (hotel, roomId) => {
            console.log("Setting hotel:", hotel, "Room:", roomId);

            // Calculate number of nights if dates are set
            let nights = 0;
            const { checkInDate, checkOutDate } = get();
            if (checkInDate && checkOutDate) {
              const checkIn = new Date(checkInDate);
              const checkOut = new Date(checkOutDate);
              nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            }

            set({
              selectedHotel: hotel,
              selectedRoomId: roomId || null,
              selectedAt: hotel ? Date.now() : null,
              numberOfNights: nights,
            });
          },

          setDates: (checkIn, checkOut) => {
            console.log("Setting dates:", checkIn, checkOut);

            // Calculate number of nights
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

            set({
              checkInDate: checkIn,
              checkOutDate: checkOut,
              numberOfNights: nights,
            });
          },

          setGuests: (guests) => {
            set({ guests });
          },

          addGuest: (guest) => {
            const { guests } = get();
            set({ guests: [...guests, guest] });
          },

          removeGuest: (guestId) => {
            const { guests } = get();
            set({ guests: guests.filter((g) => g.id !== guestId) });
          },

          updateGuest: (guestId, updates) => {
            const { guests } = get();
            set({
              guests: guests.map((g) =>
                g.id === guestId ? { ...g, ...updates } : g
              ),
            });
          },

          setSpecialRequests: (requests) => {
            set({ specialRequests: requests });
          },

          clearExpiredSelection: () => {
            const { selectedAt, selectedHotel } = get();

            if (!selectedAt || !selectedHotel) return false;

            const now = Date.now();
            const elapsed = now - selectedAt;

            if (elapsed > HOTEL_PERSISTENCE_MS) {
              console.log("Hotel selection expired (20 minutes), clearing...");
              set({
                selectedHotel: null,
                selectedRoomId: null,
                selectedAt: null,
                guests: [],
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
            const remaining = HOTEL_PERSISTENCE_MS - elapsed;

            return remaining > 0 ? remaining : 0;
          },

          clearAll: () => {
            set({
              selectedHotel: null,
              selectedRoomId: null,
              checkInDate: null,
              checkOutDate: null,
              guests: [],
              numberOfNights: 0,
              specialRequests: "",
              selectedAt: null,
            });
          },
        }),
        {
          name: "Hotel Store",
          enabled: true,
        }
      )
    ),
    {
      name: "hotel-storage", // localStorage key

      // Called when hydrating from storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check expiration immediately after hydration
          const expired = state.clearExpiredSelection();
          if (expired) {
            console.log("Hotel selection expired during hydration, cleared");
          }
        }
      },
    }
  )
);

// Subscribe to state changes
useHotelStore.subscribe(
  (state) => state.selectedHotel,
  (selectedHotel) => {
    console.log("Hotel store updated:", selectedHotel);
  }
);

// Auto-check expiration on initial load and periodically
if (typeof window !== "undefined") {
  // Check expiration on initial load
  setTimeout(() => {
    useHotelStore.getState().clearExpiredSelection();
  }, 100);

  // Periodic check every minute to ensure cleanup
  setInterval(() => {
    const expired = useHotelStore.getState().clearExpiredSelection();
    if (expired) {
      console.log("Hotel selection expired during periodic check");
    }
  }, 60 * 1000);

  // Add the store to the window object for debugging
  (window as any).hotelStore = useHotelStore;
}

export default useHotelStore;
export { HOTEL_PERSISTENCE_MS };
