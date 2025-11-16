# Messaging System Improvements

## Overview
This document details all improvements made to the messaging system in the Flight Booking application to implement WhatsApp-style read receipts, email notifications, and enhanced tracking capabilities.

## Date Implemented
November 15, 2025

---

## 1. Database Schema Updates

### Files Modified:
- `lib/db/models/Message.ts`

### Changes:

#### New Interface: IReadReceipt
```typescript
export interface IReadReceipt {
  userId: mongoose.Types.ObjectId;
  readAt: Date;
}
```

#### Updated IReply Interface
Added read tracking to individual replies:
```typescript
export interface IReply {
  // ... existing fields
  readBy?: IReadReceipt[];  // NEW: Track who read this reply and when
}
```

#### Updated IMessage Interface
Added comprehensive read tracking fields:
```typescript
export interface IMessage extends Document {
  // ... existing fields
  readBy?: IReadReceipt[];           // NEW: Array of read receipts
  lastReadByClient?: Date;           // NEW: Timestamp of client's last read
  lastReadByAgent?: Date;            // NEW: Timestamp of agent/admin's last read
}
```

### Database Schema Changes:

#### ReadReceiptSchema
```typescript
const ReadReceiptSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  readAt: { type: Date, required: true, default: Date.now }
}, { _id: false });
```

#### MessageSchema Updates
- Added `readBy` field with ReadReceiptSchema array
- Added `lastReadByClient` timestamp field
- Added `lastReadByAgent` timestamp field

#### ReplySchema Updates
- Added `readBy` field with ReadReceiptSchema array

### Benefits:
- ✅ Persistent read status across devices
- ✅ Read timestamps for analytics
- ✅ Support for multiple readers (future group messaging)
- ✅ Separate tracking for client vs agent reads

---

## 2. New API Endpoint: Mark as Read

### File Created:
- `app/api/messages/[id]/mark-read/route.ts`

### Endpoint Details:
**URL:** `PATCH /api/messages/[id]/mark-read`

**Purpose:** Mark a message and all its replies as read by the current user

**Authorization:**
- Clients: Can only mark their own messages as read
- Agents: Can only mark messages they've accepted as read
- Admins: Can mark any message as read

### Features:
1. **Duplicate Prevention:** Won't create duplicate read receipts within 5 seconds
2. **Bulk Update:** Marks main message AND all replies as read in one call
3. **Smart Skip:** Doesn't mark user's own replies as read (they've already seen them)
4. **Role-based Tracking:** Updates `lastReadByClient` or `lastReadByAgent` based on role
5. **Real-time Sync:** Emits Socket.IO event `message:marked-read`
6. **Unread Count Refresh:** Triggers `unread:should-refresh` event

### Response Format:
```json
{
  "success": true,
  "message": "Message marked as read successfully",
  "data": {
    "messageId": "507f1f77bcf86cd799439011",
    "readAt": "2025-11-15T10:30:00.000Z"
  }
}
```

---

## 3. Updated Unread Count Logic

### File Modified:
- `app/api/messages/unread-count/route.ts`

### Previous Behavior:
- Used **localStorage** only (client-side)
- Checked who sent the last reply
- Not persistent across devices

### New Behavior:
- Uses **database timestamps** (`lastReadByClient`, `lastReadByAgent`)
- Compares message/reply timestamps against last read time
- Fully persistent and synced across devices

### Algorithm:

#### For Clients:
```typescript
1. Fetch all messages where senderId = currentUserId
2. Get lastReadAt from message.lastReadByClient || epoch
3. Count messages that have agent/admin replies newer than lastReadAt
4. Return count
```

#### For Agents:
```typescript
1. Fetch messages assigned to agent with status "accepted" or "resolved"
2. Get lastReadAt from message.lastReadByAgent || epoch
3. Check if original message is newer than lastReadAt
4. Check if any client replies are newer than lastReadAt
5. Return count
```

#### For Admins:
```typescript
1. Fetch all messages with status "pending", "accepted", or "resolved"
2. Get lastReadAt from message.lastReadByAgent || epoch
3. Check if original message is newer than lastReadAt
4. Check if any client replies are newer than lastReadAt
5. Return count
```

### Benefits:
- ✅ **Accurate:** Database-backed instead of browser cache
- ✅ **Persistent:** Survives browser cache clear
- ✅ **Cross-device:** Synced across mobile, desktop, etc.
- ✅ **Role-aware:** Different logic for client vs agent/admin

---

## 4. Email Notification System

### Files Modified:
- `lib/email-templates.ts` - Added 4 new email templates
- `lib/email.ts` - Added 4 new email functions

### New Email Templates:

#### 1. getNewMessageNotificationTemplate
**When:** Client creates a new message
**Sent to:** All admins
**Subject:** `New Message: {subject}`
**Contains:**
- Sender name
- Message subject
- Link to view message in admin/agent dashboard

#### 2. getNewReplyNotificationTemplate
**When:** Someone replies to a message
**Sent to:** Opposite party (client ↔ agent/admin)
**Subject:** `New Reply: {subject}`
**Contains:**
- Replier name
- Message subject
- Reply preview (first 100 characters)
- Link to view full conversation

#### 3. getMessageAssignedNotificationTemplate
**When:** Agent accepts a message
**Sent to:** The agent who accepted
**Subject:** `Message Assigned: {subject}`
**Contains:**
- Client name
- Message subject
- Link to view and respond

#### 4. getMessageStatusChangeNotificationTemplate
**When:** Message status changes
**Sent to:** Client
**Subject:** `Message Status Updated: {subject}`
**Contains:**
- Old status → New status (color-coded)
- Message subject
- Link to view message

### Email Functions (lib/email.ts):

```typescript
sendNewMessageNotification(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  subject: string,
  messageId: string
)

sendNewReplyNotification(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  subject: string,
  replyContent: string,
  messageId: string,
  recipientRole: string  // Determines URL routing
)

sendMessageAssignedNotification(
  agentEmail: string,
  agentName: string,
  clientName: string,
  subject: string,
  messageId: string
)

sendMessageStatusChangeNotification(
  clientEmail: string,
  clientName: string,
  subject: string,
  oldStatus: string,
  newStatus: string,
  messageId: string
)
```

### Email Design Features:
- ✅ Clean, professional HTML templates
- ✅ Color-coded by action type
- ✅ Mobile-responsive design
- ✅ Clickable buttons + fallback text links
- ✅ Consistent branding

---

## 5. API Updates with Email Integration

### Files Modified:

#### A. `app/api/messages/route.ts` (POST - Create Message)
**Added:**
- Import `User` model and `sendNewMessageNotification`
- Async email sending to all admins after message creation
- Non-blocking execution (won't delay API response)

**Email Flow:**
```
Client creates message
  ↓
Message saved to DB
  ↓
Socket.IO event emitted
  ↓
Response sent to client (fast)
  ↓
Async: Fetch all admins
  ↓
Async: Send email to each admin
```

#### B. `app/api/messages/[id]/reply/route.ts` (POST - Reply)
**Added:**
- Import `User` model and `sendNewReplyNotification`
- Bidirectional email logic:
  - If client replies → email assigned agent/admin
  - If agent/admin replies → email client

**Email Flow:**
```
User adds reply
  ↓
Reply saved to message
  ↓
Socket.IO event emitted
  ↓
Response sent to user
  ↓
Async: Fetch recipient (client or agent)
  ↓
Async: Send reply notification email
```

#### C. `app/api/messages/[id]/accept/route.ts` (PATCH - Accept)
**Added:**
- Import `User` model and `sendMessageAssignedNotification`
- Email notification to agent who accepted the message

**Email Flow:**
```
Agent accepts message
  ↓
Message assigned to agent
  ↓
Socket.IO event emitted
  ↓
Response sent to agent
  ↓
Async: Fetch client details
  ↓
Async: Send assignment email to agent
```

#### D. `app/api/messages/[id]/status/route.ts` (PATCH - Status Change)
**Added:**
- Import `User` model and `sendMessageStatusChangeNotification`
- Email notification to client when status changes
- Captures old status before update for email comparison

**Email Flow:**
```
Agent/Admin changes status
  ↓
Store old status
  ↓
Update to new status
  ↓
Socket.IO event emitted
  ↓
Response sent to agent
  ↓
Async: Fetch client details
  ↓
Async: Send status change email to client
```

### Common Pattern - Non-blocking Email:
All APIs use this pattern to avoid delaying responses:

```typescript
// Send response immediately
return NextResponse.json({ success: true, ... });

// After response, send email asynchronously
(async () => {
  try {
    // Fetch user
    // Send email
  } catch (emailError) {
    console.error("Email error:", emailError);
    // Don't crash - email is not critical
  }
})();
```

---

## 6. Integration Requirements

### Environment Variables Needed:
```env
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
```

### Database Migration:
**No migration needed!** New fields are optional (`?:`), so existing documents will work. On first read/write, new fields will be added automatically.

### Frontend Integration (TODO):
To complete the implementation, update these UI components:

#### 1. Message Thread Dialog Components
**Files to update:**
- `components/messages/MessageThreadDialog.tsx`
- `components/admin/admin-message-thread-dialog.tsx`
- `components/agent/agent-message-thread-dialog.tsx`
- `components/client ui/ChatPopUpChatWindow.tsx`

**Add this code when message thread is opened:**
```typescript
useEffect(() => {
  if (messageId && isOpen) {
    // Mark message as read
    fetch(`/api/messages/${messageId}/mark-read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(() => {
        // Refresh unread count
        refreshUnreadCount();
      })
      .catch(err => console.error('Failed to mark as read:', err));
  }
}, [messageId, isOpen]);
```

#### 2. Unread Messages Context
**Files to update:**
- `lib/unread-messages-context.tsx`

**Changes:**
- Remove localStorage-based tracking (lines 41-178)
- Simplify to just call `/api/messages/unread-count`
- Remove `markAsRead` function (now handled by API)
- Keep Socket.IO event listeners for real-time updates

#### 3. Message Bubble Component
**File to update:**
- `components/messages/MessageBubble.tsx`

**Add read receipt UI:**
```typescript
// Show "Read" indicator for sent messages
{isSent && reply.readBy && reply.readBy.length > 0 && (
  <div className="text-xs text-gray-500 mt-1">
    Read {formatDistanceToNow(new Date(reply.readBy[0].readAt), { addSuffix: true })}
  </div>
)}
```

---

## 7. Testing Checklist

### Backend Testing:
- [ ] Create new message as client → Admins receive email
- [ ] Agent accepts message → Agent receives assignment email
- [ ] Client replies → Agent receives reply email
- [ ] Agent replies → Client receives reply email
- [ ] Status changes → Client receives status email
- [ ] Mark message as read → unread count decreases
- [ ] Mark message as read twice → no duplicate receipts
- [ ] Unread count accurate for client
- [ ] Unread count accurate for agent
- [ ] Unread count accurate for admin

### Frontend Testing (after UI integration):
- [ ] Open message thread → automatically marks as read
- [ ] Unread badge updates in real-time
- [ ] Read receipts display correctly
- [ ] Multiple devices sync read status
- [ ] Browser cache clear doesn't reset read status

### Email Testing:
- [ ] All email templates render correctly
- [ ] Links in emails work and navigate to correct page
- [ ] Email sent to correct recipients
- [ ] Email failures don't crash API
- [ ] Email preview text looks good in inbox

---

## 8. Performance Considerations

### Current Implementation:
- **Unread Count:** O(n) where n = number of messages
  - Fetches all messages and iterates through replies
  - **Impact:** Will be slow with 1000+ messages

### Future Optimizations (Recommended):

#### Option 1: Add Computed Field
```typescript
MessageSchema.virtual('unreadForClient').get(function() {
  if (!this.lastReadByClient) return true;
  return this.replies.some(r =>
    r.createdAt > this.lastReadByClient && r.senderRole !== 'client'
  );
});
```

#### Option 2: Aggregation Pipeline
```typescript
Message.aggregate([
  { $match: { senderId: userId } },
  { $project: {
    hasUnread: {
      $gt: [
        { $size: { $filter: {
          input: "$replies",
          cond: { $and: [
            { $gt: ["$$this.createdAt", "$lastReadByClient"] },
            { $ne: ["$$this.senderRole", "client"] }
          ]}
        }}},
        0
      ]
    }
  }},
  { $match: { hasUnread: true } },
  { $count: "total" }
])
```

#### Option 3: Denormalized Counter
Add `unreadCountForClient` field to Message, update on each reply:
```typescript
MessageSchema.add({
  unreadCountForClient: { type: Number, default: 0 },
  unreadCountForAgent: { type: Number, default: 0 }
});
```

---

## 9. Socket.IO Events Added/Modified

### New Events:

#### `message:marked-read`
**Emitted when:** User marks message as read
**Payload:**
```typescript
{
  messageId: string;
  userId: string;
  userName: string;
  userRole: string;
  readAt: string;  // ISO timestamp
}
```
**Room:** `message:${messageId}`

### Modified Events:

#### `unread:should-refresh`
**Now emitted from:**
- Message creation
- Reply added
- **NEW:** Message marked as read

---

## 10. Security Considerations

### Authorization Checks:
All new/modified endpoints enforce proper authorization:

✅ **Mark as Read:**
- Clients: Own messages only
- Agents: Accepted messages only
- Admins: Any message

✅ **Email Sending:**
- Runs in try-catch to prevent crashes
- Never exposes other users' emails in API responses
- Uses environment variables for sender email

✅ **Database Queries:**
- All queries filtered by user role
- No direct ObjectId exposure in URLs (already hashed)
- Lean queries used to prevent accidental data leaks

### Potential Risks:
⚠️ **Email Bombing:** Malicious user could create many messages to spam admins
- **Mitigation:** Add rate limiting to POST /api/messages

⚠️ **Read Receipt Privacy:** Some users may not want read receipts
- **Future:** Add user preference to disable read receipts

---

## 11. Summary of Changes

### Files Created (1):
1. `app/api/messages/[id]/mark-read/route.ts` - New endpoint to mark messages as read

### Files Modified (8):
1. `lib/db/models/Message.ts` - Added read tracking fields to schema
2. `lib/email-templates.ts` - Added 4 new email templates
3. `lib/email.ts` - Added 4 new email notification functions
4. `app/api/messages/route.ts` - Added email notifications for new messages
5. `app/api/messages/[id]/reply/route.ts` - Added email notifications for replies
6. `app/api/messages/[id]/accept/route.ts` - Added email notifications for assignment
7. `app/api/messages/[id]/status/route.ts` - Added email notifications for status changes
8. `app/api/messages/unread-count/route.ts` - Updated to use database instead of localStorage

### Database Changes:
- 3 new fields in Message schema
- 1 new field in Reply subdocument schema
- 1 new ReadReceipt schema
- **No migration required** (backward compatible)

### New API Endpoints:
- `PATCH /api/messages/[id]/mark-read` - Mark message as read

### Email Notifications:
- 4 new automated email types
- 4 new HTML templates
- Non-blocking async execution

### Key Benefits:
✅ WhatsApp-style read receipts
✅ Persistent read status across devices
✅ Comprehensive email notifications
✅ Improved unread count accuracy
✅ Better user engagement
✅ Professional communication

---

## 12. Next Steps (Recommended)

### High Priority:
1. **Frontend Integration** - Update UI components to call mark-as-read endpoint
2. **Testing** - Run through all test scenarios
3. **Environment Setup** - Configure Resend API key and email settings

### Medium Priority:
4. **Performance Optimization** - Implement aggregation pipeline for unread counts
5. **Pagination** - Add pagination to message list endpoints
6. **Rate Limiting** - Prevent email bombing attacks

### Low Priority:
7. **User Preferences** - Allow users to opt-out of email notifications
8. **Read Receipt UI** - Show "Read by Agent Name at 10:30 AM" in messages
9. **Analytics Dashboard** - Track response times, read rates, etc.
10. **Message Search** - Full-text search on messages

---

## 13. Rollback Plan

If issues arise, here's how to roll back:

### Immediate Rollback (Disable Emails):
```env
# In .env file, comment out or remove:
# RESEND_API_KEY=...
```
This will disable emails while keeping read tracking functional.

### Partial Rollback (Revert to localStorage):
Restore original `app/api/messages/unread-count/route.ts` from git:
```bash
git checkout HEAD~1 -- app/api/messages/unread-count/route.ts
```

### Full Rollback:
```bash
git revert <commit-hash>
```

**Note:** Database schema changes are backward compatible, so no need to migrate back.

---

## Contact & Support

For questions or issues related to these changes:
- Check Socket.IO events in browser DevTools → Network → WS
- Check email sending in server logs (look for "Error sending")
- Verify environment variables are set correctly
- Test API endpoints with Postman/Thunder Client

**Implemented by:** Claude Code
**Date:** November 15, 2025
**Version:** 1.0.0
