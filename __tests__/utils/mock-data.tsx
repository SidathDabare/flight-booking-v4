// Mock data for testing

export const mockFlightOffer = {
  id: '1',
  type: 'flight-offer',
  source: 'GDS',
  instantTicketingRequired: false,
  nonHomogeneous: false,
  oneWay: false,
  lastTicketingDate: '2025-12-31',
  numberOfBookableSeats: 9,
  itineraries: [
    {
      duration: 'PT5H30M',
      segments: [
        {
          departure: {
            iataCode: 'JFK',
            terminal: '4',
            at: '2025-12-20T10:00:00',
          },
          arrival: {
            iataCode: 'LAX',
            terminal: '5',
            at: '2025-12-20T13:30:00',
          },
          carrierCode: 'AA',
          number: '123',
          aircraft: {
            code: '738',
          },
          operating: {
            carrierCode: 'AA',
          },
          duration: 'PT5H30M',
          id: '1',
          numberOfStops: 0,
          blacklistedInEU: false,
        },
      ],
    },
  ],
  price: {
    currency: 'USD',
    total: '350.00',
    base: '300.00',
    fees: [
      {
        amount: '50.00',
        type: 'TICKETING',
      },
    ],
    grandTotal: '350.00',
  },
  pricingOptions: {
    fareType: ['PUBLISHED'],
    includedCheckedBagsOnly: true,
  },
  validatingAirlineCodes: ['AA'],
  travelerPricings: [
    {
      travelerId: '1',
      fareOption: 'STANDARD',
      travelerType: 'ADULT',
      price: {
        currency: 'USD',
        total: '350.00',
        base: '300.00',
      },
      fareDetailsBySegment: [
        {
          segmentId: '1',
          cabin: 'ECONOMY',
          fareBasis: 'KHFN7Z4',
          class: 'K',
          includedCheckedBags: {
            quantity: 1,
          },
        },
      ],
    },
  ],
}

export const mockHotel = {
  id: 'HOTEL123',
  name: 'Grand Hotel',
  rating: 4,
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postalCode: '10001',
  },
  contact: {
    phone: '+1-555-0123',
    email: 'info@grandhotel.com',
  },
  amenities: ['WiFi', 'Pool', 'Restaurant', 'Gym'],
  images: ['https://example.com/hotel1.jpg'],
  description: 'Luxurious hotel in the heart of the city',
  available: true,
  offers: [
    {
      id: 'OFFER1',
      checkInDate: '2025-12-20',
      checkOutDate: '2025-12-25',
      roomType: 'Deluxe Suite',
      guests: {
        adults: 2,
      },
      price: {
        currency: 'USD',
        total: 500,
        base: 450,
        taxes: 50,
      },
      boardType: 'ROOM_ONLY',
      policies: {
        cancellation: {
          type: 'FULL_REFUND',
          deadline: '2025-12-18',
        },
      },
    },
  ],
}

export const mockCar = {
  id: 'CAR123',
  category: 'ECONOMY',
  type: 'Sedan',
  make: 'Toyota',
  model: 'Camry',
  provider: 'Hertz',
  acrissCode: 'ECAR',
  images: ['https://example.com/car1.jpg'],
  amenities: ['Air Conditioning', 'Automatic', 'GPS'],
  seats: 5,
  doors: 4,
  transmission: 'AUTOMATIC',
  fuelType: 'PETROL',
  pickUpLocation: {
    code: 'JFK',
    name: 'JFK Airport',
    address: '123 Airport Rd, Queens, NY',
  },
  dropOffLocation: {
    code: 'JFK',
    name: 'JFK Airport',
    address: '123 Airport Rd, Queens, NY',
  },
  pickUpDateTime: '2025-12-20T10:00:00',
  dropOffDateTime: '2025-12-25T10:00:00',
  price: {
    currency: 'USD',
    total: 250,
    base: 200,
    taxes: 50,
  },
  available: true,
}

export const mockUser = {
  id: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
}

export const mockSession = {
  user: mockUser,
  expires: '2025-12-31',
}

export const mockBooking = {
  _id: 'booking123',
  userId: 'user123',
  type: 'flight',
  status: 'confirmed',
  bookingReference: 'ABC123',
  flightDetails: mockFlightOffer,
  travelers: [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
      email: 'john@example.com',
      phone: '+1-555-0123',
      documentType: 'PASSPORT',
      documentNumber: 'AB1234567',
      documentExpiryDate: '2030-01-01',
      documentIssuingCountry: 'US',
      nationality: 'US',
    },
  ],
  paymentStatus: 'paid',
  totalAmount: 350,
  currency: 'USD',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}
