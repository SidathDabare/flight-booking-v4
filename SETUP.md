# Authentication Setup Guide

This guide explains how to set up and test the new NextAuth.js authentication system that replaces Clerk.

## Prerequisites

1. MongoDB database running locally or remotely
2. Environment variables configured (see `.env.example`)

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill in the following required variables:

```bash
# NextAuth.js Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# MongoDB
MONGODB_URI=mongodb://localhost:27017/flight-booking

# Email Configuration (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# Other existing variables...
```

## Setup Steps

1. **Install Dependencies** (already done)
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Configure all required variables

3. **Create Admin User**
   ```bash
   npm run seed:admin
   ```
   This creates an admin user with:
   - Email: `admin@example.com`
   - Password: `admin123`

4. **Start the Application**
   ```bash
   npm run dev
   ```

## Testing the Authentication System

### 1. Registration Testing

1. **Client Registration**
   - Go to `/auth/signup`
   - Select "Client" role
   - Fill in details and submit
   - Should be automatically approved

2. **Agent Registration**
   - Go to `/auth/signup`
   - Select "Agent" role
   - Fill in details and submit
   - Should be pending approval
   - Admin email notification should be sent (if configured)

### 2. Login Testing

1. **Admin Login**
   - Go to `/auth/signin`
   - Use: `admin@example.com` / `admin123`
   - Should redirect to `/admin`

2. **Client Login**
   - Login with client credentials
   - Should redirect to `/client`

3. **Agent Login (Approved)**
   - Login with approved agent credentials
   - Should redirect to `/agent`

4. **Agent Login (Pending)**
   - Login with unapproved agent credentials
   - Should redirect to `/pending-approval`

### 3. Dashboard Access Testing

1. **Client Dashboard** (`/client`)
   - Basic flight search and booking interface
   - Only accessible to clients

2. **Agent Dashboard** (`/agent`)
   - Agent tools and client management
   - Only accessible to approved agents

3. **Admin Dashboard** (`/admin`)
   - User management interface
   - Agent approval functionality
   - Only accessible to admins

### 4. Role-Based Access Testing

1. Try accessing different dashboards with wrong roles
   - Should redirect to `/unauthorized`

2. Try accessing protected routes without authentication
   - Should redirect to `/auth/signin`

3. Try accessing agent routes with unapproved agent
   - Should redirect to `/pending-approval`

## Features Implemented

### ✅ Authentication
- [x] NextAuth.js with MongoDB adapter
- [x] Credentials provider for email/password login
- [x] JWT session strategy
- [x] Secure password hashing with bcrypt

### ✅ User Management
- [x] User registration with role selection
- [x] Role-based approval system (agents require approval)
- [x] User schema with name, email, password, role, isApproved
- [x] Admin can approve/reject agents
- [x] Admin can delete users

### ✅ Email Notifications
- [x] Email verification on registration
- [x] Admin notification for new agent registrations
- [x] Agent approval notification
- [x] Resend integration for email sending

### ✅ Route Protection
- [x] Middleware for protecting routes based on role
- [x] Redirect unapproved agents to pending page
- [x] Unauthorized access handling

### ✅ Dashboards
- [x] Client dashboard with basic functionality
- [x] Agent dashboard (only for approved agents)
- [x] Admin dashboard with user management
- [x] Role-based UI rendering

### ✅ Security
- [x] Secure route protection
- [x] JWT token validation
- [x] Password hashing
- [x] Role-based authorization

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET|POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Admin APIs
- `GET /api/admin/users` - Get all users (admin only)
- `PATCH /api/admin/users/[userId]/approve` - Approve agent (admin only)
- `DELETE /api/admin/users/[userId]` - Delete user (admin only)

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Ensure MongoDB is running
   - Check MONGODB_URI in environment variables

2. **Email Not Sending**
   - Verify RESEND_API_KEY is correct
   - Check EMAIL_FROM and ADMIN_EMAIL configuration

3. **Session Issues**
   - Ensure NEXTAUTH_SECRET is set
   - Clear browser cookies if experiencing issues

4. **Role Access Issues**
   - Check user role in database
   - Verify isApproved status for agents

### Development Tips

1. **Check User Status**
   - Use MongoDB Compass or CLI to check user records
   - Verify role and isApproved fields

2. **Debug Authentication**
   - Check browser Network tab for API calls
   - Look at server console for error messages

3. **Test Email Functionality**
   - Use a service like Resend's logs to verify email sending
   - Check spam folders for test emails

## Next Steps

1. **Connect to Existing Flight Booking System**
   - Update flight search to use user sessions
   - Connect bookings to authenticated users

2. **Enhance Security**
   - Add rate limiting
   - Implement password reset functionality
   - Add email verification enforcement

3. **Improve User Experience**
   - Add loading states
   - Improve error handling
   - Add user profile management

4. **Production Deployment**
   - Configure production environment variables
   - Set up email service
   - Configure MongoDB Atlas or production database