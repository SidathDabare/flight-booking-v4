"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { MessageCircleMore, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  ChatDialog,
  ChatDialogContent,
  ChatDialogTitle,
  VisuallyHidden,
} from "@/components/ui/chat-dialog";

import { Button } from "@/components/ui/button";
import { useUnreadMessages } from "@/lib/unread-messages-context";
import { ChatPopUpChatWindow } from "./ChatPopUpChatWindow";

interface Reply {
  _id?: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
}

interface Message {
  _id: string;
  subject: string;
  content: string;
  status: "pending" | "accepted" | "resolved" | "closed";
  senderName: string;
  senderRole: string;
  senderId: string;
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  replies: Reply[];
}

export function ClientChatPopup() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const { unreadCount, markAsRead } = useUnreadMessages();
  const [isOpen, setIsOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasThread, setHasThread] = useState(false);

  // Track the last message ID the user has seen
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(
    null
  );

  // Track whether the user has actually viewed the chat window
  const hasViewedRef = useRef(false);

  // Fetch existing thread
  const fetchThread = useCallback(async () => {
    try {
      const response = await fetch("/api/messages");
      const data = await response.json();

      if (data.success && data.messages.length > 0) {
        const thread = data.messages[0] as Message;
        setThreadId(thread._id);
        setHasThread(true);
      } else {
        setHasThread(false);
        setThreadId(null);
      }
    } catch (error) {
      console.error("Error fetching thread:", error);
    }
  }, []);

  // Create new thread
  const createThread = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "Support Request",
          content: "Hi, I need assistance.",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setThreadId(data.data._id);
        setHasThread(true);
        setIsOpen(true);
        // Mark the initial message as seen
        setLastSeenMessageId(data.data._id);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to start conversation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating thread:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening chat
  const handleOpenChat = async () => {
    if (!hasThread) {
      await createThread();
    } else {
      setIsOpen(true);
      hasViewedRef.current = false; // Reset view tracking
    }
  };

  // Mark messages as read when user actually views them
  const markMessagesAsRead = useCallback(async () => {
    if (!threadId || !isOpen) return;

    try {
      const response = await fetch("/api/messages");
      const data = await response.json();

      if (data.success && data.messages.length > 0) {
        const thread = data.messages[0] as Message;

        // Get the last message ID (either last reply or original message)
        const lastMessageId =
          thread.replies.length > 0
            ? thread.replies[thread.replies.length - 1]._id ||
              `${thread._id}-reply-${thread.replies.length - 1}`
            : thread._id;

        // Mark as viewed and update last seen message
        hasViewedRef.current = true;
        setLastSeenMessageId(lastMessageId);

        console.log("💾 ClientChatPopup marking as read:", {
          threadId,
          lastMessageId,
          userId: session?.user?.id,
          storageKey: `lastSeenMessage_${session?.user?.id}_${threadId}`,
        });

        // Persist to localStorage for cross-session tracking
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `lastSeenMessage_${session?.user?.id}_${threadId}`,
            lastMessageId
          );

          // Use context's markAsRead to trigger synchronization
          markAsRead(threadId, lastMessageId);
          console.log("✅ ClientChatPopup marked as read");
        }
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [threadId, isOpen, session, markAsRead]);

  // Load last seen message from localStorage on mount
  useEffect(() => {
    if (threadId && session?.user?.id && typeof window !== "undefined") {
      const savedLastSeen = localStorage.getItem(
        `lastSeenMessage_${session.user.id}_${threadId}`
      );
      if (savedLastSeen) {
        setLastSeenMessageId(savedLastSeen);
      }
    }
  }, [threadId, session]);

  // Fetch thread on mount and set up polling
  useEffect(() => {
    fetchThread();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchThread, 10000);

    // Refresh on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchThread();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchThread]);

  // Mark as read after a short delay when popup opens (user has time to see messages)
  useEffect(() => {
    if (isOpen && threadId) {
      // Wait 2 seconds after opening before marking as read
      // This gives user time to actually view the messages
      const timer = setTimeout(() => {
        markMessagesAsRead();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, threadId, markMessagesAsRead]);

  // Refresh thread when dialog closes
  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Refresh thread data when closing
      setTimeout(fetchThread, 500);
      hasViewedRef.current = false;
    }
  };

  // Only render for signed-in clients
  if (status === "loading") return null;
  if (!session || session.user.role !== "client") return null;

  return (
    <>
      {/* Floating Chat Button - Modern Design */}
      <button
        onClick={handleOpenChat}
        disabled={isLoading}
        className={cn(
          "fixed bottom-6 right-6 z-40",
          "w-16 h-16 rounded-full",
          "bg-gradient-to-tr from-green-500 via-green-600 to-emerald-600",
          "hover:from-green-600 hover:via-green-700 hover:to-emerald-700",
          "text-white flex items-center justify-center",
          "transition-all duration-300 ease-out",
          "hover:scale-110 hover:shadow-2xl hover:shadow-green-500/40 active:scale-95",
          "focus:outline-none focus:ring-4 focus:ring-green-400/50 focus:ring-offset-2",
          "shadow-xl shadow-green-600/30",
          "before:absolute before:inset-0 before:rounded-full before:bg-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
        aria-label="Open support chat"
      >
        <div className="relative z-10">
          {isLoading ? (
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <MessageCircleMore className="h-7 w-7 drop-shadow-lg" />
          )}
        </div>

        {/* Unread Badge - Pulsing Animation */}
        {unreadCount > 0 && !isOpen && (
          <span
            className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center font-bold shadow-lg shadow-red-500/50 ring-2 ring-white animate-bounce"
            aria-label={`${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Pulse Ring Animation */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
        )}
      </button>

      {/* Chat Dialog Window */}
      <ChatDialog open={isOpen} onOpenChange={handleDialogChange}>
        <ChatDialogContent onMinimize={() => setIsOpen(false)} className="p-0">
          <VisuallyHidden>
            <ChatDialogTitle>Support Chat</ChatDialogTitle>
          </VisuallyHidden>
          {threadId ? (
            <ChatPopUpChatWindow
              messageId={threadId}
              onBack={() => setIsOpen(false)}
              showBackButton={false}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-green-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <MessageSquare className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Welcome to Support Chat
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6 max-w-xs">
                Have a question? Our team is ready to assist you. Start a
                conversation now!
              </p>
              <Button
                onClick={createThread}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-6 text-base font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Starting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <MessageCircleMore className="h-5 w-5" />
                    Start Chat
                  </div>
                )}
              </Button>
            </div>
          )}
        </ChatDialogContent>
      </ChatDialog>
    </>
  );
}
