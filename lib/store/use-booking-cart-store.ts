import { create } from "zustand";
import { persist, devtools, subscribeWithSelector } from "zustand/middleware";
import type { FlightOffer } from "amadeus-ts";
import type { HotelBooking } from "@/types/hotel";
import type { CarRental } from "@/types/car";

// Union type for all booking types
export type BookingCartItem =
  | { type: "flight"; id: string; data: FlightOffer; addedAt: number }
  | { type: "hotel"; id: string; data: HotelBooking; addedAt: number }
  | { type: "car"; id: string; data: CarRental; addedAt: number };

interface BookingCartStore {
  items: BookingCartItem[];
  promoCode: string | null;
  discount: number;

  // Actions
  addFlight: (flight: FlightOffer) => void;
  addHotel: (hotel: HotelBooking) => void;
  addCar: (car: CarRental) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<BookingCartItem>) => void;
  clearCart: () => void;

  // Promo code
  setPromoCode: (code: string) => void;
  clearPromoCode: () => void;
  applyDiscount: (amount: number) => void;

  // Getters
  getItemCount: () => number;
  getFlights: () => BookingCartItem[];
  getHotels: () => BookingCartItem[];
  getCars: () => BookingCartItem[];
  getTotalPrice: () => number;
  getSubtotal: () => number;
  getTotalWithDiscount: () => number;
  hasItems: () => boolean;
}

const useBookingCartStore = create<BookingCartStore>()(
  persist(
    subscribeWithSelector(
      devtools(
        (set, get) => ({
          items: [],
          promoCode: null,
          discount: 0,

          addFlight: (flight) => {
            const { items } = get();
            const id = `flight-${flight.id}-${Date.now()}`;

            console.log("Adding flight to cart:", flight);

            set({
              items: [
                ...items,
                {
                  type: "flight" as const,
                  id,
                  data: flight,
                  addedAt: Date.now(),
                },
              ],
            });
          },

          addHotel: (hotel) => {
            const { items } = get();
            const id = `hotel-${hotel.hotelId}-${Date.now()}`;

            console.log("Adding hotel to cart:", hotel);

            set({
              items: [
                ...items,
                {
                  type: "hotel" as const,
                  id,
                  data: hotel,
                  addedAt: Date.now(),
                },
              ],
            });
          },

          addCar: (car) => {
            const { items } = get();
            const id = `car-${car.vehicleId}-${Date.now()}`;

            console.log("Adding car to cart:", car);

            set({
              items: [
                ...items,
                {
                  type: "car" as const,
                  id,
                  data: car,
                  addedAt: Date.now(),
                },
              ],
            });
          },

          removeItem: (id) => {
            const { items } = get();
            console.log("Removing item from cart:", id);

            set({
              items: items.filter((item) => item.id !== id),
            });
          },

          updateItem: (id, updates) => {
            const { items } = get();
            set({
              items: items.map((item) =>
                item.id === id ? { ...item, ...updates } as BookingCartItem : item
              ),
            });
          },

          clearCart: () => {
            console.log("Clearing cart");
            set({
              items: [],
              promoCode: null,
              discount: 0,
            });
          },

          setPromoCode: (code) => {
            set({ promoCode: code });
          },

          clearPromoCode: () => {
            set({ promoCode: null, discount: 0 });
          },

          applyDiscount: (amount) => {
            set({ discount: amount });
          },

          // Getters
          getItemCount: () => {
            return get().items.length;
          },

          getFlights: () => {
            return get().items.filter((item) => item.type === "flight");
          },

          getHotels: () => {
            return get().items.filter((item) => item.type === "hotel");
          },

          getCars: () => {
            return get().items.filter((item) => item.type === "car");
          },

          getSubtotal: () => {
            const { items } = get();
            return items.reduce((total, item) => {
              if (item.type === "flight") {
                return total + parseFloat(item.data.price?.grandTotal || "0");
              } else if (item.type === "hotel") {
                return total + (item.data.pricing?.totalPrice || 0);
              } else if (item.type === "car") {
                return total + (item.data.pricing?.totalPrice || 0);
              }
              return total;
            }, 0);
          },

          getTotalPrice: () => {
            const { items } = get();
            return items.reduce((total, item) => {
              if (item.type === "flight") {
                // Flight price is a string
                return total + parseFloat(item.data.price?.grandTotal || "0");
              } else if (item.type === "hotel") {
                // Hotel price is a number
                return total + (item.data.pricing?.totalPrice || 0);
              } else if (item.type === "car") {
                // Car price is a number
                return total + (item.data.pricing?.totalPrice || 0);
              }
              return total;
            }, 0);
          },

          getTotalWithDiscount: () => {
            const subtotal = get().getSubtotal();
            const { discount } = get();
            return Math.max(0, subtotal - discount);
          },

          hasItems: () => {
            return get().items.length > 0;
          },
        }),
        {
          name: "Booking Cart Store",
          enabled: true,
        }
      )
    ),
    {
      name: "booking-cart-storage", // localStorage key
    }
  )
);

// Subscribe to cart changes
useBookingCartStore.subscribe(
  (state) => state.items,
  (items) => {
    console.log(`Cart updated: ${items.length} items`);
  }
);

// Add the store to the window object for debugging
if (typeof window !== "undefined") {
  (window as any).cartStore = useBookingCartStore;
}

export default useBookingCartStore;
