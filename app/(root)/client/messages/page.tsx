"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { ConversationItem } from "@/components/messages/ConversationItem";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search, MessageSquare } from "lucide-react";
import { useUnreadMessages } from "@/lib/unread-messages-context";
import { useSocket } from "@/lib/socket-context";
import { cn } from "@/lib/utils";

interface MessageReply {
  _id?: string;
  senderRole: string;
  content: string;
  createdAt: string;
  [key: string]: unknown;
}

interface Message {
  _id: string;
  subject: string;
  content: string;
  status: "pending" | "accepted" | "resolved" | "closed";
  senderName: string;
  senderRole: string;
  assignedToName?: string;
  createdAt: string;
  replies: MessageReply[];
}

// Helper function to check if message is unread (WhatsApp-style)
const isMessageUnread = (message: Message, userId: string): boolean => {
  // A conversation is "unread" if the last message is NOT from you (the client)

  // If there are no replies, check the original message
  if (!message.replies || message.replies.length === 0) {
    // If you created the message, it's read (you sent it)
    // If agent/admin created it, it's unread (incoming message)
    return message.senderRole !== "client";
  }

  // Get the last message in the thread
  const lastReply = message.replies[message.replies.length - 1];

  // If the last message is from agent/admin, it's unread to you
  // If the last message is from you (client), it's read
  return lastReply.senderRole !== "client";
};

export default function WhatsAppStyleMessages() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { markAsRead } = useUnreadMessages();
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [readMessageIds, setReadMessageIds] = useState<Set<string>>(new Set());

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/messages");

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const fetchedMessages = data.messages || [];
        setMessages(fetchedMessages);

        // Auto-open the single thread if it exists
        if (fetchedMessages.length === 1 && !selectedMessageId) {
          const message = fetchedMessages[0];
          setSelectedMessageId(message._id);
          setShowChat(true);

          // Mark as read when auto-opened
          if (session?.user?.id) {
            const lastMessageId =
              message.replies.length > 0
                ? message.replies[message.replies.length - 1]._id ||
                  `${message._id}-reply-${message.replies.length - 1}`
                : message._id;

            if (typeof window !== "undefined") {
              localStorage.setItem(
                `lastSeenMessage_${session.user.id}_${message._id}`,
                lastMessageId
              );
              markAsRead(message._id, lastMessageId);
            }
          }
        }
      } else {
        throw new Error(data.error || "Failed to fetch messages");
      }
    } catch (error) {
      // console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load your messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, selectedMessageId, session, markAsRead]);

  const handleSelectMessage = useCallback(
    (messageId: string) => {
      setSelectedMessageId(messageId);
      setShowChat(true);

      // Mark message as read when opened
      setReadMessageIds((prev) => new Set(prev).add(messageId));

      // Find the message to get the last message ID
      const message = messages.find((m) => m._id === messageId);
      if (message && session?.user?.id) {
        // Get the last message ID (either last reply or original message)
        const lastMessageId =
          message.replies.length > 0
            ? message.replies[message.replies.length - 1]._id ||
              `${message._id}-reply-${message.replies.length - 1}`
            : message._id;

        // console.log("💾 Messages page marking as read:", {
        //   messageId,
        //   lastMessageId,
        //   userId: session.user.id,
        //   storageKey: `lastSeenMessage_${session.user.id}_${messageId}`,
        // });

        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `lastSeenMessage_${session.user.id}_${messageId}`,
            lastMessageId
          );

          // Trigger context refresh
          markAsRead(messageId, lastMessageId);
          //console.log("✅ Messages page marked as read");
        }
      }
    },
    [messages, session, markAsRead]
  );

  const handleBackToList = () => {
    setShowChat(false);
    setSelectedMessageId(null);
    fetchMessages(); // Refresh list when going back
  };

  const handleStartConversation = async () => {
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
        await fetchMessages();
        setSelectedMessageId(data.data._id);
        setShowChat(true);
        toast({
          title: "Success",
          description: "Conversation started successfully",
        });
      } else {
        throw new Error(data.error || "Failed to start conversation");
      }
    } catch (error) {
      // console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user.role !== "client") {
      router.push("/unauthorized");
      return;
    }

    fetchMessages();
  }, [session, status, router, fetchMessages]);

  // Socket.IO real-time updates (replaces polling)
  useEffect(() => {
    if (!socket || !session?.user?.id) return;

    //console.log("🔌 Setting up Socket.IO listeners for message list updates");

    // Listen for new messages created
    const handleMessageCreated = (data: unknown) => {
      //console.log("📨 New message created:", data);
      fetchMessages();
    };

    // Listen for message list updates (new replies, etc.)
    const handleMessageListUpdated = (data: unknown) => {
      //console.log("🔄 Message list updated:", data);
      fetchMessages();
    };

    // Listen for new replies in ANY thread
    const handleNewReply = (data: unknown) => {
      //console.log("💬 New reply detected:", data);
      fetchMessages();
    };

    // Listen for message status changes
    const handleStatusUpdate = (data: unknown) => {
      //console.log("📊 Status updated:", data);
      fetchMessages();
    };

    // Listen for message edits
    const handleMessageEdited = (data: unknown) => {
      //console.log("✏️ Message edited:", data);
      fetchMessages();
    };

    // Listen for message deletions
    const handleMessageDeleted = (data: unknown) => {
      //console.log("🗑️ Message deleted:", data);
      fetchMessages();
    };

    // Register all event listeners
    socket.on("message:created", handleMessageCreated);
    socket.on("message:list-updated", handleMessageListUpdated);
    socket.on("message:new-reply", handleNewReply);
    socket.on("message:status-updated", handleStatusUpdate);
    socket.on("message:was-edited", handleMessageEdited);
    socket.on("message:was-deleted", handleMessageDeleted);

    // Refresh on page visibility change (only when tab becomes visible)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Fetch immediately when tab becomes visible (in case of missed events)
        fetchMessages();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      socket.off("message:created", handleMessageCreated);
      socket.off("message:list-updated", handleMessageListUpdated);
      socket.off("message:new-reply", handleNewReply);
      socket.off("message:status-updated", handleStatusUpdate);
      socket.off("message:was-edited", handleMessageEdited);
      socket.off("message:was-deleted", handleMessageDeleted);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [socket, session, fetchMessages]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex-1">
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading your messages...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "client") {
    return null;
  }

  return (
    <div className="container mx-auto h-[calc(100vh-80px)] flex flex-col overflow-hidden relative">
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List Sidebar */}
        <div
          className={cn(
            "w-full lg:w-[400px] flex-col border-r border-gray-200 min-h-0",
            showChat ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 ">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold">Support Chat</h1>
            </div>

            {/* Search - only show if there are messages */}
            {messages.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto pb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-70 p-6 text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  No conversation yet
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Start chatting with our support team!
                </p>
                <Button
                  onClick={handleStartConversation}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Conversation
                </Button>
              </div>
            ) : (
              filteredMessages.map((message) => {
                const isUnread =
                  isMessageUnread(message, session?.user?.id || "") &&
                  !readMessageIds.has(message._id);
                return (
                  <ConversationItem
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
          className={cn(
            "flex-1 flex-col min-h-0",
            showChat ? "flex" : "hidden lg:flex"
          )}
        >
          {selectedMessageId ? (
            <ChatWindow
              messageId={selectedMessageId}
              onBack={handleBackToList}
              showBackButton={true}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-18 w-18 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Welcome to Messages
                </h2>
                <p className="text-gray-600">
                  Select a conversation to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
