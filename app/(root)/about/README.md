# About Page - Refactored Architecture

## Overview
The About page has been completely refactored from a **1,229-line monolithic file** into a **clean, modular architecture** following Next.js 14/15 best practices.

## 📁 New Structure

```
app/(root)/about/
├── page.tsx                          # Main page (34 lines - orchestrator only)
├── _components/                      # UI Components
│   ├── HeroSection.tsx              # Hero with company story & stats
│   ├── PrinciplesSection.tsx        # Vision & Mission cards
│   ├── TeamSection.tsx              # Leadership showcase
│   ├── StaffSection.tsx             # Staff expertise
│   ├── PartnersCarousel.tsx         # Airline partners carousel
│   ├── BenefitsSection.tsx          # Service benefits
│   ├── TestimonialsSection.tsx      # Customer reviews
│   ├── ContactSection.tsx           # Contact information
│   ├── SectionHeader.tsx            # Reusable section header
│   ├── StatCard.tsx                 # Reusable stat display
│   └── Badge.tsx                    # Reusable badge component
├── _data/                           # Data Layer
│   ├── airline-partners.ts          # Partner airlines data
│   ├── testimonials.ts              # Customer testimonials
│   ├── benefits.ts                  # Service benefits
│   ├── team-info.ts                 # Team & company stats
│   └── contact-info.ts              # Contact details
├── _hooks/                          # Custom Hooks
│   ├── useCarousel.ts               # Carousel logic & touch handling
│   ├── useScrollAnimation.ts        # Intersection Observer animations
│   └── useContactForm.ts            # Form state management
└── _types/                          # TypeScript Definitions
    └── index.ts                     # All type definitions
```

## ✨ Key Improvements

### 1. **Separation of Concerns**
- **UI Components**: Presentational logic only
- **Data Layer**: All content separated from UI
- **Hooks**: Reusable business logic
- **Types**: Strong TypeScript definitions

### 2. **Performance Optimizations**
- ✅ Custom hooks with `useCallback` and `useMemo`
- ✅ Proper image loading with `priority` flags
- ✅ Efficient event listeners (cleanup on unmount)
- ✅ Reduced re-renders through memoization
- ✅ No inline object/array creation in render

### 3. **Code Reusability**
- **SectionHeader**: Used across 6+ sections
- **StatCard**: Reusable metric display
- **Badge**: Consistent badge styling
- Custom hooks shared across components

### 4. **Maintainability**
- Each component < 200 lines
- Clear file organization
- JSDoc comments
- Single Responsibility Principle

### 5. **Type Safety**
- Comprehensive TypeScript interfaces
- No `any` types
- Proper prop typing
- Type-safe data structures

### 6. **Accessibility**
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Proper heading hierarchy

## 🔧 Component Breakdown

### Main Page (`page.tsx`)
**Before**: 1,229 lines
**After**: 34 lines

Simple orchestrator that imports and renders sections.

### Components

#### **HeroSection**
- Company story and introduction
- Animated statistics cards
- Responsive hero image
- Decorative background elements

#### **PrinciplesSection**
- Vision & Mission cards
- Image-content split layout
- Hover animations

#### **TeamSection**
- Leadership team display
- Professional credentials
- Team member badges

#### **StaffSection**
- Staff qualifications
- Expertise highlights
- Team collaboration image

#### **PartnersCarousel**
- Responsive carousel (1/2/3 slides)
- Touch/swipe support
- Auto-advance with indicators
- Premium glassmorphism design

#### **BenefitsSection**
- Service benefits grid
- Icon-based cards
- Hover effects

#### **TestimonialsSection**
- Customer reviews
- Rating display
- Trust indicators

#### **ContactSection**
- Contact information cards
- Contact image
- Hover states

### Reusable Components

#### **SectionHeader**
```tsx
<SectionHeader
  badge="BADGE TEXT"
  title="Section Title"
  description="Optional description"
  alignment="center" // or "left"
/>
```

#### **StatCard**
```tsx
<StatCard value="15+" label="Years" />
```

#### **Badge**
```tsx
<Badge icon={Award} text="IATA Certified" variant="secondary" />
```

## 🎣 Custom Hooks

### `useCarousel(options)`
Manages carousel state, responsive slides, touch gestures, and auto-advance.

```tsx
const {
  currentSlide,
  slidesPerView,
  totalSlides,
  nextSlide,
  prevSlide,
  goToSlide,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
} = useCarousel({ totalItems: items.length });
```

### `useScrollAnimation(options)`
Handles scroll-based animations using Intersection Observer.

```tsx
useScrollAnimation(); // Default options
// or
useScrollAnimation({ threshold: 0.2, rootMargin: "0px" });
```

### `useContactForm()`
Manages contact form state and submission logic.

```tsx
const {
  formData,
  isSubmitting,
  formSuccess,
  handleInputChange,
  handleSubmit,
} = useContactForm();
```

## 📊 Data Layer

All data is separated into dedicated files for easy updates:

- **airline-partners.ts**: Partner airline logos and info
- **testimonials.ts**: Customer reviews and ratings
- **benefits.ts**: Service benefits with icons
- **team-info.ts**: Company stats, team members, staff info
- **contact-info.ts**: Contact details (email, phone, hours)

## 🎯 TypeScript Types

Comprehensive type definitions in `_types/index.ts`:

- `AirlinePartner`
- `Testimonial`
- `Benefit`
- `StaffMember`
- `TeamMember`
- `ContactInfo`
- `FormData`
- `Stat`

## 🚀 Usage

### Adding New Content

**Update airline partners:**
```tsx
// _data/airline-partners.ts
export const AIRLINE_PARTNERS: AirlinePartner[] = [
  // Add new partner here
];
```

**Add new testimonial:**
```tsx
// _data/testimonials.ts
export const TESTIMONIALS: Testimonial[] = [
  // Add new testimonial
];
```

### Modifying Sections

Each section is self-contained. Simply edit the component file:
```
_components/HeroSection.tsx
_components/TeamSection.tsx
etc.
```

### Styling

All styling uses Tailwind CSS with:
- Consistent spacing scale
- Responsive breakpoints (sm, md, lg, xl)
- Dark mode support
- Gradient themes (amber/orange)

## 📈 Benefits Summary

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Main file size | 1,229 lines | 34 lines | **97% reduction** |
| Number of files | 1 | 20+ | Better organization |
| Reusable components | 0 | 11 | Higher reusability |
| Type definitions | Inline | Dedicated file | Better type safety |
| Data separation | None | Complete | Easier updates |
| Testability | Low | High | Isolated components |

## 🔍 Code Quality

- ✅ No code duplication
- ✅ Single Responsibility Principle
- ✅ DRY (Don't Repeat Yourself)
- ✅ Proper TypeScript usage
- ✅ Comprehensive JSDoc comments
- ✅ Consistent naming conventions
- ✅ Clean import structure

## 🛠️ Future Improvements

Potential enhancements:
1. Add unit tests for components
2. Implement CMS integration for data
3. Add animation library (Framer Motion)
4. Create Storybook documentation
5. Add form validation with Zod
6. Implement actual API submission for contact form

## 📝 Notes

- All components are client-side rendered where needed (`"use client"`)
- Images use Next.js Image component for optimization
- Responsive design from mobile to desktop
- Accessibility features included
- Dark mode support throughout
