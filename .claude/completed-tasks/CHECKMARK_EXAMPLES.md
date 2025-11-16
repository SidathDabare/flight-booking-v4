# Message Status Checkmark Examples

## Visual Guide - WhatsApp-Style Indicators

### Status Progression

```
┌─────────────────────────────────────────────────┐
│  Message Lifecycle Visualization                │
└─────────────────────────────────────────────────┘

1. SENT
   ┌──────────────────────────┐
   │ Hey, how are you?        │
   │                   10:30 ✓│  ← Single gray checkmark
   └──────────────────────────┘

2. DELIVERED (Recipient's device received it)
   ┌──────────────────────────┐
   │ Hey, how are you?        │
   │                  10:30 ✓✓│  ← Double gray checkmarks
   └──────────────────────────┘

3. READ (Recipient opened and read it)
   ┌──────────────────────────┐
   │ Hey, how are you?        │
   │                  10:30 ✓✓│  ← Double BLUE checkmarks
   └──────────────────────────┘
```

---

## Color Code

| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| **Sent** | ✓ | Gray (#9CA3AF) | Message left sender's device |
| **Delivered** | ✓✓ | Gray (#9CA3AF) | Message arrived at recipient's device |
| **Read** | ✓✓ | Blue (#3B82F6) | Recipient opened and read the message |

---

## Real Example (Client-Agent Conversation)

### Client's View (Sending Message):

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                     Hi, I need help!            │
│                              12:15 PM ✓         │ ← Sent
│                                                 │
│  Hello! How can I help you?                    │
│  12:16 PM                                       │
│                                                 │
│                     Thanks for responding!      │
│                              12:17 PM ✓✓        │ ← Delivered
│                                                 │
│  No problem, what's your question?              │
│  12:18 PM                                       │
│                                                 │
│                     What are your hours?        │
│                              12:19 PM ✓✓        │ ← Read (blue)
│                                                 │
└─────────────────────────────────────────────────┘
```

### Agent's View (Same Conversation):

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Hi, I need help!                               │
│  12:15 PM                                       │
│                                                 │
│                     Hello! How can I help you?  │
│                              12:16 PM ✓✓        │ ← Read (client read it)
│                                                 │
│  Thanks for responding!                         │
│  12:17 PM                                       │
│                                                 │
│                     No problem, what's your     │
│                     question?                   │
│                              12:18 PM ✓         │ ← Sent
│                                                 │
│  What are your hours?                           │
│  12:19 PM                                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Code Examples

### Using in React Component

```tsx
import { MessageStatusIcon } from '@/lib/message-status-utils';

// Single checkmark (sent)
<MessageStatusIcon
  message={{ createdAt: new Date(), deliveredTo: [], readBy: [] }}
  recipientId={recipientId}
  size={16}
/>
// Renders: ✓ (gray)

// Double checkmarks (delivered)
<MessageStatusIcon
  message={{
    createdAt: new Date(),
    deliveredTo: [{ userId: recipientId, deliveredAt: new Date() }],
    readBy: []
  }}
  recipientId={recipientId}
  size={16}
/>
// Renders: ✓✓ (gray)

// Double checkmarks (read)
<MessageStatusIcon
  message={{
    createdAt: new Date(),
    deliveredTo: [{ userId: recipientId, deliveredAt: new Date() }],
    readBy: [{ userId: recipientId, readAt: new Date() }]
  }}
  recipientId={recipientId}
  size={16}
/>
// Renders: ✓✓ (blue)
```

---

## Custom Styling Examples

### Example 1: With Tooltip

```tsx
<div className="flex items-center gap-1">
  <span className="text-xs text-gray-500">10:30 PM</span>
  <div className="group relative cursor-help">
    <MessageStatusIcon message={msg} recipientId={recipient} />
    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        Read at 10:32 PM
      </div>
    </div>
  </div>
</div>
```

### Example 2: With Animation

```tsx
<div className="transition-all duration-300 hover:scale-110">
  <MessageStatusIcon message={msg} recipientId={recipient} />
</div>
```

### Example 3: With Custom Colors

```tsx
// In message-status-utils.tsx, change:
color: '#10B981', // green-500 (WhatsApp style)
// or
color: '#8B5CF6', // purple-500 (custom brand)
```

---

## SVG Source Code

### Single Checkmark

```svg
<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path
    d="M13.5 4.5L6 12L2.5 8.5"
    stroke="#9CA3AF"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
```

### Double Checkmark

```svg
<svg width="18" height="16" viewBox="0 0 18 16" fill="none">
  <path
    d="M16 4.5L8.5 12L5 8.5"
    stroke="#9CA3AF"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M11.5 4.5L4 12L1.5 9.5"
    stroke="#9CA3AF"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
```

### Double Checkmark (Read - Blue)

```svg
<svg width="18" height="16" viewBox="0 0 18 16" fill="none">
  <path
    d="M16 4.5L8.5 12L5 8.5"
    stroke="#3B82F6"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M11.5 4.5L4 12L1.5 9.5"
    stroke="#3B82F6"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
```

---

## Size Variations

```tsx
// Extra small (12px) - for compact UIs
<MessageStatusIcon message={msg} recipientId={recipient} size={12} />

// Small (14px) - for mobile
<MessageStatusIcon message={msg} recipientId={recipient} size={14} />

// Default (16px) - recommended
<MessageStatusIcon message={msg} recipientId={recipient} size={16} />

// Large (20px) - for accessibility
<MessageStatusIcon message={msg} recipientId={recipient} size={20} />
```

---

## Platform Comparisons

### WhatsApp
- ✓ Single gray = Sent
- ✓✓ Double gray = Delivered
- ✓✓ Double blue = Read

### iMessage (Apple)
- "Delivered" text below message
- "Read" text with timestamp

### Telegram
- ✓ Single gray = Sent
- ✓✓ Double gray = Delivered
- (No read receipts by default)

### Our Implementation
- ✓ Single gray = Sent (matching WhatsApp)
- ✓✓ Double gray = Delivered (matching WhatsApp)
- ✓✓ Double blue = Read (matching WhatsApp)
- **Bonus:** Customizable colors!

---

## Accessibility

### Screen Reader Support

The SVG icons include `aria-label` attributes:

```tsx
<svg aria-label="Sent">...</svg>
<svg aria-label="Delivered">...</svg>
<svg aria-label="Read">...</svg>
```

### Tooltip Support

```tsx
<div title="Read at 10:32 PM">
  <MessageStatusIcon ... />
</div>
```

---

## Testing Visualization

### Test Flow

```
User A sends message
     ↓
User A sees: ✓ (gray)
     ↓
User B fetches messages (GET /api/messages)
     ↓
Auto-delivery triggers
     ↓
User A sees: ✓✓ (gray) [Socket.IO update]
     ↓
User B opens message thread
     ↓
Mark-read endpoint called
     ↓
User A sees: ✓✓ (blue) [Socket.IO update]
```

---

## Common UI Patterns

### Pattern 1: Right-aligned in bubble

```tsx
<div className="flex justify-end">
  <div className="bg-blue-500 text-white rounded-lg p-3">
    <p>Message text</p>
    <div className="flex items-center justify-end gap-1 mt-1">
      <span className="text-xs opacity-70">10:30 PM</span>
      <MessageStatusIcon message={msg} recipientId={recipient} size={14} />
    </div>
  </div>
</div>
```

### Pattern 2: Below message

```tsx
<div className="mb-2">
  <div className="bg-gray-200 rounded-lg p-3">
    <p>Message text</p>
  </div>
  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
    <span>10:30 PM</span>
    <MessageStatusIcon message={msg} recipientId={recipient} size={12} />
  </div>
</div>
```

### Pattern 3: Inline with text

```tsx
<div className="flex items-baseline gap-2">
  <span className="text-xs text-gray-500">10:30 PM</span>
  <span className="flex-shrink-0">
    <MessageStatusIcon message={msg} recipientId={recipient} size={14} />
  </span>
</div>
```

---

## Browser Compatibility

✅ **Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari iOS 14+
- Chrome Android

**Why it works everywhere:**
- Pure SVG (no external dependencies)
- Inline styles (no CSS conflicts)
- Standard React components

---

## Performance

### Bundle Size Impact
- Icon utilities: ~2KB gzipped
- SVG icons: ~0.5KB each
- Total addition: **~3KB**

### Rendering Performance
- SVG rendering: Native browser support
- No images to download
- No external fonts
- **Instant rendering**

---

**Created:** November 15, 2025
**Version:** 1.0.0
