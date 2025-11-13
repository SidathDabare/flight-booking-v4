'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/lib/socket-context'

interface UnreadMessagesContextType {
  unreadCount: number
  refreshUnreadCount: () => Promise<void>
  markAsRead: (threadId: string, lastMessageId: string) => void
}

interface MessageReply {
  _id?: string
  senderRole: string
}

interface MessageThread {
  _id: string
  senderRole: string
  replies: MessageReply[]
}

interface MessagesResponse {
  success: boolean
  messages: MessageThread[]
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType | null>(null)

interface UnreadMessagesProviderProps {
  children: ReactNode
}

export function UnreadMessagesProvider({ children }: UnreadMessagesProviderProps) {
  const { data: session, status } = useSession()
  const socket = useSocket()
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread message count with improved tracking
  const fetchUnreadCount = useCallback(async () => {
    if (session?.user?.id && session.user.role === "client") {
      try {
        // Fetch messages directly to calculate accurate unread count
        const response = await fetch("/api/messages", {
          cache: "no-store",
        })

        if (response.ok) {
          const data = await response.json() as MessagesResponse

          if (data.success && data.messages.length > 0) {
            let totalCount = 0

            // Count unread messages across ALL threads
            data.messages.forEach((thread: MessageThread) => {
              // Get last seen message from localStorage (synced with popup)
              const lastSeenMessageId = typeof window !== 'undefined'
                ? localStorage.getItem(`lastSeenMessage_${session.user.id}_${thread._id}`)
                : null

              // Build array of all messages
              const allMessages = [
                {
                  id: thread._id,
                  senderRole: thread.senderRole,
                },
                ...thread.replies.map((reply: MessageReply, index: number) => ({
                  id: reply._id || `${thread._id}-reply-${index}`,
                  senderRole: reply.senderRole,
                })),
              ]

              // Debug logging
              console.log('🔍 Unread Count Calculation for thread:', {
                threadId: thread._id,
                lastSeenMessageId,
                totalMessages: allMessages.length,
                allMessageIds: allMessages.map(m => ({ id: m.id, role: m.senderRole }))
              })

              // Find last seen index
              let lastSeenIndex = -1
              if (lastSeenMessageId) {
                lastSeenIndex = allMessages.findIndex(msg => msg.id === lastSeenMessageId)
                console.log('📍 Last seen index:', lastSeenIndex)
              }

              // Count unread messages from agent/admin
              for (let i = lastSeenIndex + 1; i < allMessages.length; i++) {
                if (allMessages[i].senderRole !== "client") {
                  totalCount++
                }
              }
            })

            console.log('✉️ Total unread count across all threads:', totalCount)
            setUnreadCount(totalCount)
          } else {
            setUnreadCount(0)
          }
        } else {
          console.error("Failed to fetch unread count: HTTP", response.status)
          // Keep current count on error, don't reset to 0
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error)
        // Keep current count on error, don't reset to 0
      }
    } else if (session?.user?.id && (session.user.role === "agent" || session.user.role === "admin")) {
      // For agents/admins, use localStorage-based tracking like clients
      try {
        const response = await fetch("/api/messages", {
          cache: "no-store",
        })

        if (response.ok) {
          const data = await response.json() as MessagesResponse

          if (data.success && data.messages.length > 0) {
            let count = 0

            // Count unread messages for each thread
            data.messages.forEach((message: MessageThread) => {
              // Get last seen message from localStorage for this thread
              const lastSeenMessageId = typeof window !== 'undefined'
                ? localStorage.getItem(`lastSeenMessage_${session.user.id}_${message._id}`)
                : null

              // Check if this message is unread (last message is from client)
              if (!message.replies || message.replies.length === 0) {
                // No replies yet, check if original message is from client and not seen
                if (message.senderRole === "client" && !lastSeenMessageId) {
                  count++
                }
              } else {
                // Build array of all messages
                const allMessages = [
                  {
                    id: message._id,
                    senderRole: message.senderRole,
                  },
                  ...message.replies.map((reply: MessageReply, index: number) => ({
                    id: reply._id || `${message._id}-reply-${index}`,
                    senderRole: reply.senderRole,
                  })),
                ]

                // Find last seen index
                let lastSeenIndex = -1
                if (lastSeenMessageId) {
                  lastSeenIndex = allMessages.findIndex(msg => msg.id === lastSeenMessageId)
                }

                // Count unread messages from client
                for (let i = lastSeenIndex + 1; i < allMessages.length; i++) {
                  if (allMessages[i].senderRole === "client") {
                    count++
                  }
                }
              }
            })

            console.log('✉️ Admin/Agent unread count:', count)
            setUnreadCount(count)
          } else {
            setUnreadCount(0)
          }
        } else {
          console.error("Failed to fetch unread count: HTTP", response.status)
          // Keep current count on error, don't reset to 0
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error)
        // Keep current count on error, don't reset to 0
      }
    }
  }, [session])

  // Debounced version for Socket.IO events to prevent redundant API calls
  const debouncedFetchUnreadCount = useCallback(() => {
    let timeoutId: NodeJS.Timeout
    return () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        fetchUnreadCount()
      }, 300)
    }
  }, [fetchUnreadCount])()  // Immediately invoke to get the debounced function

  // Mark messages as read and update count
  // FIX: Use requestAnimationFrame to ensure localStorage write completes before refresh
  const markAsRead = useCallback((threadId: string, lastMessageId: string) => {
    console.log('📢 markAsRead called for thread:', threadId, 'lastMessageId:', lastMessageId)
    if (typeof window !== 'undefined' && session?.user?.id) {
      // Save to localStorage
      const key = `lastSeenMessage_${session.user.id}_${threadId}`
      localStorage.setItem(key, lastMessageId)
      console.log('💾 Saved to localStorage:', key, '=', lastMessageId)

      // Dispatch custom event for cross-component synchronization
      window.dispatchEvent(
        new CustomEvent("unreadMessagesUpdated", {
          detail: { userId: session.user.id, threadId, lastMessageId },
        })
      )
      console.log('✅ Dispatched unreadMessagesUpdated event')

      // FIX: Schedule refresh using requestAnimationFrame to ensure localStorage is written
      // and avoid race conditions. This also prevents duplicate calls since the event
      // listener won't trigger until the next tick.
      requestAnimationFrame(() => {
        console.log('🔄 Refreshing unread count after markAsRead...')
        fetchUnreadCount()
      })
    }
  }, [session, fetchUnreadCount])

  // Initial fetch and optimized polling (only as fallback)
  useEffect(() => {
    if (!session?.user?.id) return

    fetchUnreadCount()

    // Fallback polling (only every 60 seconds as backup to Socket.IO)
    const interval = setInterval(fetchUnreadCount, 60000)

    // Refresh on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUnreadCount()
      }
    }

    // Listen for storage changes (when popup marks messages as read in OTHER tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('lastSeenMessage_')) {
        console.log('🔄 Storage changed in another tab, refreshing count...')
        fetchUnreadCount()
      }
    }

    // Listen for custom event (when popup marks messages as read in SAME tab)
    // FIX: Remove this listener since markAsRead now handles the refresh directly
    // This prevents duplicate API calls
    const handleUnreadUpdated = (e: Event) => {
      const customEvent = e as CustomEvent
      console.log('🎧 Received unreadMessagesUpdated event:', customEvent.detail)
      // Only refresh if the event came from a different source (not markAsRead)
      // We detect this by checking if we're already in the middle of a refresh
      if (session?.user?.id && customEvent.detail?.userId === session.user.id) {
        // The markAsRead function already handles the refresh, so we skip it here
        // to avoid duplicate calls
        console.log('⏭️ Skipping refresh (already handled by markAsRead)')
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("unreadMessagesUpdated", handleUnreadUpdated)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("unreadMessagesUpdated", handleUnreadUpdated)
    }
  }, [session, fetchUnreadCount])

  // Socket.IO real-time updates (primary update mechanism)
  useEffect(() => {
    if (!socket || !session?.user?.id) return

    console.log("🔌 Setting up Socket.IO listeners for unread count updates")

    // Listen for server requesting unread count refresh
    const handleUnreadShouldRefresh = (data: unknown) => {
      console.log("📊 Server requested unread count refresh:", data)
      debouncedFetchUnreadCount()
    }

    // Listen for new messages and replies to refresh unread count
    const handleNewReply = (data: unknown) => {
      console.log("📨 New reply received (context):", data)
      debouncedFetchUnreadCount()
    }

    // Listen for new messages created
    const handleMessageCreated = (data: unknown) => {
      console.log("📝 New message created (context):", data)
      debouncedFetchUnreadCount()
    }

    // Listen for message list updates
    const handleMessageListUpdated = (data: unknown) => {
      console.log("🔄 Message list updated (context):", data)
      debouncedFetchUnreadCount()
    }

    const handleMessageEdited = () => {
      debouncedFetchUnreadCount()
    }

    const handleMessageDeleted = () => {
      debouncedFetchUnreadCount()
    }

    const handleStatusUpdate = () => {
      debouncedFetchUnreadCount()
    }

    // Register all listeners
    socket.on("unread:should-refresh", handleUnreadShouldRefresh)
    socket.on("message:new-reply", handleNewReply)
    socket.on("message:created", handleMessageCreated)
    socket.on("message:list-updated", handleMessageListUpdated)
    socket.on("message:was-edited", handleMessageEdited)
    socket.on("message:was-deleted", handleMessageDeleted)
    socket.on("message:status-updated", handleStatusUpdate)

    return () => {
      socket.off("unread:should-refresh", handleUnreadShouldRefresh)
      socket.off("message:new-reply", handleNewReply)
      socket.off("message:created", handleMessageCreated)
      socket.off("message:list-updated", handleMessageListUpdated)
      socket.off("message:was-edited", handleMessageEdited)
      socket.off("message:was-deleted", handleMessageDeleted)
      socket.off("message:status-updated", handleStatusUpdate)
    }
  }, [socket, session, debouncedFetchUnreadCount])

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadCount,
        refreshUnreadCount: fetchUnreadCount,
        markAsRead
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  )
}

// Custom hook to use unread messages
export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext)
  if (!context) {
    throw new Error('useUnreadMessages must be used within UnreadMessagesProvider')
  }
  return context
}
