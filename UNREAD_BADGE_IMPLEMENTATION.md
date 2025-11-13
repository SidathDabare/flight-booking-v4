# Unread Badge Implementation - Complete Documentation

## 🎯 Overview

This document describes the improved unread badge system implemented for the client chat feature. The system provides accurate, synchronized unread message tracking across both the **ClientChatPopup** (floating chat button) and **ClientNavbar** (navigation bar).

---

## ✨ Key Features

✅ **Accurate Tracking** - Only counts messages actually unread by the user
✅ **Synchronized Badges** - Navbar and popup badges always show the same count
✅ **Persistent State** - Remembers what the user has read across sessions
✅ **Real-time Updates** - Badges update instantly when messages are read
✅ **Smart Detection** - Waits 2 seconds before marking messages as read
✅ **Cross-tab Sync** - Multiple browser tabs stay synchronized

---

## 📁 Files Modified

1. **`components/client ui/ClientChatPopup.tsx`** - Popup chat with improved tracking
2. **`components/client ui/ClientNavbar.tsx`** - Navbar badge synchronized with popup
3. **`components/ui/chat-dialog.tsx`** - Accessibility improvements

---

## 🔧 How It Works

### **Architecture**

```
┌─────────────────────────────────────────────────────┐
│              Browser localStorage                   │
│   Key: lastSeenMessage_<userId>_<threadId>         │
│   Value: "msg-123-reply-5" (last seen message ID)  │
└─────────────────────────────────────────────────────┘
         ↑ Write                        ↑ Read
         │                              │
  ┌──────────────┐              ┌──────────────┐
  │ ClientChat   │◄────Sync────►│ ClientNavbar │
  │   Popup      │   (Storage   │    Badge     │
  │   Badge      │    Events)   │              │
  └──────────────┘              └──────────────┘
         │                              │
         └──────────────────────────────┘
              Same calculation logic
```

### **Data Flow**

1. **New message arrives** from agent/admin
2. **Both components poll** every 10 seconds
3. **Read localStorage** to get last seen message ID
4. **Calculate unread count** - messages after last seen
5. **Display badge** with accurate count
6. **User opens chat** and views messages
7. **After 2 seconds** - mark as read, update localStorage
8. **Storage event fires** - notify all components
9. **Badges update** across all components and tabs

---

## 🎨 Components

### **1. ClientChatPopup.tsx**

**Location:** `components/client ui/ClientChatPopup.tsx`

**New State Variables:**
```typescript
const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);
const hasViewedRef = useRef(false);
```

**Key Functions:**

#### `calculateUnreadCount(thread: Message)`
Calculates accurate unread count based on last seen message.

```typescript
// Example:
// Last seen: message #2
// New messages: #3 (agent), #4 (agent), #5 (client), #6 (agent)
// Result: unreadCount = 3 (only #3, #4, #6)
```

#### `markMessagesAsRead()`
Marks messages as read after 2-second delay.

```typescript
// Saves to localStorage:
localStorage.setItem(
  'lastSeenMessage_userId_threadId',
  'msg-123-reply-5'
);
```

**Behavior:**
- Shows badge when unread messages exist
- Hides badge when popup is open
- Waits 2 seconds before marking as read
- Persists read state in localStorage

---

### **2. ClientNavbar.tsx**

**Location:** `components/client ui/ClientNavbar.tsx`

**Key Changes:**

#### Unified Tracking for Clients
```typescript
if (session.user.role === "client") {
  // Use same localStorage-based tracking as popup
  const lastSeenMessageId = localStorage.getItem(
    `lastSeenMessage_${session.user.id}_${thread._id}`
  );
  // Calculate unread count using same algorithm
}
```

#### Storage Event Listener
```typescript
// Listen for changes from popup
window.addEventListener("storage", handleStorageChange);

// When popup marks as read → navbar updates instantly
```

**Behavior:**
- For **clients**: Reads from localStorage, calculates locally
- For **agents/admins**: Uses API endpoint `/api/messages/unread-count`
- Updates in real-time when popup marks messages as read
- Shows same count as popup badge

---

## 🧪 Testing Guide

### **Manual Testing**

#### Test 1: Badge Appears on New Message
1. Sign in as client
2. Have admin/agent send a message
3. Wait 10 seconds (for polling)
4. ✅ Both navbar and popup badges should show "1"

#### Test 2: Badge Disappears When Read
1. Click the popup button (opens chat)
2. Wait 2 seconds
3. ✅ Both badges should disappear
4. Refresh page
5. ✅ Badges should stay hidden (localStorage persisted)

#### Test 3: Accurate Count for Multiple Messages
1. Have agent send 3 messages
2. ✅ Badges should show "3"
3. Client replies (1 message)
4. Agent sends 2 more messages
5. ✅ Badges should show "5" (not counting client's own message)

#### Test 4: Cross-Tab Synchronization
1. Open site in Tab 1 - See badge "2"
2. Open site in Tab 2 - See badge "2"
3. In Tab 1, open popup and wait 2 seconds
4. ✅ Badge in Tab 2 should disappear instantly

#### Test 5: Quick Open/Close
1. Badge shows "1"
2. Click popup button
3. Immediately close (< 2 seconds)
4. ✅ Badge should still show "1" (not marked as read)

#### Test 6: Page Refresh Persistence
1. Badge shows "2"
2. Refresh page
3. ✅ Badge should still show "2"
4. Open popup, wait 2 seconds
5. Refresh page
6. ✅ Badge should stay hidden

---

### **Automated Testing Scenarios**

```javascript
// Test localStorage key format
expect(localStorage.key).toBe('lastSeenMessage_user123_thread456');

// Test unread count calculation
const thread = {
  _id: 'thread1',
  senderRole: 'client',
  replies: [
    { senderRole: 'agent' },  // Unread
    { senderRole: 'agent' },  // Unread
    { senderRole: 'client' }, // Read (user's own)
  ]
};
// If lastSeenMessageId = 'thread1'
// Expected unreadCount = 2

// Test storage event handling
localStorage.setItem('lastSeenMessage_user1_thread1', 'msg-5');
// Should trigger storage event
// Should recalculate unread count
```

---

## 🐛 Edge Cases Handled

| Edge Case | How It's Handled |
|-----------|------------------|
| No thread exists | Badge hidden, count = 0 |
| User opens popup accidentally | 2-second delay prevents false marking |
| Multiple browser tabs | Storage events sync all tabs |
| Page refresh | localStorage persists state |
| localStorage disabled | Gracefully falls back to 0 |
| Client sends message | Not counted as unread |
| Agent sends multiple messages | Shows accurate total count |
| Popup already open | Badge hidden automatically |
| User closes before 2s | Messages stay unread |

---

## 🚀 Performance

### **Optimizations**

1. **useCallback** - Prevents unnecessary function recreations
2. **useRef** - Avoids re-renders for view tracking
3. **localStorage** - Client-side persistence (no API overhead)
4. **Conditional fetching** - Only fetches when needed
5. **Debounced polling** - 10-second intervals (not aggressive)
6. **Visibility detection** - Pauses when tab hidden

### **Memory Management**

```typescript
// Cleanup on unmount
return () => {
  clearInterval(interval);
  clearTimeout(timer);
  document.removeEventListener("visibilitychange", handler);
  window.removeEventListener("storage", handler);
};
```

---

## 📊 Data Structure

### **localStorage Format**

```javascript
// Key pattern
"lastSeenMessage_<userId>_<threadId>"

// Example keys
"lastSeenMessage_64a1b2c3d4e5f6_64b7c8d9e0f1g2"

// Value format
"msg-64b7c8d9e0f1g2-reply-5"  // Reply message
"msg-64b7c8d9e0f1g2"          // Original message
```

### **Message ID Format**

```javascript
// Original message
thread._id  // "msg-123"

// Reply messages
`${thread._id}-reply-${index}`  // "msg-123-reply-0", "msg-123-reply-1"
```

---

## 🔐 Security Considerations

✅ **Client-side storage** - No sensitive data in localStorage
✅ **User-scoped** - Each user has separate tracking
✅ **Thread-scoped** - Each conversation tracked separately
✅ **Role-based** - Clients and agents use different logic
✅ **Session-aware** - Requires authentication

---

## 🎯 User Experience

### **Before Implementation**

- ❌ Badge showed "1" even if 3 new messages
- ❌ Badge disappeared immediately on popup open
- ❌ Navbar and popup showed different counts
- ❌ Badge reappeared after page refresh (even if read)
- ❌ No persistence across sessions

### **After Implementation**

- ✅ Badge shows accurate count of new messages
- ✅ Badge waits 2 seconds before clearing
- ✅ Navbar and popup always match
- ✅ Read state persists across refreshes
- ✅ Works across multiple browser tabs
- ✅ Clear visual feedback for unread messages

---

## 📝 Future Enhancements

Possible improvements for the future:

1. **Server-side read receipts** - Track on database level
2. **Per-message read status** - Individual message tracking
3. **Browser notifications** - Desktop notifications for new messages
4. **Sound alerts** - Audio notification option
5. **Typing indicators** - Show when agent is typing
6. **Message previews** - Show snippet in tooltip
7. **Read timestamps** - Show when message was read

---

## 🛠️ Maintenance

### **Common Tasks**

#### Clear localStorage for testing
```javascript
// In browser console
localStorage.removeItem('lastSeenMessage_userId_threadId');
// Or clear all
localStorage.clear();
```

#### Debug unread count
```javascript
// In browser console
const userId = 'user123';
const threadId = 'thread456';
const key = `lastSeenMessage_${userId}_${threadId}`;
console.log('Last seen:', localStorage.getItem(key));
```

#### Monitor storage events
```javascript
window.addEventListener('storage', (e) => {
  console.log('Storage changed:', e.key, e.newValue);
});
```

---

## 📚 API Reference

### **ClientChatPopup**

#### State
```typescript
const [unreadCount, setUnreadCount] = useState<number>(0);
const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);
const hasViewedRef = useRef<boolean>(false);
```

#### Functions
```typescript
calculateUnreadCount(thread: Message): void
markMessagesAsRead(): Promise<void>
fetchThread(): Promise<void>
```

### **ClientNavbar**

#### State
```typescript
const [unreadCount, setUnreadCount] = useState<number>(0);
```

#### Functions
```typescript
fetchUnreadCount(): Promise<void>
handleStorageChange(e: StorageEvent): void
```

---

## ✅ Quality Checklist

- [x] ESLint passes with no warnings
- [x] TypeScript compiles with no errors
- [x] React hooks properly ordered
- [x] Event listeners cleaned up on unmount
- [x] localStorage access is SSR-safe
- [x] Accessibility requirements met
- [x] Cross-browser compatible
- [x] Mobile responsive
- [x] Performance optimized
- [x] Edge cases handled

---

## 🎉 Conclusion

The improved unread badge system provides a reliable, accurate, and user-friendly way to track unread messages. It synchronizes seamlessly across multiple components and browser tabs, persists state across sessions, and handles all edge cases gracefully.

**Key Achievements:**
- ✅ Accurate unread counts
- ✅ Synchronized badges everywhere
- ✅ Persistent tracking via localStorage
- ✅ Real-time updates across tabs
- ✅ Production-ready implementation

The system is now ready for production use and provides an experience comparable to modern messaging applications like WhatsApp and Telegram.

---

**Last Updated:** October 6, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
