/**
 * Mock Stripe utilities for testing
 */

import { jest } from '@jest/globals'

export const mockStripe = {
  prices: {
    create: jest.fn().mockResolvedValue({
      id: 'price_test123',
      object: 'price',
      active: true,
      currency: 'usd',
      unit_amount: 50000,
    }),
  },
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: 'cs_test123',
        object: 'checkout.session',
        payment_status: 'unpaid',
        url: 'https://checkout.stripe.com/c/pay/cs_test123',
        success_url: 'http://localhost:3000/payment-success',
        cancel_url: 'http://localhost:3000/booking',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'cs_test123',
        object: 'checkout.session',
        payment_status: 'paid',
      }),
    },
  },
  paymentIntents: {
    create: jest.fn().mockResolvedValue({
      id: 'pi_test123',
      object: 'payment_intent',
      amount: 50000,
      currency: 'usd',
      status: 'requires_payment_method',
      client_secret: 'pi_test123_secret',
    }),
    retrieve: jest.fn().mockResolvedValue({
      id: 'pi_test123',
      object: 'payment_intent',
      amount: 50000,
      currency: 'usd',
      status: 'succeeded',
    }),
    confirm: jest.fn().mockResolvedValue({
      id: 'pi_test123',
      object: 'payment_intent',
      status: 'succeeded',
    }),
  },
  webhooks: {
    constructEvent: jest.fn().mockReturnValue({
      id: 'evt_test123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test123',
          payment_status: 'paid',
          metadata: {
            amadeusBookingId: 'AMADEUS123',
            userId: '507f1f77bcf86cd799439011',
          },
        },
      },
    }),
  },
}

export const resetStripeMocks = () => {
  Object.values(mockStripe).forEach(category => {
    if (typeof category === 'object') {
      Object.values(category).forEach(fn => {
        if (typeof fn === 'function' && 'mockClear' in fn) {
          fn.mockClear()
        }
      })
    }
  })
}

// Mock Stripe error
export class StripeError extends Error {
  type: string
  code?: string

  constructor(message: string, type: string, code?: string) {
    super(message)
    this.name = 'StripeError'
    this.type = type
    this.code = code
  }
}

export const mockStripeCardError = new StripeError(
  'Your card was declined',
  'card_error',
  'card_declined'
)

export const mockStripeInvalidRequestError = new StripeError(
  'Invalid request',
  'invalid_request_error'
)
