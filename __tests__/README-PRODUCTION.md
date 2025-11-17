# Production-Level Test Suite

This test suite provides comprehensive coverage for the flight booking application's critical features.

## Test Coverage Overview

### ✅ Completed Test Suites

1. **Authentication Tests** (`__tests__/auth/`)
   - User registration (client & agent)
   - Email verification flow
   - Password hashing security
   - Role-based access control
   - Error handling

2. **Payment Processing Tests** (`__tests__/payment/`)
   - Stripe checkout session creation
   - Price calculations and currency conversion
   - Payment metadata handling
   - Error handling (card decline, API errors)
   - CORS configuration

3. **Email Service Tests** (`__tests__/email/`)
   - Verification emails
   - Password reset emails
   - Admin notifications
   - Agent approval/rejection notifications
   - Message notifications
   - Error resilience

4. **Database Model Tests** (`__tests__/models/`)
   - User CRUD operations
   - Email verification tokens
   - Password reset tokens
   - Role management
   - Security validations

5. **Integration Tests** (`__tests__/integration/`)
   - Complete booking flow (registration → booking → payment)
   - Error scenarios
   - Agent approval workflow
   - Multiple bookings

6. **Utility Tests** (`__tests__/lib/`)
   - String formatting
   - Currency conversion
   - Password strength validation
   - Password generation

7. **Component Tests** (`__tests__/components/`)
   - Button component with all variants
   - User interactions
   - Accessibility

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- register.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="registration"
```

## Test Statistics

- **Total Test Suites**: 8+
- **Total Tests**: 100+
- **Code Coverage Target**: 80%+

## Mock System

The test suite uses a comprehensive mock system located in `__tests__/mocks/`:

- `database.ts` - MongoDB/Mongoose mocks
- `stripe.ts` - Stripe API mocks
- `email.ts` - Resend email service mocks

## Known Issues & Limitations

### Next.js API Route Testing

Testing Next.js 15 App Router API routes directly requires special configuration due to:
- Web API polyfills (Request, Response, Headers)
- Next.js runtime dependencies
- Server-only code

**Current Approach**: Tests focus on business logic and integration flows rather than testing route handlers directly.

**Alternative Approaches**:
1. Use Playwright/Cypress for end-to-end API testing
2. Extract business logic to separate functions and test those
3. Use Next.js test utilities when available

### Recommended Next Steps

1. **Add E2E Tests** with Playwright or Cypress
   ```bash
   npm install --save-dev @playwright/test
   ```

2. **Increase Coverage** for:
   - Amadeus API integration
   - Socket.io message handlers
   - File upload functionality
   - PDF generation

3. **Add Performance Tests**
   - Load testing for checkout
   - Database query optimization
   - API response times

4. **Add Security Tests**
   - SQL injection prevention
   - XSS protection
   - CSRF token validation
   - Rate limiting

5. **CI/CD Integration**
   ```yaml
   # .github/workflows/test.yml
   name: Tests
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm ci
         - run: npm test
         - run: npm run test:coverage
   ```

## Production Checklist

- [x] Unit tests for utilities
- [x] Component tests with user interactions
- [x] Authentication flow tests
- [x] Payment processing tests
- [x] Email service tests
- [x] Database model tests
- [x] Integration tests for critical paths
- [ ] End-to-end tests
- [ ] Performance tests
- [ ] Security tests
- [ ] Accessibility tests (a11y)
- [ ] Visual regression tests

## Writing New Tests

### Example: Testing a New API Route

```typescript
import { describe, expect, test, jest, beforeEach } from '@jest/globals'
import { mockUserModel, resetDatabaseMocks } from '../mocks/database'

// Mock dependencies BEFORE importing the code
jest.mock('@/lib/db/mongoose', () => ({
  connectToDatabase: jest.fn(),
}))

jest.mock('@/lib/db/models/User', () => ({
  User: mockUserModel,
}))

describe('My API Route', () => {
  beforeEach(() => {
    resetDatabaseMocks()
  })

  test('should do something', async () => {
    // Arrange
    mockUserModel.findOne.mockResolvedValue({ /* mock data */ })

    // Act
    // ... your test logic

    // Assert
    expect(mockUserModel.findOne).toHaveBeenCalled()
  })
})
```

### Example: Testing Components

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from '@/components/MyComponent'

test('should handle user interaction', async () => {
  const user = userEvent.setup()
  const handleClick = jest.fn()

  render(<MyComponent onClick={handleClick} />)

  const button = screen.getByRole('button')
  await user.click(button)

  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

## Continuous Improvement

This test suite should evolve with your application:

1. **Add tests for new features** before deployment
2. **Update tests** when requirements change
3. **Monitor coverage** and maintain 80%+ on critical paths
4. **Review failed tests** in CI/CD before merging
5. **Refactor tests** to reduce duplication

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Next.js](https://nextjs.org/docs/app/building-your-application/testing/jest)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
