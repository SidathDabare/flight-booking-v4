import { renderHook, act } from '@testing-library/react'
import useBookingCartStore from '@/lib/store/use-booking-cart-store'
import { mockFlightOffer, mockHotel, mockCar } from '../utils/mock-data.tsx'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useBookingCartStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    const { result } = renderHook(() => useBookingCartStore())
    act(() => {
      result.current.clearCart()
    })
    localStorageMock.clear()
  })

  describe('addFlight', () => {
    it('should add a flight to the cart', () => {
      const { result } = renderHook(() => useBookingCartStore())

      act(() => {
        result.current.addFlight(mockFlightOffer as any)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].type).toBe('flight')
      expect(result.current.items[0].data).toEqual(mockFlightOffer)
    })

    it('should increment item count when adding a flight', () => {
      const { result } = renderHook(() => useBookingCartStore())

      expect(result.current.getItemCount()).toBe(0)

      act(() => {
        result.current.addFlight(mockFlightOffer as any)
      })

      expect(result.current.getItemCount()).toBe(1)
    })
  })

  describe('addHotel', () => {
    it('should add a hotel to the cart', () => {
      const { result } = renderHook(() => useBookingCartStore())

      const hotelBooking = {
        hotelId: 'HOTEL123',
        ...mockHotel,
        pricing: {
          totalPrice: 500,
          currency: 'USD',
        },
      }

      act(() => {
        result.current.addHotel(hotelBooking as any)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].type).toBe('hotel')
      expect(result.current.getHotels()).toHaveLength(1)
    })
  })

  describe('addCar', () => {
    it('should add a car to the cart', () => {
      const { result } = renderHook(() => useBookingCartStore())

      const carRental = {
        vehicleId: 'CAR123',
        ...mockCar,
        pricing: {
          totalPrice: 250,
          currency: 'USD',
        },
      }

      act(() => {
        result.current.addCar(carRental as any)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].type).toBe('car')
      expect(result.current.getCars()).toHaveLength(1)
    })
  })

  describe('removeItem', () => {
    it('should remove an item from the cart', () => {
      const { result } = renderHook(() => useBookingCartStore())

      act(() => {
        result.current.addFlight(mockFlightOffer as any)
      })

      const itemId = result.current.items[0].id

      act(() => {
        result.current.removeItem(itemId)
      })

      expect(result.current.items).toHaveLength(0)
    })
  })

  describe('clearCart', () => {
    it('should clear all items from the cart', () => {
      const { result } = renderHook(() => useBookingCartStore())

      act(() => {
        result.current.addFlight(mockFlightOffer as any)
        result.current.addHotel({
          hotelId: 'HOTEL123',
          ...mockHotel,
          pricing: { totalPrice: 500, currency: 'USD' },
        } as any)
      })

      expect(result.current.items).toHaveLength(2)

      act(() => {
        result.current.clearCart()
      })

      expect(result.current.items).toHaveLength(0)
      expect(result.current.promoCode).toBeNull()
      expect(result.current.discount).toBe(0)
    })
  })

  describe('promo codes and discounts', () => {
    it('should set a promo code', () => {
      const { result } = renderHook(() => useBookingCartStore())

      act(() => {
        result.current.setPromoCode('SUMMER2025')
      })

      expect(result.current.promoCode).toBe('SUMMER2025')
    })

    it('should apply a discount', () => {
      const { result } = renderHook(() => useBookingCartStore())

      act(() => {
        result.current.applyDiscount(50)
      })

      expect(result.current.discount).toBe(50)
    })

    it('should clear promo code and discount', () => {
      const { result } = renderHook(() => useBookingCartStore())

      act(() => {
        result.current.setPromoCode('SUMMER2025')
        result.current.applyDiscount(50)
      })

      act(() => {
        result.current.clearPromoCode()
      })

      expect(result.current.promoCode).toBeNull()
      expect(result.current.discount).toBe(0)
    })
  })

  describe('getters', () => {
    it('should get total price of all items', () => {
      const { result } = renderHook(() => useBookingCartStore())

      act(() => {
        result.current.addFlight(mockFlightOffer as any)
        result.current.addHotel({
          hotelId: 'HOTEL123',
          pricing: { totalPrice: 500, currency: 'USD' },
        } as any)
        result.current.addCar({
          vehicleId: 'CAR123',
          pricing: { totalPrice: 250, currency: 'USD' },
        } as any)
      })

      const total = result.current.getTotalPrice()
      expect(total).toBe(1100) // 350 + 500 + 250
    })

    it('should get flights only', () => {
      const { result } = renderHook(() => useBookingCartStore())

      act(() => {
        result.current.addFlight(mockFlightOffer as any)
        result.current.addHotel({
          hotelId: 'HOTEL123',
          pricing: { totalPrice: 500, currency: 'USD' },
        } as any)
      })

      const flights = result.current.getFlights()
      expect(flights).toHaveLength(1)
      expect(flights[0].type).toBe('flight')
    })

    it('should calculate total with discount', () => {
      const { result } = renderHook(() => useBookingCartStore())

      act(() => {
        result.current.addFlight(mockFlightOffer as any)
        result.current.applyDiscount(50)
      })

      const totalWithDiscount = result.current.getTotalWithDiscount()
      expect(totalWithDiscount).toBe(300) // 350 - 50
    })

    it('should not return negative total with large discount', () => {
      const { result } = renderHook(() => useBookingCartStore())

      act(() => {
        result.current.addFlight(mockFlightOffer as any)
        result.current.applyDiscount(1000)
      })

      const totalWithDiscount = result.current.getTotalWithDiscount()
      expect(totalWithDiscount).toBe(0)
    })

    it('should check if cart has items', () => {
      const { result } = renderHook(() => useBookingCartStore())

      expect(result.current.hasItems()).toBe(false)

      act(() => {
        result.current.addFlight(mockFlightOffer as any)
      })

      expect(result.current.hasItems()).toBe(true)
    })
  })

  describe('mixed cart items', () => {
    it('should handle multiple types of bookings in cart', () => {
      const { result } = renderHook(() => useBookingCartStore())

      act(() => {
        result.current.addFlight(mockFlightOffer as any)
        result.current.addHotel({
          hotelId: 'HOTEL123',
          pricing: { totalPrice: 500, currency: 'USD' },
        } as any)
        result.current.addCar({
          vehicleId: 'CAR123',
          pricing: { totalPrice: 250, currency: 'USD' },
        } as any)
      })

      expect(result.current.getItemCount()).toBe(3)
      expect(result.current.getFlights()).toHaveLength(1)
      expect(result.current.getHotels()).toHaveLength(1)
      expect(result.current.getCars()).toHaveLength(1)
    })
  })
})
