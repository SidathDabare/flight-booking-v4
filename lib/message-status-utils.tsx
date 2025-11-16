import { IMessage, IReply } from "./db/models/Message";

/**
 * Message delivery and read status utilities
 * Similar to WhatsApp's checkmark system:
 * - Single gray checkmark = Sent
 * - Double gray checkmarks = Delivered
 * - Double blue/green checkmarks = Read
 */

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface MessageStatusInfo {
  status: MessageStatus;
  icon: 'single-check' | 'double-check' | 'double-check-read';
  color: string;
  tooltip: string;
}

/**
 * Get the delivery/read status of a message or reply
 * @param message - The message or reply object
 * @param recipientId - The ID of the recipient (as string)
 * @param recipientRole - The role of the recipient ('client' | 'agent' | 'admin')
 * @returns MessageStatusInfo with status, icon type, color, and tooltip
 */
export function getMessageStatus(
  message: Partial<IMessage> | Partial<IReply>,
  recipientId?: string,
  recipientRole?: 'client' | 'agent' | 'admin'
): MessageStatusInfo {
  if (!recipientId) {
    // If no recipient specified, message is just sent
    return {
      status: 'sent',
      icon: 'single-check',
      color: '#9CA3AF', // gray-400
      tooltip: 'Sent',
    };
  }

  // Check if message was read by recipient
  const wasRead = message.readBy?.some((receipt: any) =>
    receipt.userId?.toString() === recipientId
  );

  if (wasRead) {
    return {
      status: 'read',
      icon: 'double-check-read',
      color: '#FFFFFF', // white for visibility on green background
      tooltip: 'Read',
    };
  }

  // Check if message was delivered to recipient
  const wasDelivered = (message as any).deliveredTo?.some((receipt: any) =>
    receipt.userId?.toString() === recipientId
  );

  if (wasDelivered) {
    return {
      status: 'delivered',
      icon: 'double-check',
      color: '#9CA3AF', // gray-400
      tooltip: 'Delivered',
    };
  }

  // Default: message is sent but not yet delivered
  return {
    status: 'sent',
    icon: 'single-check',
    color: '#9CA3AF', // gray-400
    tooltip: 'Sent',
  };
}

/**
 * Get the read/delivered timestamp for display
 * @param message - The message or reply object
 * @param recipientId - The ID of the recipient (as string)
 * @returns Formatted timestamp string or null
 */
export function getMessageStatusTimestamp(
  message: Partial<IMessage> | Partial<IReply>,
  recipientId?: string
): string | null {
  if (!recipientId) return null;

  // Check read timestamp first (most recent action)
  const readReceipt = message.readBy?.find((receipt: any) =>
    receipt.userId?.toString() === recipientId
  );

  if (readReceipt) {
    return new Date((readReceipt as any).readAt).toLocaleString();
  }

  // Check delivery timestamp
  const deliveryReceipt = (message as any).deliveredTo?.find((receipt: any) =>
    receipt.userId?.toString() === recipientId
  );

  if (deliveryReceipt) {
    return new Date(deliveryReceipt.deliveredAt).toLocaleString();
  }

  return null;
}

/**
 * SVG Icons for message status
 * Can be used directly in React components
 */
export const MessageStatusIcons = {
  // Single checkmark - Sent
  SingleCheck: ({ color = "#9CA3AF", size = 16 }: { color?: string; size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Sent"
    >
      <path
        d="M13.5 4.5L6 12L2.5 8.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  // Double checkmark - Delivered (gray)
  DoubleCheck: ({ color = "#9CA3AF", size = 16 }: { color?: string; size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Delivered"
    >
      <path
        d="M16 4.5L8.5 12L5 8.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 4.5L4 12L1.5 9.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  // Double checkmark - Read (blue/green)
  DoubleCheckRead: ({ color = "#3B82F6", size = 16 }: { color?: string; size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Read"
    >
      <path
        d="M16 4.5L8.5 12L5 8.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 4.5L4 12L1.5 9.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

/**
 * React component that renders the appropriate status icon
 * Usage: <MessageStatusIcon message={reply} recipientId={userId} />
 */
export function MessageStatusIcon({
  message,
  recipientId,
  recipientRole,
  size = 16
}: {
  message: Partial<IMessage> | Partial<IReply>;
  recipientId?: string;
  recipientRole?: 'client' | 'agent' | 'admin';
  size?: number;
}) {
  const statusInfo = getMessageStatus(message, recipientId, recipientRole);

  switch (statusInfo.icon) {
    case 'double-check-read':
      return <MessageStatusIcons.DoubleCheckRead color={statusInfo.color} size={size} />;
    case 'double-check':
      return <MessageStatusIcons.DoubleCheck color={statusInfo.color} size={size} />;
    case 'single-check':
    default:
      return <MessageStatusIcons.SingleCheck color={statusInfo.color} size={size} />;
  }
}

/**
 * Get a human-readable status description
 */
export function getStatusDescription(statusInfo: MessageStatusInfo): string {
  switch (statusInfo.status) {
    case 'read':
      return 'Read';
    case 'delivered':
      return 'Delivered';
    case 'sent':
    default:
      return 'Sent';
  }
}
