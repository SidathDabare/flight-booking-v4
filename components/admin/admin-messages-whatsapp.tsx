"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search, MessageSquare, RefreshCw } from "lucide-react";
import { AdminConversationItem } from "./AdminConversationItem";
import { AdminChatWindow } from "./AdminChatWindow";

interface Message {
  _id: string;
  subject: string;
  content: string;
  status: "pending" | "accepted" | "resolved" | "closed";
  senderName: string;
  senderEmail: string;
  senderRole: string;
  assignedToName?: string;
  assignedTo?: string;
  createdAt: string;
  replies: any[];
}

// Helper function to check if message is unread for admin/agent (WhatsApp-style)
const isMessageUnread = (message: Message, userId: string): boolean => {
  // For admin/agent: A conversation is "unread" if the last message is from a CLIENT

  // If there are no replies, check the original message
  if (!message.replies || message.replies.length === 0) {
    // If client created the message, it's unread (incoming from client)
    // If admin/agent created it, it's read (you sent it)
    return message.senderRole === "client";
  }

  // Get the last message in the thread
  const lastReply = message.replies[message.replies.length - 1];

  // If the last message is from client, it's unread to admin/agent
  // If the last message is from admin/agent, it's read
  return lastReply.senderRole === "client";
};

export function AdminMessagesWhatsApp() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [readMessageIds, setReadMessageIds] = useState<Set<string>>(new Set());

  const fetchMessages = useCallback(async (silent = false) => {
    try {
      const response = await fetch("/api/messages");

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setMessages(data.messages || []);
      } else {
        throw new Error(data.error || "Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessageId(messageId);
    setShowChat(true);
    // Mark message as read when opened
    setReadMessageIds(prev => new Set(prev).add(messageId));
  };

  const handleBackToList = () => {
    setShowChat(false);
    setSelectedMessageId(null);
    fetchMessages(); // Refresh list when going back
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages();
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.senderEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Optimized polling with idle detection and adaptive intervals
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let lastActivityTime = Date.now();
    const IDLE_POLLING_INTERVAL = 60000; // 1 minute when idle
    const ACTIVE_POLLING_INTERVAL = 30000; // 30 seconds when active
    const IDLE_THRESHOLD = 5 * 60 * 1000; // 5 minutes of inactivity

    const updateActivity = () => {
      lastActivityTime = Date.now();
    };

    const isUserIdle = () => {
      return Date.now() - lastActivityTime > IDLE_THRESHOLD;
    };

    const startPolling = () => {
      const currentInterval = isUserIdle() ? IDLE_POLLING_INTERVAL : ACTIVE_POLLING_INTERVAL;

      interval = setInterval(() => {
        if (!document.hidden) {
          fetchMessages(true); // Silent background polling
        }
      }, currentInterval);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActivity();
        fetchMessages(true); // Silent refresh on tab focus
        clearInterval(interval);
        startPolling();
      } else {
        clearInterval(interval);
      }
    };

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => {
      const wasIdle = isUserIdle();
      updateActivity();

      // Switch from idle to active interval
      if (wasIdle) {
        clearInterval(interval);
        startPolling();
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startPolling();

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [fetchMessages]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col flex-1 overflow-hidden relative">
      <div className="flex-1 flex overflow-hidden max-h-full">
        {/* Conversation List Sidebar */}
        <div
          className={`
            ${showChat ? "hidden md:flex" : "flex"}
            w-full md:w-[400px] flex-col border-r
          `}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Admin Messages</h1>
              <Button
                size="icon"
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageSquare className="h-16 w-16 mb-4" />
                <h3 className="font-semibold mb-2">
                  {searchQuery ? "No results found" : "No messages yet"}
                </h3>
                <p className="text-sm">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Messages from customers will appear here"}
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => {
                const isUnread = isMessageUnread(message, session?.user?.id || "") && !readMessageIds.has(message._id);
                return (
                  <AdminConversationItem
                    key={message._id}
                    id={message._id}
                    subject={message.subject}
                    lastMessage={
                      message.replies.length > 0
                        ? message.replies[message.replies.length - 1].content
                        : message.content
                    }
                    lastMessageTime={
                      message.replies.length > 0
                        ? message.replies[message.replies.length - 1].createdAt
                        : message.createdAt
                    }
                    senderName={message.senderName}
                    senderEmail={message.senderEmail}
                    assignedToName={message.assignedToName}
                    unreadCount={isUnread ? 1 : 0}
                    isActive={selectedMessageId === message._id}
                    status={message.status}
                    onClick={() => handleSelectMessage(message._id)}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div
          className={`
            ${showChat ? "flex" : "hidden md:flex"}
            flex-1 flex-col
          `}
        >
          {selectedMessageId ? (
            <AdminChatWindow
              messageId={selectedMessageId}
              onBack={handleBackToList}
              showBackButton={true}
              onMessageUpdate={fetchMessages}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-20 w-20 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  Admin Message Center
                </h2>
                <p>
                  Select a conversation to view and respond
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
