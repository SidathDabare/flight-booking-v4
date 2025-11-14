# Passenger Details Persistence - Senior Developer Analysis

**Date:** January 14, 2025
**Analyzed By:** Senior Developer Perspective
**Status:** ⚠️ FEASIBLE with SECURITY CONSIDERATIONS

---

## 🎯 Executive Summary

**Question:** Can we make passenger details persist across page refreshes?

**Answer:** **YES - BUT WITH IMPORTANT SECURITY CONSIDERATIONS**

**Current State:** Passenger data uses Zustand but is **NOT persisted** - lost on page refresh.

**Key Concern:** Passenger data contains **PII (Personally Identifiable Information)**:
- ❗ Passport numbers
- ❗ Date of birth
- ❗ Email addresses
- ❗ Phone numbers
- ❗ Full names

**Recommendation:** **Implement with caution** - Use shorter TTL and consider security tradeoffs.

---

## 📊 Current Implementation Analysis

### What We Have Now

#### 1. **State Management: Zustand Store (No Persistence)**
**File:** [lib/store/use-passenger-store.ts](../../lib/store/use-passenger-store.ts:1)

```typescript
import { create } from "zustand";

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  passportNumber: string;      // ⚠️ SENSITIVE
  travelerType: string;
}

interface PassengerStore {
  passengers: Passenger[];
  addPassenger: (passenger: Omit<Passenger, "id">) => void;
  updatePassenger: (id: string, passenger: Partial<Passenger>) => void;
  deletePassenger: (id: string) => void;
  clearPassengers: () => void;
}

const usePassengerStore = create<PassengerStore>((set) => ({
  passengers: [],
  addPassenger: (passenger) =>
    set((state) => ({
      passengers: [
        ...state.passengers,
        { ...passenger, id: Math.random().toString(36).substr(2, 9) },
      ],
    })),
  updatePassenger: (id, updatedPassenger) =>
    set((state) => ({
      passengers: state.passengers.map((p) =>
        p.id === id ? { ...p, ...updatedPassenger } : p
      ),
    })),
  deletePassenger: (id) =>
    set((state) => ({
      passengers: state.passengers.filter((p) => p.id !== id),
    })),
  clearPassengers: () => set({ passengers: [] }),
}));

export default usePassengerStore;
```

**Analysis:**
- ✅ Using Zustand (correct state management)
- ❌ **NO persistence** - lost on page refresh
- ❌ **NO expiration** - no TTL mechanism
- ⚠️ **Contains sensitive PII data**

---

#### 2. **Usage Flow**

**Files Using Passenger Store:**
1. [app/(root)/booking/page.tsx](../../app/(root)/booking/page.tsx:59) - Main booking page
2. [app/(root)/booking/_components/passenger-form.tsx](../../app/(root)/booking/_components/passenger-form.tsx:108) - Form to add/edit passengers
3. [app/(root)/booking/confirmation/page.tsx](../../app/(root)/booking/confirmation/page.tsx:127) - Display after booking complete

**Flow:**
```
1. User selects flight → navigates to /booking
2. User fills out passenger form(s)
3. Store in Zustand (in-memory only)
4. User clicks "Proceed to Payment"
5. [PROBLEM: If user refreshes → ALL passenger data LOST]
6. User has to re-enter all passenger details (BAD UX)
7. After payment → Navigate to /confirmation
8. Display passenger details
```

**Current Behavior:**
- Passengers cleared on booking page mount? **NO** (commented out line 507)
- Passengers persist during session? **YES** (in-memory only)
- Passengers survive refresh? **NO** (lost)
- Passengers cleared after booking? **NO** (should be, but isn't currently)

---

## ⚠️ Security Considerations: PII in localStorage

### What is PII?

**Personally Identifiable Information (PII)** is data that can identify an individual:

**High Sensitivity:**
- ❗ Passport number (`passportNumber`)
- ❗ Date of birth (`dateOfBirth`)
- ❗ Full name + DOB combination

**Medium Sensitivity:**
- ⚠️ Email address (`email`)
- ⚠️ Phone number (`phoneNumber`)

### Risk Assessment: localStorage Storage

#### **localStorage Security Properties:**
- ✅ Domain-scoped (not shared across sites)
- ✅ Not sent to server automatically
- ❌ **Accessible via JavaScript** (XSS vulnerability)
- ❌ **Not encrypted** (stored in plain text)
- ❌ **Persists until cleared** (survives browser close)
- ❌ **Accessible to browser extensions**

#### **Potential Attack Vectors:**

1. **XSS (Cross-Site Scripting):**
   - If attacker injects malicious script
   - Can read all localStorage data
   - **Mitigation:** Already using Next.js (auto-escapes output)

2. **Malicious Browser Extensions:**
   - Extensions can read localStorage
   - User installs compromised extension
   - **Mitigation:** None (user's responsibility)

3. **Physical Access:**
   - Someone accesses user's unlocked computer
   - Can view localStorage in DevTools
   - **Mitigation:** Short TTL (auto-clear)

4. **Shared Computer:**
   - User books flight on public/shared computer
   - Forgets to clear data
   - Next user can see previous passenger data
   - **Mitigation:** Short TTL + warning message

---

## 💡 Recommended Solutions

### **Option 1: Limited Persistence with Security Measures** ⭐ **RECOMMENDED**

**Strategy:** Persist passenger data BUT with:
- ✅ **Short TTL:** Match flight persistence (20 minutes)
- ✅ **Clear on booking complete**
- ✅ **Warning message** about shared computers
- ✅ **Manual clear button**

#### Implementation:

```typescript
// lib/store/use-passenger-store.ts
import { create } from "zustand";
import { persist, devtools, subscribeWithSelector } from "zustand/middleware";

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  passportNumber: string;
  travelerType: string;
}

interface PassengerStore {
  passengers: Passenger[];
  persistedAt: number | null; // Timestamp when first persisted
  addPassenger: (passenger: Omit<Passenger, "id">) => void;
  updatePassenger: (id: string, passenger: Partial<Passenger>) => void;
  deletePassenger: (id: string) => void;
  clearPassengers: () => void;
  clearExpiredPassengers: () => boolean;
}

// Match flight persistence duration
const PASSENGER_PERSISTENCE_MS = 20 * 60 * 1000; // 20 minutes

const usePassengerStore = create<PassengerStore>()(
  persist(
    subscribeWithSelector(
      devtools(
        (set, get) => ({
          passengers: [],
          persistedAt: null,

          addPassenger: (passenger) => {
            const state = get();
            const now = Date.now();
            set({
              passengers: [
                ...state.passengers,
                { ...passenger, id: Math.random().toString(36).substr(2, 9) },
              ],
              persistedAt: state.persistedAt || now, // Set timestamp on first add
            });
          },

          updatePassenger: (id, updatedPassenger) =>
            set((state) => ({
              passengers: state.passengers.map((p) =>
                p.id === id ? { ...p, ...updatedPassenger } : p
              ),
            })),

          deletePassenger: (id) =>
            set((state) => ({
              passengers: state.passengers.filter((p) => p.id !== id),
            })),

          clearPassengers: () => {
            console.log("Clearing all passenger data from storage");
            set({ passengers: [], persistedAt: null });
          },

          clearExpiredPassengers: () => {
            const { persistedAt, passengers } = get();

            if (!persistedAt || passengers.length === 0) return false;

            const now = Date.now();
            const elapsed = now - persistedAt;

            if (elapsed > PASSENGER_PERSISTENCE_MS) {
              console.log("Passenger data expired (20 minutes), clearing...");
              set({ passengers: [], persistedAt: null });
              return true;
            }
            return false;
          },
        }),
        {
          name: "Passenger Store",
          enabled: true,
        }
      )
    ),
    {
      name: "passenger-storage", // localStorage key

      // Check expiration on hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          const expired = state.clearExpiredPassengers();
          if (expired) {
            console.log("Passenger data expired during hydration, cleared");
          }
        }
      },
    }
  )
);

// Auto-check expiration on store access
if (typeof window !== "undefined") {
  // Check expiration on initial load
  setTimeout(() => {
    usePassengerStore.getState().clearExpiredPassengers();
  }, 100);

  // Periodic check every 2 minutes
  setInterval(() => {
    const expired = usePassengerStore.getState().clearExpiredPassengers();
    if (expired) {
      console.log("Passenger data expired during periodic check");
    }
  }, 2 * 60 * 1000); // Every 2 minutes

  // Add to window for debugging
  (window as any).passengerStore = usePassengerStore;
}

export default usePassengerStore;
export { PASSENGER_PERSISTENCE_MS };
```

**Security Enhancements:**

1. **Add Warning Banner to Booking Page:**

```typescript
// app/(root)/booking/page.tsx - Add near top of page

{passengers.length > 0 && (
  <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6">
    <div className="flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
          Sensitive Information Stored
        </p>
        <p className="text-xs text-yellow-700 dark:text-yellow-500">
          Your passenger details are temporarily saved for convenience.
          They will be automatically cleared in 20 minutes or after booking completion.
        </p>
        {/* Optional: Show time remaining */}
        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
          Data saved: {formatDistanceToNow(new Date(persistedAt))} ago
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          clearPassengers();
          toast({
            title: "Passenger data cleared",
            description: "All passenger information has been removed.",
          });
        }}
        className="text-yellow-700 hover:text-yellow-900 dark:text-yellow-400"
      >
        Clear Now
      </Button>
    </div>
  </div>
)}
```

2. **Clear Passengers After Booking:**

```typescript
// app/(root)/booking/page.tsx - In handleProceedToPayment success handler

const handleProceedToPayment = async () => {
  // ... existing payment logic ...

  if (success) {
    // Clear passenger data after successful booking
    clearPassengers();

    // Also clear flight selection
    setSelectedFlight(null);

    router.push("/booking/confirmation");
  }
};
```

**Benefits:**
- ✅ Better UX (no data loss on refresh)
- ✅ Auto-expires after 20 minutes
- ✅ User can manually clear
- ✅ Warning about sensitive data
- ✅ Cleared after booking complete

**Security Tradeoffs:**
- ⚠️ PII temporarily in localStorage (20 min max)
- ⚠️ Vulnerable to XSS (but Next.js mitigates this)
- ⚠️ Accessible to malicious extensions
- ✅ Auto-cleared (not permanent)
- ✅ User is warned

---

### **Option 2: Session-Only (No Persistence)** ❌ **NOT RECOMMENDED**

**Keep current behavior** - passengers only in memory, lost on refresh.

**Pros:**
- ✅ More secure (no localStorage exposure)
- ✅ No implementation needed

**Cons:**
- ❌ Poor UX (user loses all data on refresh)
- ❌ Frustrating for users with slow forms
- ❌ Higher bounce rate

**Verdict:** Bad UX outweighs security benefit for temporary data.

---

### **Option 3: Backend Session Storage** (Over-Engineering)

Store passenger data in backend session/database.

**Pros:**
- ✅ More secure (server-side)
- ✅ Can sync across devices

**Cons:**
- ❌ Requires backend changes
- ❌ Requires authentication/session management
- ❌ Over-engineered for temporary form data
- ❌ Higher implementation cost

**Verdict:** Too complex for temporary form data.

---

## 🎯 Recommended Implementation: Option 1

### Why Option 1?

1. **UX Benefits Outweigh Security Risks:**
   - Passenger data is temporary (only needed for booking)
   - 20-minute TTL limits exposure window
   - Auto-cleared after booking complete
   - Modern flight booking sites do this

2. **Acceptable Risk Level:**
   - Data isn't payment info (no CVV, card numbers)
   - User is warned about storage
   - Next.js provides XSS protection
   - Short TTL limits exposure

3. **Industry Standard:**
   - Expedia, Booking.com, Kayak all persist passenger data
   - Users expect this behavior
   - Loss of data is MORE frustrating than theoretical security risk

---

## 📋 Implementation Steps

### Step 1: Update Passenger Store (10 minutes)

**File:** `lib/store/use-passenger-store.ts`

1. Import `persist` middleware
2. Add `persistedAt` timestamp field
3. Add `clearExpiredPassengers` method
4. Wrap store with `persist` middleware
5. Configure 20-minute expiration
6. Add auto-expiration checks

### Step 2: Add Security Warning Banner (10 minutes)

**File:** `app/(root)/booking/page.tsx`

1. Import `AlertTriangle` icon
2. Add warning banner component
3. Show time since data was saved
4. Add "Clear Now" button
5. Only show when passengers exist

### Step 3: Clear Passengers After Booking (5 minutes)

**File:** `app/(root)/booking/page.tsx`

1. Find payment success handler
2. Call `clearPassengers()` after successful booking
3. Ensure passengers are cleared before redirect

### Step 4: Update .clauiderules (3 minutes)

Document passenger persistence pattern:

```typescript
### Passenger Data Persistence (PII Handling)

⚠️ **Special Consideration:** Passenger data contains PII (passport, DOB, etc.)

**Pattern:**
- Persist with SHORT TTL (20 min max, matches flight persistence)
- Clear after booking completion
- Add warning banner about data storage
- Provide manual "Clear Now" button
- Auto-expire during hydration

**Example:** `lib/store/use-passenger-store.ts`
```

### Step 5: Test Thoroughly (15 minutes)

**Test Cases:**
1. ✅ Add passenger → Refresh page → Passenger still there
2. ✅ Add passenger → Wait 20 min → Passenger cleared
3. ✅ Complete booking → Passenger data cleared
4. ✅ Click "Clear Now" → All passengers removed
5. ✅ Multiple tabs → Data syncs correctly
6. ✅ Warning banner displays correctly
7. ✅ No console errors

---

## ⚠️ Important Considerations

### 1. **GDPR Compliance** (If applicable)

If serving EU users:
- ✅ User consent: Show warning banner (informed consent)
- ✅ Data minimization: Only store necessary fields
- ✅ Storage limitation: Auto-delete after 20 minutes
- ✅ Right to erasure: "Clear Now" button

**Verdict:** Compliant if warning banner is shown.

### 2. **PCI DSS** (Payment Card Industry)

- ✅ **NO payment card data stored** (separate payment flow)
- ✅ Passenger data is NOT covered by PCI DSS
- ❌ Do NOT add credit card fields to passenger store

### 3. **Data Breach Risk**

**If localStorage is compromised:**
- Attacker gets: Names, DOB, passport numbers, contact info
- Attacker does NOT get: Payment info, passwords, session tokens

**Mitigation:**
- Short TTL (20 min)
- Auto-clear on booking
- User warning

**Risk Level:** **MEDIUM** - Acceptable for temporary booking data

### 4. **Shared Computer Scenario**

**Scenario:**
1. User A books flight on public computer
2. User A closes browser without clearing
3. User B opens same website within 20 minutes
4. User B can see User A's passenger data in DevTools

**Mitigation:**
1. ✅ 20-minute auto-clear (reduces window)
2. ✅ Warning banner advises users on shared computers
3. ✅ Manual "Clear Now" button
4. Optional: Detect inactivity and clear sooner

### 5. **Browser Extensions**

Malicious extensions CAN read localStorage.

**Mitigation:**
- None (user's responsibility to vet extensions)
- Document this risk in warning banner

---

## 📊 Before vs After

### Before (Current)

```
User Flow:
1. Select flight ✅
2. Navigate to /booking ✅
3. Fill passenger form (5-10 minutes) ✅
4. [User accidentally refreshes] ❌
5. ALL passenger data LOST 😡
6. User has to re-enter everything 😞
7. User abandons booking 💔
```

### After (With Persistence)

```
User Flow:
1. Select flight ✅
2. Navigate to /booking ✅
3. See warning: "Data saved for convenience" ⚠️
4. Fill passenger form (5-10 minutes) ✅
5. [User accidentally refreshes] ✅
6. Passenger data RESTORED ✅
7. Continue booking ✅
8. Complete payment ✅
9. Passenger data AUTO-CLEARED ✅
```

---

## 🎓 Senior Developer Opinion

### Assessment: **IMPLEMENT WITH CAUTION**

#### Why Implement This?

1. **Significantly Better UX**
   - Users won't lose 10 minutes of form entry
   - Industry standard behavior
   - Expected by modern users

2. **Acceptable Security Risk**
   - Data is temporary (20 min max)
   - Not payment info
   - Auto-cleared after booking
   - User is warned

3. **Business Value**
   - Lower abandonment rate
   - Higher booking completion
   - Better user satisfaction

4. **Low Implementation Cost**
   - ~30 minutes of work
   - Reuses existing flight persistence pattern
   - Well-tested Zustand middleware

#### Security Best Practices Checklist

**MUST HAVE:**
- ✅ Short TTL (20 min max)
- ✅ Auto-clear on booking complete
- ✅ Warning banner (informed consent)
- ✅ Manual "Clear Now" button
- ✅ Never store payment card data

**NICE TO HAVE:**
- ⚪ Inactivity detection (clear after 5 min idle)
- ⚪ Encrypt localStorage data (overkill for temporary data)
- ⚪ Backend session storage (over-engineering)

#### Alternative Approach: Selective Persistence

If security is a major concern, persist LESS sensitive fields only:

```typescript
// Persist only non-sensitive fields
partialize: (state) => ({
  passengers: state.passengers.map(p => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    travelerType: p.travelerType,
    // Omit: passportNumber, dateOfBirth, email, phoneNumber
  })),
  persistedAt: state.persistedAt,
})
```

**Tradeoff:**
- ✅ More secure (no passport/DOB in localStorage)
- ❌ Less convenient (user re-enters sensitive fields)
- ❌ Partial UX improvement only

**Recommendation:** Not worth it - either persist everything or nothing.

---

## 🚀 Recommended Action

**Priority:** **MEDIUM-HIGH** - Good UX improvement with acceptable security risk

**Effort:** **LOW** - ~40 minutes implementation + testing

**Risk:** **MEDIUM** - PII in localStorage, but mitigated with TTL and warnings

**Next Steps:**
1. ✅ Review this analysis with team/stakeholders
2. ✅ Confirm security risk is acceptable
3. ✅ Implement Option 1 (persist with security measures)
4. ✅ Add warning banner
5. ✅ Ensure auto-clear on booking complete
6. ✅ Test thoroughly
7. ✅ Deploy to production

---

## 📝 Code Changes Summary

**Files to Modify:**
1. `lib/store/use-passenger-store.ts` - Add persist middleware + TTL
2. `app/(root)/booking/page.tsx` - Add warning banner + clear on booking complete
3. `.clauiderules` - Document pattern with PII handling notes

**New Dependencies:**
- None (persist is part of zustand)

**Breaking Changes:**
- None

**Migration:**
- Automatic (existing users won't notice)

---

## 🎯 Success Metrics

**Track these after deployment:**
1. **Reduced bounce rate** on booking page after refresh
2. **Increased booking completion rate**
3. **Fewer abandoned bookings** due to lost form data
4. **User feedback** (should be positive)
5. **No security incidents** (monitor for localStorage exploitation)

---

## ✅ Verdict

**FEASIBLE:** Yes, absolutely
**RECOMMENDED:** Yes, with security measures
**COMPLEXITY:** Low
**TIME ESTIMATE:** 40-50 minutes
**RISK LEVEL:** Medium (PII exposure, mitigated)

**DECISION:** ✅ **IMPLEMENT OPTION 1** with:
- 20-minute TTL
- Warning banner
- Auto-clear on booking
- Manual "Clear Now" button

This strikes the right balance between UX and security for temporary booking data. 🚀

---

## 🔐 Security Checklist for Production

**Before Deploying:**
- [ ] Warning banner displays correctly
- [ ] "Clear Now" button works
- [ ] Auto-clear after booking tested
- [ ] 20-minute expiration tested
- [ ] No payment card data in store (verify)
- [ ] Review CSP (Content Security Policy) headers
- [ ] Test XSS protection (try script injection)
- [ ] Verify HTTPS only (no localStorage on HTTP)

**After Deploying:**
- [ ] Monitor for localStorage exploitation attempts
- [ ] Track user feedback about data persistence
- [ ] Review error logs for persistence failures
- [ ] Consider adding inactivity detection (future)

---

*Analysis Date: January 14, 2025*
*Codebase: flight-booking-v3*
*Technology: Zustand + localStorage (with PII handling)*
*Expiration: 20 minutes (matches flight persistence)*
*Security: Medium risk, mitigated with TTL and warnings*
