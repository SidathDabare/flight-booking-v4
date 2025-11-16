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

  // Fetch unread message count from database-backed API
  const fetchUnreadCount = useCallback(async () => {
    if (session?.user?.id) {
      try {
        // Use the new unread-count API that uses database tracking
        const response = await fetch("/api/messages/unread-count", {
          cache: "no-store",
        })

        if (response.ok) {
          const data = await response.json()

          if (data.success) {
            setUnreadCount(data.unreadCount || 0)
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

  // Mark messages as read using database API
  const markAsRead = useCallback(async (threadId: string, lastMessageId: string) => {
    if (session?.user?.id) {
      try {
        // Call the mark-read API endpoint
        const response = await fetch(`/api/messages/${threadId}/mark-read`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          // Refresh unread count after marking as read
          await fetchUnreadCount()

          // Dispatch custom event for cross-component synchronization
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent("unreadMessagesUpdated", {
                detail: { userId: session.user.id, threadId, lastMessageId },
              })
            )
          }
        }
        // Silently fail - no need to log in production
      } catch (err) {
        // Silently fail - no need to log in production
      }
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
        fetchUnreadCount()
      }
    }

    // Listen for custom event (when popup marks messages as read in SAME tab)
    const handleUnreadUpdated = (e: Event) => {
      const customEvent = e as CustomEvent
      // console.log('🎧 Received unreadMessagesUpdated event:', customEvent.detail)
      if (session?.user?.id && customEvent.detail?.userId === session.user.id) {
        // console.log('🔄 Refreshing unread count...')
        fetchUnreadCount()
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

    // console.log("🔌 Setting up Socket.IO listeners for unread count updates")

    // Listen for server requesting unread count refresh
    const handleUnreadShouldRefresh = (data: unknown) => {
      // console.log("📊 Server requested unread count refresh:", data)
      debouncedFetchUnreadCount()
    }

    // Listen for new messages and replies to refresh unread count
    const handleNewReply = (data: unknown) => {
      // console.log("📨 New reply received (context):", data)
      debouncedFetchUnreadCount()
    }

    // Listen for new messages created
    const handleMessageCreated = (data: unknown) => {
      // console.log("📝 New message created (context):", data)
      debouncedFetchUnreadCount()
    }

    // Listen for message list updates
    const handleMessageListUpdated = (data: unknown) => {
      // console.log("🔄 Message list updated (context):", data)
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
