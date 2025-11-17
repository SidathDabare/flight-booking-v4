/**
 * Mock database utilities for testing
 */

import { jest } from '@jest/globals'

// Mock Mongoose connection
export const mockConnectToDatabase = jest.fn().mockResolvedValue(true)

// Mock User model
export const mockUserModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
}

// Mock Order model
export const mockOrderModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
}

// Mock Message model
export const mockMessageModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
}

// Helper to reset all mocks
export const resetDatabaseMocks = () => {
  mockConnectToDatabase.mockClear()
  Object.values(mockUserModel).forEach(fn => fn.mockClear())
  Object.values(mockOrderModel).forEach(fn => fn.mockClear())
  Object.values(mockMessageModel).forEach(fn => fn.mockClear())
}

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  name: 'Test User',
  email: 'test@example.com',
  password: '$2a$12$hashedpassword',
  role: 'client',
  isApproved: true,
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockOrder = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439012',
  data: {
    type: 'flight-order',
    id: 'AMADEUS123',
    queuingOfficeId: 'NCE4D31SB',
    flightOffers: [],
    travelers: [],
  },
  metadata: {
    amadeusBookingId: 'AMADEUS123',
    userId: '507f1f77bcf86cd799439011',
    customerEmail: 'test@example.com',
    customerName: 'Test User',
    bookingDate: '2025-11-17',
  },
  status: 'pending',
  ticketSent: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockMessage = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439013',
  senderId: '507f1f77bcf86cd799439011',
  recipientId: null,
  subject: 'Test Message',
  content: 'This is a test message',
  status: 'open',
  priority: 'medium',
  isRead: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})
