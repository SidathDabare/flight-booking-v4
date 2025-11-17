# Testing Guide

This guide covers the Jest testing infrastructure set up for the flight booking application.

## Setup

Jest has been configured for testing with the following dependencies:

- **jest** - Testing framework
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers for DOM
- **@testing-library/user-event** - User interaction simulation
- **jest-environment-jsdom** - DOM environment for testing

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (for continuous integration)
npm run test:ci
```

## Test Structure

Tests are organized in the `__tests__` directory:

```
__tests__/
├── store/              # Zustand store tests
│   └── use-booking-cart-store.test.ts
├── zod/                # Zod schema validation tests
│   └── hotel-search.test.ts
└── utils/              # Testing utilities
    ├── mock-data.tsx   # Mock data for tests
    └── test-helpers.tsx # Custom render functions
```

## What's Tested

### 1. Zustand Stores

Tests for state management stores, including:
- Adding/removing items from cart
- Cart calculations (totals, discounts)
- Promo code functionality
- State persistence

**Example:** `__tests__/store/use-booking-cart-store.test.ts`

### 2. Zod Schemas

Tests for input validation schemas:
- Valid input acceptance
- Invalid input rejection
- Default value application
- Custom refinement logic (date comparisons, price ranges)

**Example:** `__tests__/zod/hotel-search.test.ts`

## Writing Tests

### Testing a Zustand Store

```typescript
import { renderHook, act } from '@testing-library/react'
import useMyStore from '@/lib/store/use-my-store'

describe('useMyStore', () => {
  it('should update state correctly', () => {
    const { result } = renderHook(() => useMyStore())

    act(() => {
      result.current.updateValue('new value')
    })

    expect(result.current.value).toBe('new value')
  })
})
```

### Testing a Zod Schema

```typescript
import { mySchema } from '@/lib/zod/my-schema'

describe('mySchema', () => {
  it('should validate correct input', () => {
    const input = { name: 'John', age: 30 }
    const result = mySchema.safeParse(input)

    expect(result.success).toBe(true)
  })

  it('should reject invalid input', () => {
    const input = { name: '', age: -1 }
    const result = mySchema.safeParse(input)

    expect(result.success).toBe(false)
  })
})
```

### Testing React Components

```typescript
import { render, screen } from '../utils/test-helpers'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />)

    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

## Mock Data

Reusable mock data is available in `__tests__/utils/mock-data.tsx`:

- `mockFlightOffer` - Sample flight offer
- `mockHotel` - Sample hotel data
- `mockCar` - Sample car rental data
- `mockUser` - Sample user object
- `mockSession` - Sample auth session
- `mockBooking` - Sample booking data

## Configuration

### jest.config.ts

Key configuration options:
- Uses Next.js Jest configuration
- jsdom test environment for DOM testing
- Module path aliases (`@/...`)
- Coverage collection from app, lib, and components folders

### jest.setup.ts

Global test setup including:
- Testing Library matchers
- Mock environment variables
- Mock Next.js router
- Mock next-auth

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what's being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
3. **Mock External Dependencies**: Mock APIs, databases, and external services
4. **Test User Behavior**: Focus on testing from the user's perspective
5. **Keep Tests Isolated**: Each test should be independent and not rely on others
6. **Use Mock Data**: Leverage the centralized mock data for consistency

## Coverage

Run `npm run test:coverage` to see coverage reports:

- **Statements**: Percentage of statements executed
- **Branches**: Percentage of conditional branches executed
- **Functions**: Percentage of functions called
- **Lines**: Percentage of lines executed

Coverage reports are generated in the `coverage/` directory.

## Next Steps

Consider adding tests for:

1. **API Routes** - Test Next.js API endpoints (requires additional setup for edge runtime)
2. **Server Actions** - Test flight search, hotel search, booking actions
3. **React Components** - Test UI components and user interactions
4. **Email Templates** - Test email rendering
5. **Payment Integration** - Test Stripe payment flows (with mocks)
6. **Database Models** - Test Mongoose model validations

## Troubleshooting

### Tests timing out
Increase the timeout in jest.config.ts or use `jest.setTimeout()` in specific tests.

### Module not found errors
Check the module path aliases in jest.config.ts match your tsconfig.json.

### Tests failing in CI
Use the `test:ci` script which is optimized for continuous integration environments.

### Mock issues
Ensure mocks are properly cleared between tests using `beforeEach(() => jest.clearAllMocks())`.
