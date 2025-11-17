# Deployment Guide - Hotel & Car Rental Features

**Version**: 1.0
**Target Environment**: Production
**Prerequisites**: Completed development (Milestones 1-4)

---

## 🎯 Overview

This guide covers deploying the hotel and car rental features to production, including all necessary configuration, testing, and monitoring setup.

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [x] Zero TypeScript errors
- [x] All features tested locally
- [x] Code reviewed and approved
- [x] Documentation complete
- [ ] Performance tested
- [ ] Security audit completed

### Infrastructure
- [ ] Production database ready
- [ ] CDN configured for images
- [ ] SSL certificate installed
- [ ] DNS configured
- [ ] Monitoring tools set up
- [ ] Backup strategy implemented

### Third-Party Services
- [ ] Stripe production account approved
- [ ] Amadeus production API access
- [ ] Resend email domain verified
- [ ] MongoDB Atlas production cluster
- [ ] Error tracking service configured

---

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env.production` file with the following:

```env
# Application
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/production-db?retryWrites=true&w=majority

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe (Production Keys)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_CURRENCY=USD

# Amadeus (Production Keys)
AMADEUS_CLIENT_ID=your-production-client-id
AMADEUS_CLIENT_SECRET=your-production-client-secret
AMADEUS_API_URL=https://api.amadeus.com

# Email (Production)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# Cloudinary (if using)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Monitoring (Optional)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Generate Secrets

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# Or use this online tool:
# https://generate-secret.vercel.app/32
```

---

## 🚀 Deployment Steps

### 1. Prepare Production Database

#### MongoDB Atlas Setup

1. **Create Production Cluster**
   ```
   - Log in to MongoDB Atlas
   - Create new cluster (M10+ recommended)
   - Configure IP whitelist (0.0.0.0/0 for Vercel)
   - Create database user with strong password
   ```

2. **Initialize Collections**
   ```javascript
   // Collections will be auto-created, but you can pre-create:
   - users
   - orders
   - sessions
   - accounts
   ```

3. **Create Indexes**
   ```javascript
   // In MongoDB shell or Compass
   db.orders.createIndex({ "groupId": 1 })
   db.orders.createIndex({ "bookingType": 1 })
   db.orders.createIndex({ "metadata.userId": 1 })
   db.orders.createIndex({ "status": 1 })
   db.orders.createIndex({ "createdAt": -1 })
   ```

4. **Backup Configuration**
   ```
   - Enable automated backups (Atlas)
   - Set retention period (7+ days)
   - Test restore procedure
   ```

### 2. Configure Stripe Production

#### Stripe Dashboard Setup

1. **Activate Production Mode**
   ```
   - Complete business verification
   - Add bank account for payouts
   - Set business details
   - Configure branding
   ```

2. **Get Production Keys**
   ```
   Dashboard → Developers → API Keys
   - Publishable key: pk_live_...
   - Secret key: sk_live_...
   ```

3. **Configure Webhook**
   ```
   Dashboard → Developers → Webhooks → Add endpoint

   Endpoint URL: https://yourdomain.com/api/webhooks/stripe

   Events to send:
   ✓ payment_intent.succeeded
   ✓ checkout.session.completed

   Get webhook secret: whsec_...
   ```

4. **Payment Settings**
   ```
   Dashboard → Settings → Payment methods
   ✓ Enable cards
   ✓ Enable 3D Secure
   ✓ Set statement descriptor
   ```

5. **Test Webhook**
   ```bash
   # Use Stripe CLI
   stripe trigger payment_intent.succeeded

   # Check logs in dashboard
   ```

### 3. Configure Resend Email

#### Email Service Setup

1. **Verify Domain**
   ```
   Resend Dashboard → Domains → Add domain

   Add DNS records:
   - SPF record
   - DKIM record
   - MX record (optional)

   Wait for verification (up to 48 hours)
   ```

2. **Get API Key**
   ```
   Dashboard → API Keys → Create
   Name: Production
   Permissions: Full access

   Copy: re_xxxxxxxx
   ```

3. **Configure Sending Address**
   ```
   From: noreply@yourdomain.com
   Reply-To: support@yourdomain.com (optional)
   ```

4. **Test Email Delivery**
   ```bash
   # Send test email via API
   curl -X POST 'https://api.resend.com/emails' \
     -H 'Authorization: Bearer re_xxxxxxxx' \
     -H 'Content-Type: application/json' \
     -d '{
       "from": "noreply@yourdomain.com",
       "to": "test@example.com",
       "subject": "Test Email",
       "html": "<p>Test</p>"
     }'
   ```

### 4. Deploy to Vercel (Recommended)

#### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Connect Repository**
   ```bash
   vercel login
   vercel link
   ```

3. **Configure Project**
   ```
   Vercel Dashboard → Your Project → Settings

   Build & Development:
   - Framework Preset: Next.js
   - Build Command: npm run build
   - Output Directory: .next
   - Install Command: npm install

   Node.js Version: 20.x
   ```

4. **Add Environment Variables**
   ```
   Settings → Environment Variables

   Add all variables from .env.production
   Make sure to select "Production" environment
   ```

5. **Deploy**
   ```bash
   # Preview deployment
   vercel

   # Production deployment
   vercel --prod
   ```

6. **Verify Deployment**
   ```
   - Visit production URL
   - Test hotel search
   - Test car search
   - Test checkout flow
   - Verify webhooks working
   ```

### 5. Alternative: Deploy to AWS/DigitalOcean

#### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:20-alpine AS builder

   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM node:20-alpine AS runner
   WORKDIR /app

   ENV NODE_ENV production

   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static

   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **Build and Push**
   ```bash
   docker build -t your-app:latest .
   docker tag your-app:latest registry/your-app:latest
   docker push registry/your-app:latest
   ```

3. **Deploy with Docker Compose**
   ```yaml
   version: '3.8'
   services:
     app:
       image: registry/your-app:latest
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
       env_file:
         - .env.production
       restart: unless-stopped
   ```

---

## 🧪 Post-Deployment Testing

### Smoke Tests

Run these tests immediately after deployment:

1. **Hotel Booking Flow**
   ```
   [ ] Search hotels (use test city: PAR, LON, NYC)
   [ ] Filter results
   [ ] View hotel details
   [ ] Select room
   [ ] Add to cart
   [ ] Checkout
   [ ] Complete payment (use test card)
   [ ] Verify email received
   [ ] Check database record created
   ```

2. **Car Rental Flow**
   ```
   [ ] Search cars (use test location)
   [ ] Filter results
   [ ] View car details
   [ ] Fill driver info
   [ ] Add to cart
   [ ] Checkout
   [ ] Complete payment
   [ ] Verify email received
   [ ] Check database record created
   ```

3. **Multi-Booking Flow**
   ```
   [ ] Add hotel to cart
   [ ] Add car to cart
   [ ] Review cart
   [ ] Apply promo code
   [ ] Checkout
   [ ] Verify single payment
   [ ] Check multiple emails received
   [ ] Verify all orders in database
   ```

4. **Webhook Processing**
   ```
   [ ] Make test payment
   [ ] Check webhook received in Stripe dashboard
   [ ] Verify order status updated to "confirmed"
   [ ] Verify paymentIntentId stored
   [ ] Check emails sent
   ```

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Create load test config
cat > load-test.yml <<EOF
config:
  target: "https://yourdomain.com"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Hotel Search"
    flow:
      - post:
          url: "/api/hotel-search"
          json:
            cityCode: "NYC"
            checkInDate: "2025-12-01"
            checkOutDate: "2025-12-05"
            adults: 2
EOF

# Run test
artillery run load-test.yml
```

---

## 📊 Monitoring Setup

### 1. Error Tracking (Sentry)

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs

# Configure in next.config.js
```

```javascript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 2. Analytics (Google Analytics)

```javascript
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 3. Uptime Monitoring

Set up monitors for:
- Homepage: `https://yourdomain.com`
- Hotel Search API: `POST /api/hotel-search`
- Car Search API: `POST /api/car-search`
- Webhook Endpoint: `POST /api/webhooks/stripe`

Recommended tools:
- Better Uptime
- Pingdom
- UptimeRobot

### 4. Performance Monitoring

```javascript
// Use Vercel Analytics
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
}
```

---

## 🔒 Security Hardening

### 1. Environment Variables

```bash
# Never commit .env files
echo ".env*" >> .gitignore

# Use secrets management in production
# Vercel: Dashboard → Settings → Environment Variables
# AWS: Secrets Manager
# DigitalOcean: App Platform → Environment Variables
```

### 2. Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function middleware(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }
}
```

### 3. CORS Configuration

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://yourdomain.com" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE" },
        ],
      },
    ];
  },
};
```

### 4. Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

---

## 📈 Performance Optimization

### 1. Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['amadeus.com', 'yourdomain.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
};
```

### 2. Caching Strategy

```typescript
// API routes
export const revalidate = 900; // 15 minutes

// Static pages
export const metadata = {
  // ...
};

export const dynamic = 'force-static';
```

### 3. Database Optimization

```javascript
// Create compound indexes
db.orders.createIndex({
  "groupId": 1,
  "status": 1
})

db.orders.createIndex({
  "metadata.userId": 1,
  "createdAt": -1
})
```

---

## 🚨 Rollback Plan

If critical issues occur:

### 1. Quick Rollback (Vercel)

```bash
# List deployments
vercel list

# Rollback to previous
vercel rollback
```

### 2. Database Rollback

```bash
# Restore from backup
mongorestore --uri="mongodb+srv://..." --archive=backup.archive

# Or use Atlas UI:
# Clusters → Backup → Restore
```

### 3. Emergency Maintenance Mode

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE === 'true') {
    return new Response('Under maintenance', { status: 503 });
  }
}
```

---

## 📞 Support & Escalation

### Support Tiers

**Tier 1: User Support**
- Common booking issues
- Payment questions
- Email not received

**Tier 2: Technical Support**
- API errors
- Integration issues
- Performance problems

**Tier 3: Engineering**
- Critical bugs
- Security incidents
- Data corruption

### On-Call Procedures

1. **Monitoring Alerts**
   - Set up PagerDuty or similar
   - Define alert thresholds
   - Create runbooks

2. **Incident Response**
   - Acknowledge alert within 5 minutes
   - Assess severity
   - Follow runbook
   - Escalate if needed
   - Post-incident review

---

## ✅ Post-Deployment Checklist

- [ ] All services running
- [ ] Webhooks receiving events
- [ ] Emails being delivered
- [ ] Database connections stable
- [ ] Monitoring dashboards configured
- [ ] Alerts set up
- [ ] Backups running
- [ ] SSL certificate valid
- [ ] DNS records correct
- [ ] Team notified
- [ ] Documentation updated
- [ ] Support team trained

---

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Stripe Production Checklist](https://stripe.com/docs/production-checklist)
- [MongoDB Atlas Best Practices](https://www.mongodb.com/docs/atlas/best-practices/)

---

**Last Updated**: 2025-11-17
**Version**: 1.0
**Status**: Ready for Production Deployment ✅
