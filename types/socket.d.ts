import { Server as SocketIOServer } from 'socket.io'

declare global {
  var io: SocketIOServer | undefined
}

export interface ServerToClientEvents {
  // Message events
  'message:new-reply': (data: NewReplyData) => void
  'message:was-deleted': (data: DeletedMessageData) => void
  'message:was-edited': (data: EditedMessageData) => void
  'message:status-updated': (data: StatusUpdateData) => void
  'message:was-accepted': (data: AcceptedMessageData) => void
  'message:marked-read': (data: ReadReceiptData) => void
  'message:created': (data: MessageCreatedData) => void
  'message:list-updated': (data: MessageListUpdateData) => void

  // Unread count events
  'unread:should-refresh': (data: UnreadRefreshData) => void

  // User presence
  'user:online': (data: UserPresenceData) => void
  'user:offline': (data: UserPresenceData) => void
  'user:typing': (data: TypingData) => void
  'user:stopped-typing': (data: StoppedTypingData) => void

  // Notifications
  'notification:new-message': (data: NotificationData) => void
}

export interface ClientToServerEvents {
  // Thread management
  'join:thread': (messageId: string) => void
  'leave:thread': (messageId: string) => void

  // Message actions
  'message:reply': (data: ReplyEventData) => void
  'message:deleted': (data: DeletedMessageData) => void
  'message:edited': (data: EditedMessageData) => void
  'message:status-changed': (data: StatusUpdateData) => void
  'message:accepted': (data: AcceptedMessageData) => void
  'message:read': (messageId: string) => void

  // Typing indicators
  'typing:start': (messageId: string) => void
  'typing:stop': (messageId: string) => void

  // Unread count request
  'unread:request-update': (data?: any) => void
}

export interface SocketData {
  user?: {
    id: string
    name?: string
    email?: string
    role?: string
  }
}

// Event data interfaces
export interface NewReplyData {
  messageId: string
  reply: {
    _id: string
    senderId: string
    senderName: string
    senderRole: string
    content: string
    attachments?: string[]
    createdAt: string
  }
  senderId?: string
  senderName?: string
  senderRole?: string
}

export interface ReplyEventData {
  messageId: string
  content: string
  attachments?: string[]
}

export interface DeletedMessageData {
  messageId: string
  replyId?: string
}

export interface EditedMessageData {
  messageId: string
  replyId?: string
  content: string
}

export interface StatusUpdateData {
  messageId: string
  status: string
}

export interface AcceptedMessageData {
  messageId: string
  agentId: string
  agentName: string
}

export interface ReadReceiptData {
  messageId: string
  userId: string
  userName?: string
}

export interface UserPresenceData {
  userId: string
  userName?: string
  userRole?: string
}

export interface TypingData {
  userId: string
  userName: string
  messageId: string
}

export interface StoppedTypingData {
  userId: string
  messageId: string
}

export interface NotificationData {
  messageId: string
  senderId: string
  senderName: string
}

export interface MessageCreatedData {
  messageId: string
  senderId: string
  senderName: string
  subject: string
  timestamp: number
}

export interface MessageListUpdateData {
  messageId: string
  action: 'reply-added' | 'message-created' | 'status-changed' | 'message-deleted'
  timestamp: number
}

export interface UnreadRefreshData {
  userId?: string
  reason?: string
  timestamp: number
}
