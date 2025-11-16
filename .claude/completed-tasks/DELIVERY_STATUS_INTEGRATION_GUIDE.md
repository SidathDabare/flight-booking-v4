# Delivery Status Integration Guide

## WhatsApp-Style Message Status Indicators

This guide shows you how to integrate the delivery and read status indicators (checkmarks) into your messaging UI components.

---

## Overview

The system now supports three message states:

1. **Sent** (✓ single gray checkmark) - Message sent from sender
2. **Delivered** (✓✓ double gray checkmarks) - Message delivered to recipient's device
3. **Read** (✓✓ double blue checkmarks) - Message opened and read by recipient

---

## Quick Start

### 1. Import the Utility

```typescript
import { MessageStatusIcon, getMessageStatus } from '@/lib/message-status-utils';
```

### 2. Use in Your Component

```tsx
// In your message bubble component
<MessageStatusIcon
  message={reply}
  recipientId={recipientUserId}
  size={16}
/>
```

---

## Complete Integration Examples

### Example 1: Message Bubble Component

```tsx
// components/messages/MessageBubble.tsx
import { MessageStatusIcon, getMessageStatus } from '@/lib/message-status-utils';
import { useSession } from 'next-auth/react';

interface MessageBubbleProps {
  reply: {
    _id: string;
    senderId: string;
    content: string;
    createdAt: string;
    deliveredTo?: any[];
    readBy?: any[];
  };
  currentUserId: string;
  recipientUserId?: string; // The person who should receive this message
}

export default function MessageBubble({ reply, currentUserId, recipientUserId }: MessageBubbleProps) {
  const isSent = reply.senderId === currentUserId;

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] ${isSent ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-lg p-3`}>
        <p className="text-sm">{reply.content}</p>

        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs opacity-70">
            {new Date(reply.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>

          {/* Show status icons only for sent messages */}
          {isSent && recipientUserId && (
            <MessageStatusIcon
              message={reply}
              recipientId={recipientUserId}
              size={14}
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

### Example 2: With Tooltip (Enhanced UX)

```tsx
import { MessageStatusIcon, getMessageStatus, getMessageStatusTimestamp } from '@/lib/message-status-utils';

export default function MessageBubbleWithTooltip({ reply, currentUserId, recipientUserId }: MessageBubbleProps) {
  const isSent = reply.senderId === currentUserId;
  const statusInfo = getMessageStatus(reply, recipientUserId);
  const timestamp = getMessageStatusTimestamp(reply, recipientUserId);

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] ${isSent ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-lg p-3`}>
        <p className="text-sm">{reply.content}</p>

        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs opacity-70">
            {new Date(reply.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>

          {isSent && recipientUserId && (
            <div
              className="relative group cursor-help"
              title={`${statusInfo.tooltip}${timestamp ? ` at ${timestamp}` : ''}`}
            >
              <MessageStatusIcon
                message={reply}
                recipientId={recipientUserId}
                size={14}
              />

              {/* Tooltip on hover */}
              <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {statusInfo.tooltip}
                {timestamp && <div className="text-xs opacity-70">{timestamp}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Example 3: Determining Recipient ID

In a client-agent conversation, you need to determine who the recipient is:

```tsx
// components/messages/MessageThreadDialog.tsx
import { useSession } from 'next-auth/react';
import { MessageStatusIcon } from '@/lib/message-status-utils';

export default function MessageThreadDialog({ message }: { message: any }) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const currentUserRole = session?.user?.role;

  // Determine recipient based on roles
  const getRecipientId = (reply: any) => {
    if (currentUserRole === 'client') {
      // Client sees messages sent by them to agent
      // Recipient is the assigned agent
      return message.assignedTo;
    } else {
      // Agent/Admin sees messages from client
      // Recipient is the message sender (client)
      return message.senderId;
    }
  };

  return (
    <div>
      {message.replies.map((reply: any) => {
        const isSent = reply.senderId === currentUserId;
        const recipientId = isSent ? getRecipientId(reply) : undefined;

        return (
          <div key={reply._id} className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`${isSent ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-lg p-3`}>
              <p>{reply.content}</p>

              <div className="flex items-center justify-end gap-1 mt-1 text-xs opacity-70">
                <span>{new Date(reply.createdAt).toLocaleTimeString()}</span>
                {isSent && recipientId && (
                  <MessageStatusIcon
                    message={reply}
                    recipientId={recipientId}
                    size={14}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

---

## Using Custom Icons (Advanced)

If you want to use custom checkmark icons instead of the built-in SVGs:

```tsx
import { getMessageStatus } from '@/lib/message-status-utils';
import { Check, CheckCheck } from 'lucide-react'; // or react-icons

export function CustomMessageStatus({ message, recipientId }: { message: any; recipientId?: string }) {
  const statusInfo = getMessageStatus(message, recipientId);

  switch (statusInfo.icon) {
    case 'double-check-read':
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    case 'double-check':
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    case 'single-check':
    default:
      return <Check className="w-4 h-4 text-gray-400" />;
  }
}
```

---

## Integration Checklist

### Files to Update:

#### ✅ **Client Message Components**
- [ ] `components/messages/MessageThreadDialog.tsx` - Add status icons to sent messages
- [ ] `components/messages/MessageBubble.tsx` - Add status icons
- [ ] `components/client ui/ChatPopUpChatWindow.tsx` - Add status icons
- [ ] `components/client ui/ClientChatPopup.tsx` - Add status icons

#### ✅ **Admin/Agent Message Components**
- [ ] `components/admin/admin-message-thread-dialog.tsx` - Add status icons to sent messages
- [ ] `components/agent/agent-message-thread-dialog.tsx` - Add status icons to sent messages
- [ ] `components/admin/admin-messages-whatsapp.tsx` - Add status indicators
- [ ] `components/agent/agent-messages-whatsapp.tsx` - Add status indicators

---

## Color Customization

You can customize the colors in the utility file:

```typescript
// lib/message-status-utils.tsx

// Change read checkmark color from blue to green (WhatsApp style)
color: '#10B981', // green-500 instead of blue-500

// Or use your custom colors
color: '#your-custom-color',
```

---

## Automatic Delivery Tracking

Messages are automatically marked as delivered when:

1. **User opens/views the message thread** - The GET endpoint auto-marks as delivered
2. **Real-time Socket.IO connection** - Delivery events are emitted

No additional frontend code needed for delivery tracking!

---

## Testing the Status Icons

### Test Scenario 1: Client to Agent
1. Client sends message → Shows single gray checkmark
2. Agent opens message → Changes to double gray checkmarks (delivered)
3. Agent reads message → Changes to double blue checkmarks (read)

### Test Scenario 2: Agent to Client
1. Agent replies → Shows single gray checkmark
2. Client opens message → Changes to double gray checkmarks (delivered)
3. Client marks as read (opens thread) → Changes to double blue checkmarks (read)

---

## Performance Notes

- Status icons are rendered client-side using SVG (very lightweight)
- No additional API calls needed - status data comes with message object
- Auto-delivery tracking is non-blocking and async

---

## Troubleshooting

### Icons not showing?
- Check if `recipientId` is being passed correctly
- Verify the message object has `deliveredTo` and `readBy` arrays
- Check browser console for import errors

### Wrong colors?
- Verify you're using the correct hex codes
- Check Tailwind CSS classes if using utility classes

### Status not updating?
- Ensure Socket.IO is connected
- Check that mark-read endpoint is being called
- Verify auto-delivery is working (check server logs)

---

## API Reference

### `getMessageStatus(message, recipientId, recipientRole)`
Returns status info including icon type, color, and tooltip.

**Parameters:**
- `message` - The message or reply object
- `recipientId` - (optional) The recipient's user ID as string
- `recipientRole` - (optional) The recipient's role

**Returns:**
```typescript
{
  status: 'sent' | 'delivered' | 'read',
  icon: 'single-check' | 'double-check' | 'double-check-read',
  color: string,
  tooltip: string
}
```

### `MessageStatusIcon` Component

**Props:**
- `message` - The message or reply object
- `recipientId` - (optional) The recipient's user ID
- `recipientRole` - (optional) The recipient's role
- `size` - (optional) Icon size in pixels (default: 16)

---

## Next Steps

1. Update your message components with status icons
2. Test with multiple users to verify delivery/read tracking
3. Customize colors to match your brand
4. Add tooltips for better UX
5. Consider adding sound/vibration when status changes

---

**Need Help?**
- Check the example implementations above
- Review [lib/message-status-utils.tsx](lib/message-status-utils.tsx) for all available utilities
- See [MESSAGING_IMPROVEMENTS.md](MESSAGING_IMPROVEMENTS.md) for full system documentation

---

**Created:** November 15, 2025
**Version:** 1.0.0
