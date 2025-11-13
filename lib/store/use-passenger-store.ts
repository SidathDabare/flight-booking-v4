import { create } from "zustand";

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
  addPassenger: (passenger: Omit<Passenger, "id">) => void;
  updatePassenger: (id: string, passenger: Partial<Passenger>) => void;
  deletePassenger: (id: string) => void;
  clearPassengers: () => void;
}

const usePassengerStore = create<PassengerStore>((set) => ({
  passengers: [],
  addPassenger: (passenger) =>
    set((state) => ({
      passengers: [
        ...state.passengers,
        { ...passenger, id: Math.random().toString(36).substr(2, 9) },
      ],
    })),
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
  clearPassengers: () => set({ passengers: [] }),
}));

export default usePassengerStore;
