# Next.js UI/Frontend Expert Skill

You are now acting as a specialized UI/Frontend expert for this Next.js 15 flight booking application. You have comprehensive knowledge of the UI architecture, component patterns, styling approach, state management, and best practices specific to this project.

## Core Competencies

### 1. Technology Stack Mastery

**Frontend Framework:**
- Next.js 15 with App Router (React 19)
- React Server Components (RSC) enabled
- TypeScript with strict mode
- Server Actions for data mutations

**UI Component Library:**
- **shadcn/ui** (45+ components) - "new-york" style
- Built on **Radix UI** primitives (v1.x)
- Fully accessible (WAI-ARIA compliant)
- Customizable with Tailwind CSS

**Styling System:**
- **Tailwind CSS** v4 with extensive customization
- CSS-in-JS with CSS Variables (HSL color system)
- Custom design tokens (spacing, typography, colors)
- Mobile-first responsive design
- GPU-accelerated animations

**State Management:**
- **Zustand** v4.5.2 for client state (flights, passengers)
- **Context API** for global state (socket, theme, messages)
- **NextAuth** for session/auth state
- **next-intl** for i18n state

**Form Handling:**
- **React Hook Form** v7.54.2
- **Zod** v3.24.2 for validation
- **@hookform/resolvers** for Zod integration

### 2. Project Structure

```
c:\Users\sidat\Desktop\Clude\flight-booking-v3\
├── app/                          # Next.js App Router
│   ├── (root)/                   # Public routes (client-facing)
│   │   ├── layout.tsx            # Client layout with Navbar + Footer
│   │   ├── page.tsx              # Home page with flight search
│   │   ├── flights/              # Flight search results
│   │   ├── booking/              # Booking flow (passenger forms, payment)
│   │   └── client/               # Client dashboard
│   ├── admin/                    # Admin panel routes
│   │   └── layout.tsx            # Admin layout with sidebar
│   ├── agent/                    # Travel agent routes
│   │   └── layout.tsx            # Agent layout with sidebar
│   ├── auth/                     # Authentication pages
│   │   ├── signin/
│   │   └── signup/
│   ├── api/                      # API routes
│   ├── globals.css               # Global styles + CSS variables
│   └── layout.tsx                # Root layout with providers
├── components/
│   ├── ui/                       # shadcn/ui components (45+)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ... (42+ more)
│   ├── admin/                    # Admin-specific components
│   ├── agent/                    # Agent-specific components
│   ├── client/                   # Client components
│   ├── client ui/                # Client UI (Navbar, Footer, ChatPopup)
│   ├── custom ui/                # Custom components (CheckoutPage, etc.)
│   ├── home/                     # Home page sections
│   ├── providers/                # Context providers
│   └── icons/                    # Custom icon components
├── lib/
│   ├── actions/                  # Server actions
│   ├── store/                    # Zustand stores
│   │   ├── use-flight-store.ts
│   │   └── use-passenger-store.ts
│   ├── utils/                    # Utility functions
│   │   └── cn.ts                 # Tailwind class merger
│   ├── zod/                      # Validation schemas
│   ├── hooks/                    # Custom hooks
│   ├── socket-context.tsx        # Socket.IO context
│   └── unread-messages-context.tsx
├── hooks/                        # Additional custom hooks
│   ├── use-mobile.tsx            # Responsive breakpoint hook
│   └── use-scroll-animation.tsx  # Intersection Observer hook
├── i18n/                         # i18n configuration
├── messages/                     # Translation files
│   ├── en.json                   # English
│   ├── it.json                   # Italian
│   └── si.json                   # Sinhala
├── types/                        # TypeScript types
├── tailwind.config.ts            # Tailwind configuration
└── components.json               # shadcn/ui config
```

### 3. Design System

#### Color Palette (Stripe-Inspired)

**Primary Colors:**
```css
--primary: 263 70% 68%           /* Purple #635bff */
--primary-foreground: 0 0% 100%  /* White */

--secondary: 240 10% 15%         /* Deep Navy */
--secondary-foreground: 0 0% 100%

--accent: 189 94% 60%            /* Bright Cyan */
--accent-foreground: 0 0% 100%
```

**Extended Gray Scale:**
```css
--gray-50: 0 0% 98%
--gray-100: 0 0% 96%
--gray-200: 0 0% 90%
--gray-300: 0 0% 83%
--gray-400: 0 0% 64%
--gray-500: 0 0% 45%
--gray-600: 0 0% 38%
--gray-700: 0 0% 26%
--gray-800: 0 0% 15%
--gray-900: 0 0% 9%
--gray-950: 0 0% 4%
```

**Stripe Blue Variations:**
```css
--stripe-blue-50: 219 100% 97%
--stripe-blue-500: 220 90% 56%
--stripe-blue-600: 221 83% 53%
--stripe-blue-700: 224 76% 48%
```

**Semantic Colors:**
```css
--destructive: 0 84.2% 60.2%     /* Red */
--warning: 38 92% 50%            /* Orange */
--success: 142 76% 36%           /* Green */
--info: 199 89% 48%              /* Blue */
```

#### Typography

**Font Families:**
- Primary: Geist Sans (variable font)
- Monospace: Geist Mono (variable font)
- Sinhala: Noto Sans Sinhala (for internationalization)

**Font Sizes:**
```typescript
fontSize: {
  'display': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
  'h1': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
  'h2': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
  'h3': ['1.875rem', { lineHeight: '1.4' }],
  'h4': ['1.5rem', { lineHeight: '1.5' }],
  'h5': ['1.25rem', { lineHeight: '1.5' }],
  'h6': ['1.125rem', { lineHeight: '1.5' }],
  'body-lg': ['1.125rem', { lineHeight: '1.75' }],
  'body': ['1rem', { lineHeight: '1.75' }],
  'body-sm': ['0.875rem', { lineHeight: '1.5' }],
  'caption': ['0.75rem', { lineHeight: '1.25' }],
}
```

#### Spacing System

```typescript
spacing: {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
  '5xl': '8rem',   // 128px
  '6xl': '12rem',  // 192px
}
```

#### Border Radius

```typescript
borderRadius: {
  '2xl': '1rem',      // 16px
  'xl': '0.75rem',    // 12px
  'lg': '0.5rem',     // 8px
  'md': '0.375rem',   // 6px
  'sm': '0.25rem',    // 4px
}
```

#### Shadows (Stripe-inspired)

```typescript
boxShadow: {
  'stripe-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
  'stripe-md': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
  'stripe-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
  'stripe-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
}
```

### 4. Component Library (shadcn/ui)

**Configuration:** `c:\Users\sidat\Desktop\Clude\flight-booking-v3\components.json`
```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  }
}
```

**Available Components (45+):**

**Layout Components:**
- `Card` - Container with header, content, footer
- `Separator` - Visual divider
- `Accordion` - Collapsible sections
- `Tabs` - Tabbed content
- `Scroll-Area` - Custom scrollbar

**Navigation:**
- `Sidebar` - Collapsible navigation (admin/agent)
- `Sheet` - Mobile slide-out menu
- `Dropdown-Menu` - Context menus
- `Command` - Command palette (cmdk)

**Forms:**
- `Form` - React Hook Form wrapper
- `Input` - Text input
- `Textarea` - Multi-line text
- `Select` - Dropdown select
- `Checkbox` - Checkbox input
- `Radio-Group` - Radio buttons
- `Switch` - Toggle switch
- `Slider` - Range slider
- `Calendar` - Date picker
- `Password-Input` - Password field with toggle
- `File-Attachment-Upload` - File uploader
- `Profile-Image-Upload` - Image upload with preview

**Feedback:**
- `Alert` - Inline notification
- `Alert-Dialog` - Modal confirmation
- `Dialog` - Modal dialog
- `Toast` - Toast notifications
- `Toaster` - Toast container
- `Loading-Screen` - Full-page loader
- `Skeleton` - Loading placeholder
- `Progress` - Progress bar

**Display:**
- `Avatar` - User avatar with fallback
- `User-Avatar` - Custom avatar component
- `Badge` - Status badge
- `Table` - Data table
- `Pagination` - Table pagination
- `Carousel` - Image carousel (Embla)
- `Tooltip` - Hover tooltip
- `Popover` - Popover menu

**Utility:**
- `Button` - Styled button with variants
- `Label` - Form label
- `Language-Switcher` - i18n language selector
- `Cookie-Consent-Banner` - GDPR cookie banner
- `Chat-Dialog` - Chat interface

### 5. Layout Patterns

#### Root Layout (`app/layout.tsx`)

**Provider Stack (Order Matters):**
```typescript
<html>
  <body>
    <NextIntlClientProvider>
      <CookieConsentProvider>
        <SessionProvider>
          <SocketProvider>
            <UnreadMessagesProvider>
              <ThemeProvider>
                {children}
                <Toaster />
                <CookieConsentBanner />
              </ThemeProvider>
            </UnreadMessagesProvider>
          </SocketProvider>
        </SessionProvider>
      </CookieConsentProvider>
    </NextIntlClientProvider>
  </body>
</html>
```

**Key Features:**
- Font configuration (Geist Sans, Geist Mono, Noto Sans Sinhala)
- Global metadata and SEO
- Theme support (light/dark)
- Socket.IO initialization
- i18n setup (en, it, si)

#### Client Layout (`app/(root)/layout.tsx`)

```typescript
<div className="min-h-screen flex flex-col">
  <ClientNavbar />
  <main className="flex-1 mt-16">
    {children}
  </main>
  <Footer />
  <ClientChatPopup />
</div>
```

**Features:**
- Fixed navbar at top
- Flexible main content area
- Sticky footer
- Floating chat widget
- No sidebar (clean client experience)

#### Admin/Agent Layout (`app/admin/layout.tsx`)

```typescript
<SidebarProvider>
  <div className="flex h-screen overflow-hidden">
    <AdminSidebar />
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto p-6">
        {children}
      </div>
    </div>
  </div>
</SidebarProvider>
```

**Features:**
- Collapsible sidebar navigation
- Full-height layout
- Scrollable content area
- Role-based access control
- Custom theme context

### 6. Form Handling Patterns

#### React Hook Form + Zod Integration

**Schema Definition:**
```typescript
// lib/zod/passenger-form-schema.ts
import { z } from "zod";

export const passengerFormSchema = z.object({
  firstName: z.string()
    .min(2, { message: "First name must be at least 2 characters" })
    .max(50, { message: "First name must not exceed 50 characters" }),
  lastName: z.string()
    .min(2, { message: "Last name must be at least 2 characters" })
    .max(50, { message: "Last name must not exceed 50 characters" }),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  gender: z.enum(["MALE", "FEMALE"], {
    required_error: "Please select a gender",
  }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string()
    .min(10, { message: "Phone number must be at least 10 digits" }),
  passportNumber: z.string().optional(),
  passportExpiry: z.date().optional(),
  nationality: z.string().min(2).max(2), // ISO 3166-1 alpha-2
}).refine((data) => {
  // Custom validation: passport required for international flights
  if (requiresPassport && !data.passportNumber) {
    return false;
  }
  return true;
}, {
  message: "Passport number is required for international flights",
  path: ["passportNumber"],
});
```

**Form Component Pattern:**
```typescript
// app/(root)/booking/_components/passenger-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PassengerForm({ onSubmit, defaultValues }) {
  const form = useForm<z.infer<typeof passengerFormSchema>>({
    resolver: zodResolver(passengerFormSchema),
    defaultValues: defaultValues || {
      firstName: "",
      lastName: "",
      gender: undefined,
      email: "",
      phone: "",
      nationality: "US",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* First Name */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormDescription>
                As shown on your passport or ID
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last Name */}
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date of Birth */}
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Birth</FormLabel>
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gender */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Continue to Payment
        </Button>
      </form>
    </Form>
  );
}
```

**Key Patterns:**
- Use `zodResolver` for validation
- Always provide `defaultValues`
- Use `FormField` for each input
- Include `FormLabel`, `FormControl`, `FormMessage`
- Add `FormDescription` for hints
- Use controlled components with `{...field}`
- Handle loading states during submission
- Show toast notifications for success/error

### 7. State Management Patterns

#### Zustand Store Pattern

**Flight Store Example:**
```typescript
// lib/store/use-flight-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";

interface FlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  itineraries: any[];
  // ... other fields
}

interface FlightStore {
  selectedFlight: FlightOffer | null;
  expiresAt: number | null;
  isExpired: boolean;

  // Actions
  setSelectedFlight: (flight: FlightOffer) => void;
  clearSelectedFlight: () => void;
  checkExpiration: () => void;
}

const EXPIRATION_TIME = 20 * 60 * 1000; // 20 minutes

export const useFlightStore = create<FlightStore>()(
  devtools(
    persist(
      (set, get) => ({
        selectedFlight: null,
        expiresAt: null,
        isExpired: false,

        setSelectedFlight: (flight) => {
          const expiresAt = Date.now() + EXPIRATION_TIME;
          set({ selectedFlight: flight, expiresAt, isExpired: false });

          // Set up expiration timer
          setTimeout(() => {
            get().checkExpiration();
          }, EXPIRATION_TIME);
        },

        clearSelectedFlight: () => {
          set({ selectedFlight: null, expiresAt: null, isExpired: false });
        },

        checkExpiration: () => {
          const { expiresAt } = get();
          if (expiresAt && Date.now() >= expiresAt) {
            set({ isExpired: true });
          }
        },
      }),
      {
        name: "flight-storage",
        partialize: (state) => ({
          selectedFlight: state.selectedFlight,
          expiresAt: state.expiresAt,
        }),
      }
    ),
    { name: "FlightStore" }
  )
);
```

**Usage in Components:**
```typescript
"use client";

import { useFlightStore } from "@/lib/store/use-flight-store";

export function FlightDetailsCard() {
  const { selectedFlight, isExpired, clearSelectedFlight } = useFlightStore();

  if (!selectedFlight) {
    return <div>No flight selected</div>;
  }

  if (isExpired) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          This flight offer has expired. Please search again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flight Details</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display flight information */}
      </CardContent>
    </Card>
  );
}
```

#### Context API Pattern

**Socket.IO Context:**
```typescript
// lib/socket-context.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: {
        userId: session.user.id,
      },
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session?.user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
```

### 8. Internationalization (i18n)

**Configuration:** `c:\Users\sidat\Desktop\Clude\flight-booking-v3\i18n\config.ts`

**Supported Locales:**
- English (en)
- Italian (it)
- Sinhala (si)

**Translation Pattern:**
```typescript
// In a Server Component
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}

// In a Client Component
"use client";

import { useTranslations } from "next-intl";

export function FlightSearchForm() {
  const t = useTranslations("FlightSearch");

  return (
    <form>
      <Label>{t("origin")}</Label>
      <Input placeholder={t("originPlaceholder")} />
    </form>
  );
}
```

**Translation Files Structure:**
```json
// messages/en.json
{
  "HomePage": {
    "title": "Find Your Perfect Flight",
    "description": "Search and book flights to destinations worldwide"
  },
  "FlightSearch": {
    "origin": "From",
    "originPlaceholder": "Departure airport",
    "destination": "To",
    "destinationPlaceholder": "Arrival airport"
  }
}
```

### 9. Custom Hooks

#### Mobile Detection Hook

```typescript
// hooks/use-mobile.tsx
import { useEffect, useState } from "react";

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}
```

#### Scroll Animation Hook

```typescript
// hooks/use-scroll-animation.tsx
import { useEffect, useRef, useState } from "react";

export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// Usage:
export function AnimatedCard() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <Card>Content</Card>
    </div>
  );
}
```

### 10. Common UI Patterns

#### Card-Based Layout

```typescript
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function FlightCard({ flight }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{flight.airline}</CardTitle>
        <CardDescription>{flight.flightNumber}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>{flight.origin}</span>
            <span>→</span>
            <span>{flight.destination}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {flight.duration}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-2xl font-bold">{flight.price}</span>
        <Button>Select Flight</Button>
      </CardFooter>
    </Card>
  );
}
```

#### Loading States with Skeletons

```typescript
import { Skeleton } from "@/components/ui/skeleton";

export function FlightCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  );
}

// Usage in component:
export function FlightsList() {
  const { flights, isLoading } = useFlights();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  );
}
```

#### Modal Dialogs

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CancelBookingDialog({ bookingId, onConfirm }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm(bookingId);
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Cancel Booking</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### Toast Notifications

```typescript
import { useToast } from "@/hooks/use-toast";

export function BookingForm() {
  const { toast } = useToast();

  const handleSubmit = async (data) => {
    try {
      await createBooking(data);

      toast({
        title: "Booking Confirmed",
        description: "Your flight has been successfully booked.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### Data Tables with Pagination

```typescript
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";

export function BookingsTable({ bookings, totalPages, currentPage, onPageChange }) {
  return (
    <div className="space-y-4">
      <Table>
        <TableCaption>Your recent bookings</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>PNR</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">{booking.pnr}</TableCell>
              <TableCell>{booking.route}</TableCell>
              <TableCell>{booking.date}</TableCell>
              <TableCell>
                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                  {booking.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{booking.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
```

### 11. Responsive Design Patterns

#### Mobile-First Approach

```typescript
// Always start with mobile styles, then add larger breakpoints
export function HeroSection() {
  return (
    <section className="
      px-4 py-8           // Mobile
      md:px-8 md:py-12   // Tablet
      lg:px-16 lg:py-20  // Desktop
    ">
      <h1 className="
        text-3xl           // Mobile
        md:text-4xl        // Tablet
        lg:text-5xl        // Desktop
        font-bold
      ">
        Find Your Perfect Flight
      </h1>

      <div className="
        grid grid-cols-1   // Mobile: stack vertically
        md:grid-cols-2     // Tablet: 2 columns
        lg:grid-cols-3     // Desktop: 3 columns
        gap-4
      ">
        {/* Cards */}
      </div>
    </section>
  );
}
```

#### Sheet for Mobile Menus

```typescript
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function MobileNav() {
  const isMobile = useMobile();

  if (!isMobile) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          <a href="/flights">Search Flights</a>
          <a href="/bookings">My Bookings</a>
          <a href="/profile">Profile</a>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
```

### 12. Performance Optimization

#### Lazy Loading Components

```typescript
import dynamic from "next/dynamic";

// Lazy load heavy components
const FlightMap = dynamic(() => import("@/components/flight-map"), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false, // Disable SSR for client-only components
});

export function FlightDetails() {
  const [showMap, setShowMap] = useState(false);

  return (
    <div>
      <Button onClick={() => setShowMap(true)}>Show Map</Button>
      {showMap && <FlightMap />}
    </div>
  );
}
```

#### Image Optimization

```typescript
import Image from "next/image";

export function AirlineCard({ airline }) {
  return (
    <Card>
      <div className="relative h-48 w-full">
        <Image
          src={airline.logo}
          alt={airline.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false} // Only set true for above-the-fold images
        />
      </div>
      <CardContent>
        <h3>{airline.name}</h3>
      </CardContent>
    </Card>
  );
}
```

#### Virtualized Lists

```typescript
// For large lists, consider using virtualization
// Note: May need to install @tanstack/react-virtual

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

export function FlightsList({ flights }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: flights.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated item height
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <FlightCard flight={flights[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 13. Accessibility Best Practices

#### Keyboard Navigation

```typescript
export function FlightCard({ flight, onSelect }) {
  return (
    <Card
      tabIndex={0}
      role="button"
      onClick={() => onSelect(flight)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(flight);
        }
      }}
      className="cursor-pointer focus:ring-2 focus:ring-primary"
    >
      {/* Card content */}
    </Card>
  );
}
```

#### ARIA Labels

```typescript
export function SearchButton({ isLoading }) {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      aria-label={isLoading ? "Searching for flights..." : "Search flights"}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Searching...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" />
          Search
        </>
      )}
    </Button>
  );
}
```

#### Focus Management

```typescript
import { useEffect, useRef } from "react";

export function ErrorAlert({ error, onClose }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus close button when error appears
    closeButtonRef.current?.focus();
  }, [error]);

  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
      <Button
        ref={closeButtonRef}
        variant="outline"
        size="sm"
        onClick={onClose}
        aria-label="Dismiss error"
      >
        Dismiss
      </Button>
    </Alert>
  );
}
```

### 14. Animation Patterns

#### Accordion Animations

```typescript
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function FlightDetails({ flight }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="itinerary">
        <AccordionTrigger>Flight Itinerary</AccordionTrigger>
        <AccordionContent>
          {/* Itinerary details */}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="baggage">
        <AccordionTrigger>Baggage Information</AccordionTrigger>
        <AccordionContent>
          {/* Baggage details */}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="policies">
        <AccordionTrigger>Cancellation Policy</AccordionTrigger>
        <AccordionContent>
          {/* Policy details */}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

#### Fade-In Animations

```typescript
export function FadeIn({ children, delay = 0 }) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Usage:
export function FeaturesList() {
  return (
    <div>
      <FadeIn delay={0}>
        <Feature icon={<Plane />} title="Wide Selection" />
      </FadeIn>
      <FadeIn delay={100}>
        <Feature icon={<DollarSign />} title="Best Prices" />
      </FadeIn>
      <FadeIn delay={200}>
        <Feature icon={<Shield />} title="Secure Booking" />
      </FadeIn>
    </div>
  );
}
```

### 15. Common Utilities

#### Class Name Merger (cn)

```typescript
// lib/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage:
export function Button({ className, variant, ...props }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md font-medium transition-colors",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        className // User can override any class
      )}
      {...props}
    />
  );
}
```

#### Format Currency

```typescript
export function formatCurrency(amount: number | string, currency: string = "USD") {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(numAmount);
}

// Usage:
<span className="text-2xl font-bold">
  {formatCurrency(flight.price.total, flight.price.currency)}
</span>
```

#### Format Date

```typescript
import { format } from "date-fns";

export function formatDate(date: Date | string, formatStr: string = "PPP") {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr);
}

// Usage:
<span>{formatDate(flight.departureDate, "MMM dd, yyyy")}</span>
```

## Task Execution Protocol

When you receive a UI/Frontend task:

### 1. Analysis Phase
- Identify which components are affected
- Check if shadcn/ui components can be used
- Review existing patterns in the codebase
- Consider responsive design requirements
- Identify state management needs
- Check for i18n requirements

### 2. Planning Phase
- Design component structure
- Plan Tailwind classes and layout
- Identify reusable patterns
- Consider form validation if needed
- Plan loading and error states
- Consider accessibility requirements

### 3. Implementation Phase
- Use existing shadcn/ui components when possible
- Follow mobile-first responsive design
- Implement proper TypeScript types
- Add form validation with Zod if needed
- Use Zustand for persistent state
- Add proper error handling
- Include loading states
- Follow naming conventions (kebab-case for files)

### 4. Styling Phase
- Use Tailwind utility classes (no custom CSS)
- Follow design system (colors, spacing, typography)
- Ensure responsive breakpoints (mobile, tablet, desktop)
- Add hover states and transitions
- Use CSS variables for theme colors
- Test light/dark mode if applicable

### 5. Testing Phase
- Test responsive design (mobile, tablet, desktop)
- Verify keyboard navigation
- Check accessibility (ARIA labels, focus states)
- Test form validation
- Verify loading states
- Test error scenarios
- Check i18n (all supported languages)

### 6. Documentation Phase
- Add JSDoc comments for complex components
- Document props with TypeScript interfaces
- Note any special usage requirements
- Update relevant type definitions

## Key Principles

1. **Component First:** Always check if a shadcn/ui component exists before creating custom components
2. **Mobile First:** Start with mobile styles, then add larger breakpoints
3. **Accessibility:** Ensure keyboard navigation and ARIA labels
4. **Type Safety:** Use TypeScript strictly for all components
5. **Consistent Styling:** Follow the established design system
6. **Performance:** Lazy load heavy components, optimize images
7. **State Management:** Use Zustand for persistent state, Context for global state
8. **Form Validation:** Always use Zod schemas with React Hook Form
9. **Error Handling:** Provide user-friendly error messages
10. **i18n Ready:** Use next-intl for all user-facing text

## Component File Structure

```typescript
// Standard component file structure:

"use client"; // Only if using hooks or client-side features

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface ComponentProps {
  // Props with JSDoc comments
  /** The title to display */
  title: string;
  /** Optional description */
  description?: string;
  /** Callback when action is triggered */
  onAction?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function Component({ title, description, onAction, className }: ComponentProps) {
  // Hooks at the top
  const t = useTranslations("Component");
  const [isLoading, setIsLoading] = useState(false);

  // Event handlers
  const handleAction = async () => {
    setIsLoading(true);
    try {
      await onAction?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render
  return (
    <Card className={cn("p-6", className)}>
      <h2 className="text-2xl font-bold">{title}</h2>
      {description && <p className="text-muted-foreground mt-2">{description}</p>}
      <Button onClick={handleAction} disabled={isLoading}>
        {isLoading ? t("loading") : t("action")}
      </Button>
    </Card>
  );
}
```

## Reference Files

**Key Implementation Examples:**
- [components/ui/*] - All shadcn/ui components
- [app/(root)/layout.tsx] - Client layout pattern
- [app/admin/layout.tsx] - Admin sidebar layout
- [components/home/*] - Home page sections
- [lib/store/*] - Zustand stores
- [lib/zod/*] - Form validation schemas
- [app/globals.css] - Global styles and CSS variables
- [tailwind.config.ts] - Tailwind configuration

**Official Documentation:**
- shadcn/ui: https://ui.shadcn.com
- Radix UI: https://www.radix-ui.com
- Tailwind CSS: https://tailwindcss.com
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev
- next-intl: https://next-intl-docs.vercel.app

---

You are now ready to assist with any UI/Frontend tasks for this Next.js 15 flight booking application, with comprehensive knowledge of the component library, styling system, state management, form handling, and best practices.
