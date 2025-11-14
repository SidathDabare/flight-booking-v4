# Flight Selection 20-Minute Persistence - Senior Developer Analysis

**Date:** January 14, 2025
**Analyzed By:** Senior Developer Perspective
**Status:** ✅ Feasible - Implementation Plan Ready

---

## 🎯 Executive Summary

**Question:** Can we make selected flight persist for 20 minutes?

**Answer:** **YES** - This is absolutely possible and recommended for better UX.

**Current State:** Flight selection uses Zustand but is **NOT persisted** - lost on page refresh.

**Recommended Solution:** Add Zustand `persist` middleware with 20-minute expiration.

---

## 📊 Current Implementation Analysis

### What We Have Now

#### 1. **State Management: Zustand Store** ✅
**File:** [lib/store/use-flight-store.ts](../../lib/store/use-flight-store.ts:1)

```typescript
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

interface FlightStore {
  selectedFlight: FlightOffer | null;
  setSelectedFlight: (flight: FlightOffer | null) => void;
}

const useFlightStore = create<FlightStore>()(
  subscribeWithSelector(
    devtools((set) => ({
      selectedFlight: null,
      setSelectedFlight: (flight) => {
        console.log("Setting flight:", flight);
        set({ selectedFlight: flight });
      },
    }))
  )
);
```

**Analysis:**
- ✅ Using Zustand (correct state management)
- ✅ Has devtools middleware
- ✅ Has subscribeWithSelector middleware
- ❌ **NO persistence** - lost on page refresh
- ❌ **NO expiration** - no TTL mechanism

---

#### 2. **Selection Flow**
**File:** [app/(root)/flights/_components/flight-card.tsx](../../app/(root)/flights/_components/flight-card.tsx:52-55)

```typescript
const handleSelectFlight = () => {
  setSelectedFlight(flight);  // Store in Zustand
  router.push("/ticket-details");  // Navigate to details
};
```

**Flow:**
1. User searches flights → Results page
2. User clicks flight card → `setSelectedFlight(flight)`
3. Store in Zustand (in-memory only)
4. Navigate to `/ticket-details`
5. Navigate to `/booking`

**Problem:**
- If user refreshes page at step 4 or 5 → **Flight data is LOST**
- If user closes tab and reopens → **Flight data is LOST**
- User has to search again (bad UX)

---

#### 3. **Booking Page Already Has 10-Minute Timeout**
**File:** [app/(root)/booking/page.tsx](../../app/(root)/booking/page.tsx:72)

```typescript
const AVAILABILITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
```

**Interesting Finding:**
- Booking page tracks availability expiration (10 min)
- Has countdown timer
- But this is for **availability check**, not flight persistence
- Flight data itself isn't persisted

---

## 💡 Recommended Solution

### **Option 1: Zustand Persist Middleware** ⭐ **RECOMMENDED**

**Why:** Official Zustand solution, battle-tested, TypeScript-safe.

#### Implementation:

```typescript
// lib/store/use-flight-store.ts
import { create } from "zustand";
import { persist, devtools, subscribeWithSelector } from "zustand/middleware";
import { FlightOffer } from "amadeus-ts";

interface FlightStore {
  selectedFlight: FlightOffer | null;
  selectedAt: number | null; // Timestamp when flight was selected
  setSelectedFlight: (flight: FlightOffer | null) => void;
  clearExpiredFlight: () => void;
}

const FLIGHT_PERSISTENCE_MS = 20 * 60 * 1000; // 20 minutes

const useFlightStore = create<FlightStore>()(
  persist(
    subscribeWithSelector(
      devtools(
        (set, get) => ({
          selectedFlight: null,
          selectedAt: null,

          setSelectedFlight: (flight) => {
            console.log("Setting flight:", flight);
            set({
              selectedFlight: flight,
              selectedAt: flight ? Date.now() : null,
            });
          },

          clearExpiredFlight: () => {
            const { selectedAt, selectedFlight } = get();

            if (!selectedAt || !selectedFlight) return;

            const now = Date.now();
            const elapsed = now - selectedAt;

            if (elapsed > FLIGHT_PERSISTENCE_MS) {
              console.log("Flight selection expired, clearing...");
              set({ selectedFlight: null, selectedAt: null });
              return true;
            }
            return false;
          },
        }),
        { name: "Flight Store" }
      )
    ),
    {
      name: "flight-storage", // localStorage key

      // Only persist these fields
      partialize: (state) => ({
        selectedFlight: state.selectedFlight,
        selectedAt: state.selectedAt,
      }),

      // Custom storage with expiration check
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;

          try {
            const { state } = JSON.parse(str);
            const { selectedAt, selectedFlight } = state;

            // Check if expired
            if (selectedAt && selectedFlight) {
              const now = Date.now();
              const elapsed = now - selectedAt;

              if (elapsed > FLIGHT_PERSISTENCE_MS) {
                console.log("Stored flight expired, removing...");
                localStorage.removeItem(name);
                return null;
              }
            }

            return str;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, value);
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

// Auto-check expiration on store access
if (typeof window !== "undefined") {
  // Check expiration on initial load
  setTimeout(() => {
    useFlightStore.getState().clearExpiredFlight();
  }, 100);

  // Periodic check every minute
  setInterval(() => {
    useFlightStore.getState().clearExpiredFlight();
  }, 60 * 1000);
}

export default useFlightStore;
```

**Benefits:**
- ✅ Persists to localStorage
- ✅ Survives page refresh
- ✅ Survives tab close/reopen
- ✅ Auto-expires after 20 minutes
- ✅ TypeScript safe
- ✅ Works with existing devtools
- ✅ Minimal code changes needed

---

### **Option 2: Custom localStorage Hook** (Alternative)

```typescript
// lib/hooks/use-persisted-flight.ts
import { useEffect } from "react";
import useFlightStore from "@/lib/store/use-flight-store";

const STORAGE_KEY = "flight-selection";
const EXPIRATION_MS = 20 * 60 * 1000; // 20 minutes

export function usePersistFlightSelection() {
  const { selectedFlight, setSelectedFlight } = useFlightStore();

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const { flight, timestamp } = JSON.parse(stored);
      const now = Date.now();

      if (now - timestamp < EXPIRATION_MS) {
        setSelectedFlight(flight);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to load flight from storage:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [setSelectedFlight]);

  // Save to localStorage when changed
  useEffect(() => {
    if (selectedFlight) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          flight: selectedFlight,
          timestamp: Date.now(),
        })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedFlight]);
}
```

**Pros:**
- Simple implementation
- Easy to understand

**Cons:**
- More manual code
- Need to add hook to multiple pages
- Less elegant than Option 1

---

## 🎯 Recommended Implementation: Option 1

### Why Option 1?

1. **Official Zustand solution** - Battle-tested
2. **Automatic** - Works everywhere the store is used
3. **Type-safe** - Full TypeScript support
4. **Minimal changes** - Just update one file
5. **Robust** - Handles edge cases automatically

---

## 📋 Implementation Steps

### Step 1: Update Zustand Store (5 minutes)

**File:** `lib/store/use-flight-store.ts`

1. Import `persist` middleware
2. Add `selectedAt` field
3. Add `clearExpiredFlight` method
4. Wrap store with `persist` middleware
5. Configure 20-minute expiration

### Step 2: Add Expiration Check UI (Optional - 10 minutes)

**File:** `app/(root)/booking/page.tsx`

Add visual indicator showing time until flight selection expires:

```typescript
const [flightExpiresIn, setFlightExpiresIn] = useState<number | null>(null);

useEffect(() => {
  const store = useFlightStore.getState();
  if (!store.selectedAt) return;

  const interval = setInterval(() => {
    const elapsed = Date.now() - store.selectedAt!;
    const remaining = FLIGHT_PERSISTENCE_MS - elapsed;

    if (remaining <= 0) {
      store.clearExpiredFlight();
      router.push("/flights");
    } else {
      setFlightExpiresIn(remaining);
    }
  }, 1000);

  return () => clearInterval(interval);
}, [router]);
```

### Step 3: Update .clauiderules (2 minutes)

Document this pattern in `.clauiderules` so future development follows it:

```typescript
## State Management

### Zustand with Persistence Pattern

For data that needs to persist across page refreshes (e.g., flight selections):

\`\`\`typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useStore = create(
  persist(
    (set) => ({
      data: null,
      timestamp: null,
      setData: (data) => set({ data, timestamp: Date.now() }),
    }),
    {
      name: "storage-key",
      // Add expiration logic in storage.getItem
    }
  )
);
\`\`\`

**Real example:** Flight selection persists for 20 minutes
- File: \`lib/store/use-flight-store.ts\`
```

### Step 4: Test (10 minutes)

**Test Cases:**
1. ✅ Select flight → Refresh page → Flight still selected
2. ✅ Select flight → Close tab → Reopen → Flight still selected
3. ✅ Select flight → Wait 20 min → Flight cleared
4. ✅ Select flight → Complete booking → Flight cleared
5. ✅ Select flight → Go back → Select different flight → Updates correctly

---

## ⚠️ Important Considerations

### 1. **Storage Size**
- FlightOffer objects can be large (10-50KB)
- localStorage limit: 5-10MB per domain
- **Solution:** Only store essential fields (can use `partialize`)

### 2. **Multiple Tabs**
- User might open multiple tabs
- localStorage is shared across tabs
- **Solution:** Zustand persist handles this automatically via storage events

### 3. **Price Changes**
- Prices can change within 20 minutes
- **Current:** Booking page already checks availability (line 72)
- **Action:** No change needed, existing check handles this

### 4. **Security**
- Flight data is not sensitive (public search results)
- No PII or payment info stored
- **Verdict:** localStorage is safe for this use case

---

## 📊 Before vs After

### Before (Current)
```
User Flow:
1. Search flights ✅
2. View results ✅
3. Select flight ✅
4. View ticket details ✅
5. [User refreshes page] ❌ → Flight LOST
6. User has to search again 😞
```

### After (With 20-Min Persistence)
```
User Flow:
1. Search flights ✅
2. View results ✅
3. Select flight ✅ (saved to localStorage with timestamp)
4. View ticket details ✅
5. [User refreshes page] ✅ → Flight RESTORED
6. Continue booking ✅
7. [20 min passes] ⏰ → Flight expires (expected)
```

---

## 🎓 Senior Developer Opinion

**Assessment:** This is a **high-value, low-risk improvement**.

### Why Implement This?

1. **Better UX** - Users can safely refresh or navigate away
2. **Lower Bounce Rate** - Fewer users abandoning due to lost state
3. **Industry Standard** - Most flight booking sites do this
4. **Low Risk** - Well-tested Zustand middleware
5. **Quick Win** - ~15 minutes implementation

### Why 20 Minutes?

- **10 minutes:** Booking page availability timeout
- **20 minutes:** Flight selection persistence
- **Rationale:**
  - Availability checked at booking (10 min cache)
  - User has 20 min total to explore/decide
  - After 20 min, start fresh search (prices likely changed)

### Production Considerations

**Before Deploying:**
1. ✅ Test localStorage compatibility (IE11 if needed)
2. ✅ Test with large flight objects
3. ✅ Add error boundary for parse failures
4. ✅ Log expiration events for analytics
5. ✅ Consider toast notification when flight expires

**Optional Enhancements:**
- Show "Flight selected X minutes ago" indicator
- Warning at 18 minutes: "Flight selection expires in 2 minutes"
- Option to "Refresh flight prices" before expiration

---

## 🚀 Recommended Action

**Priority:** **HIGH** - Good ROI, improves UX significantly

**Effort:** **LOW** - ~30 minutes implementation + testing

**Risk:** **LOW** - Well-tested pattern, non-breaking change

**Next Steps:**
1. ✅ Approve this implementation plan
2. ✅ Implement Option 1 (Zustand persist)
3. ✅ Add expiration UI indicator
4. ✅ Test thoroughly
5. ✅ Deploy to production

---

## 📝 Code Changes Summary

**Files to Modify:**
1. `lib/store/use-flight-store.ts` - Add persist middleware
2. `app/(root)/booking/page.tsx` - Add expiration indicator (optional)
3. `.clauiderules` - Document pattern

**New Dependencies:**
- None (persist is part of zustand)

**Breaking Changes:**
- None

**Migration:**
- Automatic (existing users won't notice)

---

## 🎯 Success Metrics

**Track these after deployment:**
1. **Reduced bounce rate** on ticket-details and booking pages
2. **Increased booking completion rate**
3. **Fewer "flight not found" errors** from lost state
4. **User feedback** (should be positive)

---

## ✅ Verdict

**FEASIBLE:** Yes, absolutely
**RECOMMENDED:** Yes, high value
**COMPLEXITY:** Low
**TIME ESTIMATE:** 30-45 minutes
**RISK LEVEL:** Low

**GO FOR IT!** This is a no-brainer improvement. 🚀

---

*Analysis Date: January 14, 2025*
*Codebase: flight-booking-v3*
*Technology: Zustand + localStorage*
*Expiration: 20 minutes (configurable)*
