import { hotelSearchSchema, hotelGuestSchema, hotelBookingSchema } from '@/lib/zod/hotel-search'
import { z } from 'zod'

describe('hotelSearchSchema', () => {
  describe('valid inputs', () => {
    it('should validate a complete search with location', () => {
      const input = {
        location: 'New York',
        checkInDate: new Date('2025-12-20'),
        checkOutDate: new Date('2025-12-25'),
        adults: 2,
        children: 0,
        rooms: 1,
        currency: 'USD',
        limit: 50,
        radius: 50,
      }

      const result = hotelSearchSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('should validate search with city code', () => {
      const input = {
        cityCode: 'NYC',
        checkInDate: '2025-12-20',
        checkOutDate: '2025-12-25',
        adults: 1,
      }

      const result = hotelSearchSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('should validate search with coordinates', () => {
      const input = {
        latitude: 40.7128,
        longitude: -74.006,
        checkInDate: new Date('2025-12-20'),
        checkOutDate: new Date('2025-12-25'),
        adults: 2,
      }

      const result = hotelSearchSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('should apply default values', () => {
      const input = {
        location: 'Paris',
        checkInDate: '2025-12-20',
        checkOutDate: '2025-12-25',
      }

      const result = hotelSearchSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.adults).toBe(1)
        expect(result.data.children).toBe(0)
        expect(result.data.rooms).toBe(1)
        expect(result.data.radius).toBe(50)
        expect(result.data.currency).toBe('USD')
        expect(result.data.limit).toBe(50)
      }
    })

    it('should validate search with price range', () => {
      const input = {
        location: 'London',
        checkInDate: '2025-12-20',
        checkOutDate: '2025-12-25',
        minPrice: 100,
        maxPrice: 500,
        adults: 2,
      }

      const result = hotelSearchSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('should validate search with rating filter', () => {
      const input = {
        location: 'Tokyo',
        checkInDate: '2025-12-20',
        checkOutDate: '2025-12-25',
        rating: [4, 5],
        adults: 1,
      }

      const result = hotelSearchSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('should validate search with amenities', () => {
      const input = {
        location: 'Rome',
        checkInDate: '2025-12-20',
        checkOutDate: '2025-12-25',
        amenities: ['WiFi', 'Pool', 'Gym'],
        adults: 2,
      }

      const result = hotelSearchSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject when no location parameter is provided', () => {
      const input = {
        checkInDate: '2025-12-20',
        checkOutDate: '2025-12-25',
        adults: 2,
      }

      const result = hotelSearchSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Location, city code, or coordinates are required')
      }
    })

    it('should reject when check-out is before check-in', () => {
      const input = {
        location: 'Paris',
        checkInDate: '2025-12-25',
        checkOutDate: '2025-12-20',
        adults: 2,
      }

      const result = hotelSearchSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Check-out date must be after check-in date')
      }
    })

    it('should reject when max price is less than min price', () => {
      const input = {
        location: 'Berlin',
        checkInDate: '2025-12-20',
        checkOutDate: '2025-12-25',
        minPrice: 500,
        maxPrice: 100,
        adults: 2,
      }

      const result = hotelSearchSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Maximum price must be greater than minimum price')
      }
    })

    it('should reject invalid city code length', () => {
      const input = {
        cityCode: 'NY', // Too short
        checkInDate: '2025-12-20',
        checkOutDate: '2025-12-25',
      }

      const result = hotelSearchSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should reject invalid latitude', () => {
      const input = {
        latitude: 100, // Invalid (> 90)
        longitude: -74.006,
        checkInDate: '2025-12-20',
        checkOutDate: '2025-12-25',
      }

      const result = hotelSearchSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should reject invalid longitude', () => {
      const input = {
        latitude: 40.7128,
        longitude: 200, // Invalid (> 180)
        checkInDate: '2025-12-20',
        checkOutDate: '2025-12-25',
      }

      const result = hotelSearchSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('should reject adults count exceeding limit', () => {
      const input = {
        location: 'Dubai',
        checkInDate: '2025-12-20',
        checkOutDate: '2025-12-25',
        adults: 15, // Exceeds max of 10
      }

      const result = hotelSearchSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })
})

describe('hotelGuestSchema', () => {
  it('should validate a complete guest', () => {
    const guest = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      isMainGuest: true,
    }

    const result = hotelGuestSchema.safeParse(guest)
    expect(result.success).toBe(true)
  })

  it('should validate a minimal guest', () => {
    const guest = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    }

    const result = hotelGuestSchema.safeParse(guest)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isMainGuest).toBe(false) // Default value
    }
  })

  it('should reject missing first name', () => {
    const guest = {
      lastName: 'Doe',
      email: 'john@example.com',
    }

    const result = hotelGuestSchema.safeParse(guest)
    expect(result.success).toBe(false)
  })

  it('should reject invalid email', () => {
    const guest = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email',
    }

    const result = hotelGuestSchema.safeParse(guest)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Valid email is required')
    }
  })
})

describe('hotelBookingSchema', () => {
  it('should validate a complete booking', () => {
    const booking = {
      hotelId: 'HOTEL123',
      roomId: 'ROOM456',
      checkInDate: new Date('2025-12-20'),
      checkOutDate: new Date('2025-12-25'),
      numberOfNights: 5,
      numberOfGuests: 2,
      numberOfRooms: 1,
      guests: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          isMainGuest: true,
        },
        {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          isMainGuest: false,
        },
      ],
      specialRequests: 'Late check-in please',
    }

    const result = hotelBookingSchema.safeParse(booking)
    expect(result.success).toBe(true)
  })

  it('should reject booking without guests', () => {
    const booking = {
      hotelId: 'HOTEL123',
      roomId: 'ROOM456',
      checkInDate: '2025-12-20',
      checkOutDate: '2025-12-25',
      numberOfNights: 5,
      numberOfGuests: 2,
      guests: [],
    }

    const result = hotelBookingSchema.safeParse(booking)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('At least one guest is required')
    }
  })

  it('should reject booking without hotel ID', () => {
    const booking = {
      hotelId: '',
      roomId: 'ROOM456',
      checkInDate: '2025-12-20',
      checkOutDate: '2025-12-25',
      numberOfNights: 5,
      numberOfGuests: 1,
      guests: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      ],
    }

    const result = hotelBookingSchema.safeParse(booking)
    expect(result.success).toBe(false)
  })

  it('should reject special requests exceeding character limit', () => {
    const booking = {
      hotelId: 'HOTEL123',
      roomId: 'ROOM456',
      checkInDate: '2025-12-20',
      checkOutDate: '2025-12-25',
      numberOfNights: 5,
      numberOfGuests: 1,
      guests: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      ],
      specialRequests: 'a'.repeat(501), // Exceeds 500 character limit
    }

    const result = hotelBookingSchema.safeParse(booking)
    expect(result.success).toBe(false)
  })
})
