# Client UI Shared Components

This directory contains reusable UI components that ensure visual and structural consistency across all client-facing pages.

## Components

### SectionHeader

A standardized section header component with badge, title, and optional description.

**Usage:**
```tsx
import { SectionHeader } from "@/components/client/shared";

<SectionHeader
  badge="BADGE TEXT"
  title="Section Title"
  description="Optional description text"
  alignment="center" // or "left"
/>
```

**Features:**
- Amber/orange gradient badges
- Fluid responsive typography using `clamp()`
- Consistent spacing
- Dark mode support

### DecorativeBackground

Decorative background component with animated blur elements for visual depth.

**Usage:**
```tsx
import { DecorativeBackground } from "@/components/client/shared";

<section className="relative">
  <DecorativeBackground variant="mixed" />
  {/* Your content here */}
</section>
```

**Variants:**
- `mixed` - Both amber and orange blur elements
- `amber` - Single amber blur element
- `orange` - Single orange blur element

## Design Patterns

### Color Scheme (Amber/Orange Theme)

**Badges:**
```tsx
className="bg-gradient-to-r from-amber-100 to-orange-100
          dark:from-amber-900/30 dark:to-orange-900/30
          text-amber-700 dark:text-amber-400
          border border-amber-200/50 dark:border-amber-800/50"
```

**Text Gradients:**
```tsx
className="bg-gradient-to-br from-amber-600 to-orange-600
          dark:from-amber-400 dark:to-orange-400
          bg-clip-text text-transparent"
```

**Icon Backgrounds:**
```tsx
className="bg-gradient-to-br from-amber-100 to-orange-100
          dark:from-amber-900/30 dark:to-orange-900/30"
```

### Typography Scale

**Hero Titles:**
```tsx
style={{ fontSize: "clamp(2rem, 5vw + 1rem, 4.5rem)", lineHeight: "1.1" }}
```

**Section Titles:**
```tsx
style={{ fontSize: "clamp(1.75rem, 4vw + 0.5rem, 3rem)" }}
```

**Body Text:**
```tsx
className="text-base sm:text-lg leading-relaxed"
```

### Spacing System

**Section Padding:**
```tsx
className="py-16 sm:py-20 md:py-24 lg:py-32"
```

**Container:**
```tsx
className="container mx-auto px-4 sm:px-6 lg:px-8"
```

**Section Header Margin:**
```tsx
className="mb-12 sm:mb-16 lg:mb-20"
```

### Card Hover Effects

```tsx
className="shadow-xl hover:shadow-2xl
          hover:shadow-amber-500/10 dark:hover:shadow-amber-900/20
          transition-all duration-500 hover:-translate-y-2"
```

### Background Patterns

**Light Gradient Background:**
```tsx
className="bg-gradient-to-br from-slate-50 via-white to-amber-50/40
          dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
```

**Solid Background:**
```tsx
className="bg-white dark:bg-gray-950"
```

## Scroll Animations

All client pages should use the scroll animation hook:

```tsx
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function Page() {
  useScrollAnimation();

  return (
    <div className="w-full overflow-x-hidden">
      <section className="scroll-animate">
        {/* Section content */}
      </section>
    </div>
  );
}
```

## Page Structure Template

```tsx
"use client";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { SectionHeader, DecorativeBackground } from "@/components/client/shared";

export default function ClientPage() {
  useScrollAnimation();

  return (
    <div className="w-full overflow-x-hidden">
      <section className="scroll-animate relative w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
        <DecorativeBackground variant="amber" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            badge="SECTION BADGE"
            title="Section Title"
            description="Section description"
          />

          {/* Your content here */}
        </div>
      </section>
    </div>
  );
}
```

## Important Notes

- Always use the amber/orange color scheme for client pages
- Apply scroll animations to all major sections
- Use fluid typography with `clamp()` for better responsive behavior
- Maintain consistent spacing across all pages
- Don't modify these patterns for admin/agent dashboards
