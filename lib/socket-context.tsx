'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket'

type SocketInstance = Socket<ServerToClientEvents, ClientToServerEvents>

const SocketContext = createContext<SocketInstance | null>(null)

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { data: session, status } = useSession()
  const [socket, setSocket] = useState<SocketInstance | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Don't connect if no session or still loading
    if (status === 'loading' || !session?.user) {
      return
    }

    console.log('🔌 Initializing Socket.IO connection...')

    // Create socket instance
    const socketInstance: SocketInstance = io({
      path: '/socket.io/',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      auth: {
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
      },
    })

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('✅ Socket.IO connected:', socketInstance.id)
      setIsConnected(true)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason)
      setIsConnected(false)

      // Auto-reconnect on server disconnect
      if (reason === 'io server disconnect') {
        socketInstance.connect()
      }
    })

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error.message)
      setIsConnected(false)
    })

    // Reconnection is handled automatically by Socket.IO
    // Connection state is tracked via connect/disconnect events

    // Set socket instance
    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting Socket.IO...')
      socketInstance.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [session, status])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

// Custom hook to use socket
export function useSocket() {
  const context = useContext(SocketContext)
  return context
}

// Custom hook to check if socket is connected
export function useSocketConnected() {
  const socket = useSocket()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!socket) return

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    setIsConnected(socket.connected)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [socket])

  return isConnected
}

// Custom hook for typing indicator
export function useTypingIndicator(messageId: string | null) {
  const socket = useSocket()
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!socket || !messageId) return

    const handleUserTyping = (data: { userId: string; userName: string; messageId: string }) => {
      if (data.messageId === messageId) {
        setTypingUsers(prev => new Set(prev).add(data.userName))

        // Auto-remove after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev)
            newSet.delete(data.userName)
            return newSet
          })
        }, 3000)
      }
    }

    const handleUserStoppedTyping = (data: { userId: string; messageId: string }) => {
      if (data.messageId === messageId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          // We don't have userName here, so we clear all
          return new Set()
        })
      }
    }

    socket.on('user:typing', handleUserTyping)
    socket.on('user:stopped-typing', handleUserStoppedTyping)

    return () => {
      socket.off('user:typing', handleUserTyping)
      socket.off('user:stopped-typing', handleUserStoppedTyping)
    }
  }, [socket, messageId])

  return Array.from(typingUsers)
}
