# Quick Start Guide - Hotels & Car Rentals

**Version**: 1.0
**Last Updated**: 2025-11-17
**Status**: Production Ready

---

## 🚀 Getting Started

### For End Users

#### Booking a Hotel

1. **Search for Hotels**
   - Navigate to `/hotels`
   - Enter location (city name or code)
   - Select check-in and check-out dates
   - Specify number of adults, children, and rooms
   - Click "Search Hotels"

2. **Browse Results**
   - View hotel cards with images, ratings, and prices
   - Use filters: Rating (1-5 stars), Price Range
   - Sort by: Price (low/high), Rating, Name
   - Click "View Details" on any hotel

3. **Select Room & Book**
   - Review hotel details and amenities
   - Browse available rooms
   - Click on a room to select it
   - Fill in guest information (at least main guest)
   - Click "Add to Cart"

4. **Complete Booking**
   - Review cart at `/cart`
   - Apply promo code if available (try "SAVE10" for 10% off)
   - Click "Proceed to Checkout"
   - Enter payment details (Stripe Elements)
   - Click "Pay" to complete
   - Receive confirmation email

#### Booking a Car Rental

1. **Search for Cars**
   - Navigate to `/cars`
   - Enter pickup and dropoff locations
   - Select pickup and dropoff dates/times
   - Specify driver age
   - Click "Search Cars"

2. **Browse Results**
   - View car cards with images, specs, and prices
   - Use filters: Category, Transmission, Price Range
   - Sort by: Price (low/high), Vendor, Category
   - Click "View Details" on any car

3. **Configure Rental & Book**
   - Review vehicle details and specifications
   - Fill in driver information (name, license, etc.)
   - Select insurance coverage (optional)
   - Add additional services (GPS, child seat, etc.)
   - Click "Add to Cart"

4. **Complete Booking**
   - Same checkout process as hotels
   - Receive confirmation email with rental details

#### Multi-Booking (Flights + Hotels + Cars)

1. **Add Multiple Items to Cart**
   - Book a flight (existing functionality)
   - Add a hotel
   - Add a car rental
   - All items appear in unified cart

2. **Single Checkout**
   - Review all items in cart
   - Apply promo code (applies to total)
   - Proceed to checkout
   - Pay once for all bookings
   - Receive separate confirmation emails for each booking type

---

## 🔧 For Developers

### Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create `.env.local` with:
   ```env
   # Existing variables...
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   RESEND_API_KEY=re_...
   EMAIL_FROM=onboarding@yourdomain.com
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test Stripe Webhooks Locally**
   ```bash
   # Install Stripe CLI
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe

   # Use webhook secret from output in .env.local
   ```

### API Endpoints

#### Hotel Search
```typescript
POST /api/hotel-search
Body: {
  location?: string,
  cityCode?: string,
  checkInDate: string,
  checkOutDate: string,
  adults: number,
  children?: number,
  rooms?: number
}
Response: { data: Hotel[] }
```

#### Car Search
```typescript
POST /api/car-search
Body: {
  pickupLocation: string,
  dropoffLocation?: string,
  pickupDate: string,
  dropoffDate: string,
  driverAge?: number
}
Response: { data: Vehicle[] }
```

#### Create Multi-Booking Payment
```typescript
POST /api/create-multi-payment-intent
Body: {
  items: Array<{
    type: "flight" | "hotel" | "car",
    id: string,
    data: any
  }>,
  currency: string
}
Response: {
  clientSecret: string,
  groupId: string,
  totalAmount: number
}
```

#### Get Booking Group
```typescript
GET /api/bookings/group/[groupId]
Response: {
  groupId: string,
  bookings: Array<{
    type: string,
    confirmationNumber: string,
    details: any
  }>,
  totalAmount: number
}
```

### State Management

#### Hotel Store
```typescript
import useHotelStore from '@/lib/store/use-hotel-store';

const {
  selectedHotel,
  checkInDate,
  checkOutDate,
  setSelectedHotel,
  clearHotelData
} = useHotelStore();
```

#### Car Store
```typescript
import useCarStore from '@/lib/store/use-car-store';

const {
  selectedVehicle,
  pickupDate,
  dropoffDate,
  setSelectedVehicle,
  clearCarData
} = useCarStore();
```

#### Booking Cart Store
```typescript
import useBookingCartStore from '@/lib/store/use-booking-cart-store';

const {
  items,
  addFlight,
  addHotel,
  addCar,
  removeItem,
  clearCart,
  getTotalPrice
} = useBookingCartStore();
```

### Adding New Features

#### Add New Filter to Hotels
1. Update `HotelsStateWrapper.tsx`:
   ```typescript
   const [amenityFilter, setAmenityFilter] = useState<string>('');

   const filteredHotels = hotels.filter(hotel => {
     // Add your filter logic
     if (amenityFilter && !hotel.amenities.includes(amenityFilter)) {
       return false;
     }
     return true;
   });
   ```

2. Add UI in filter sidebar
3. Test with various data

#### Add New Payment Method
1. Update Stripe configuration
2. Modify `checkout-form.tsx`
3. Test payment flow
4. Update webhook handler if needed

---

## 🧪 Testing

### Manual Testing Checklist

**Hotels**:
- [ ] Search with valid city code
- [ ] Filter by rating (1-5 stars)
- [ ] Filter by price range
- [ ] Sort by price, rating, name
- [ ] View hotel details
- [ ] Select room
- [ ] Fill guest information
- [ ] Add to cart
- [ ] Complete checkout
- [ ] Verify email received

**Cars**:
- [ ] Search with valid location
- [ ] Filter by category
- [ ] Filter by transmission
- [ ] Sort by price, vendor
- [ ] View car details
- [ ] Fill driver information
- [ ] Select insurance
- [ ] Add services
- [ ] Add to cart
- [ ] Complete checkout
- [ ] Verify email received

**Cart & Checkout**:
- [ ] Add multiple items
- [ ] Remove item from cart
- [ ] Apply promo code ("SAVE10")
- [ ] Clear cart
- [ ] Checkout with single item
- [ ] Checkout with multiple items
- [ ] Test payment failure
- [ ] Test payment success
- [ ] Verify confirmation page
- [ ] Verify emails sent

### Test Cards (Stripe Test Mode)

**Success**:
- `4242 4242 4242 4242` - Any CVV, future expiry

**Requires Authentication**:
- `4000 0025 0000 3155` - Follow 3D Secure prompts

**Decline**:
- `4000 0000 0000 9995` - Insufficient funds

---

## 📧 Email Templates

### Hotel Confirmation Email
Sent automatically after successful payment.

**Contains**:
- Confirmation number
- Hotel name and address
- Check-in/check-out dates
- Number of nights
- Room type
- Guest names
- Total amount paid
- Important instructions

### Car Rental Confirmation Email
Sent automatically after successful payment.

**Contains**:
- Confirmation number
- Vehicle make and model
- Pickup/dropoff locations and times
- Rental duration
- Driver name
- Insurance coverage
- Total amount paid
- Important instructions

---

## 🔒 Security Best Practices

### For Developers

1. **Never commit sensitive keys**
   - Use `.env.local` for development
   - Use environment variables in production
   - Keep `.env.local` in `.gitignore`

2. **Validate all inputs**
   - Server-side validation with Zod
   - Client-side validation for UX
   - Sanitize user inputs

3. **Secure API endpoints**
   - Require authentication
   - Check user permissions
   - Rate limit requests

4. **Payment security**
   - Never store card details
   - Use Stripe.js for PCI compliance
   - Verify webhook signatures
   - Use HTTPS in production

### For Users

1. **Strong passwords**
   - Minimum 8 characters
   - Mix of letters, numbers, symbols

2. **Verify emails**
   - Check sender address
   - Look for confirmation numbers
   - Report suspicious emails

3. **Secure devices**
   - Keep software updated
   - Use secure networks
   - Log out after booking

---

## 🐛 Troubleshooting

### Common Issues

#### "Hotel not found" error
**Problem**: Navigated directly to hotel details without searching
**Solution**: Search for hotels first, then click "View Details"

#### Payment fails
**Problem**: Various payment issues
**Solutions**:
- Check card details are correct
- Ensure card has sufficient funds
- Try different card
- Check with bank if card is blocked

#### No email received
**Problem**: Confirmation email not received
**Solutions**:
- Check spam/junk folder
- Verify email address in account settings
- Wait a few minutes (emails can be delayed)
- Contact support with confirmation number

#### Cart is empty after checkout
**Problem**: Cart cleared but payment failed
**Solution**: Cart clears on success page load. If payment failed, items should still be in cart. Refresh `/cart` page.

#### State expired error
**Problem**: 20-minute selection expiry
**Solution**: Selections expire after 20 minutes for fairness. Search and select again.

### Developer Issues

#### TypeScript errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

#### Stripe webhook not working
```bash
# Verify webhook secret
stripe listen --print-secret

# Check endpoint URL in Stripe dashboard
# Ensure signature verification is correct
```

#### Database connection failed
```bash
# Verify MongoDB connection string
# Check network/firewall settings
# Ensure database is running
```

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

**Booking Funnel**:
1. Search attempts
2. Results viewed
3. Details page views
4. Add to cart clicks
5. Checkout initiated
6. Payment completed

**Performance**:
- API response times
- Page load times
- Error rates
- Webhook processing time

**Business**:
- Conversion rate by booking type
- Average cart value
- Promo code usage
- Cancellation rate

### Recommended Tools

- **Error Tracking**: Sentry, LogRocket
- **Analytics**: Google Analytics, Mixpanel
- **Performance**: Vercel Analytics, New Relic
- **Monitoring**: Datadog, Better Uptime

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All TypeScript errors resolved
- [ ] Environment variables configured
- [ ] Stripe production keys set
- [ ] Webhook endpoint configured
- [ ] Email domain verified (Resend)
- [ ] Database backup created
- [ ] SSL certificate installed
- [ ] Test payment flow works
- [ ] Test email delivery works

### Production Environment Variables

```env
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
```

### Post-Deployment

- [ ] Test search functionality
- [ ] Test booking flow
- [ ] Test payment processing
- [ ] Test email delivery
- [ ] Monitor error logs
- [ ] Set up alerts
- [ ] Document known issues
- [ ] Train support team

---

## 📞 Support

### For Users
- **Help Center**: `/help` (if implemented)
- **Email**: support@yourdomain.com
- **Live Chat**: (if implemented)

### For Developers
- **Documentation**: This guide + inline code comments
- **API Reference**: See API Endpoints section above
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

## 🎓 Additional Resources

### Documentation
- [Stripe Documentation](https://stripe.com/docs)
- [Amadeus API Docs](https://developers.amadeus.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Resend Docs](https://resend.com/docs)

### Code Examples
- Hotel search: `app/(root)/hotels/page.tsx`
- Car search: `app/(root)/cars/page.tsx`
- Checkout: `app/(root)/cart/checkout/page.tsx`
- Webhook: `app/api/webhooks/stripe/route.ts`

---

**Last Updated**: 2025-11-17
**Version**: 1.0
**Status**: Production Ready ✅
