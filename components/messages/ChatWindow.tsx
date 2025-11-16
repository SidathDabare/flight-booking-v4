"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { useSocket, useTypingIndicator } from "@/lib/socket-context";
import { useUnreadMessages } from "@/lib/unread-messages-context";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
  assignedTo?: string;
  assignedToName?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  replies: Reply[];
}

interface MessageItem {
  id: string;
  replyId?: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  createdAt: string;
  attachments?: string[];
  isEdited?: boolean;
  fullData?: any; // Full message/reply data for status tracking
}

interface ChatWindowProps {
  messageId: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatWindow({
  messageId,
  onBack,
  showBackButton = false,
}: ChatWindowProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const socket = useSocket();
  const typingUsers = useTypingIndicator(messageId);
  const { markAsRead } = useUnreadMessages();
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialPageLoad, setIsInitialPageLoad] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);
  const userScrolledUpRef = useRef<boolean>(false);
  const shouldScrollToBottomRef = useRef<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasMarkedAsReadRef = useRef<boolean>(false);

  // Edit state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | undefined>(
    undefined
  );
  const [editContent, setEditContent] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Delete state
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null
  );
  const [deletingReplyId, setDeletingReplyId] = useState<string | undefined>(
    undefined
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMessage = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages/${messageId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.message);
      } else {
        throw new Error(data.error || "Failed to fetch message");
      }
    } catch (error) {
      console.error("Error fetching message:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsInitialPageLoad(false);
    }
  }, [messageId, toast]);

  const handleSendMessage = async (content: string, attachments?: string[]) => {
    if (!message) return;

    try {
      const response = await fetch(`/api/messages/${message._id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, attachments: attachments || [] }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.data);
        // Always scroll to bottom after sending a message
        userScrolledUpRef.current = false;
        setTimeout(() => scrollToBottom(true), 100);
        // toast({
        //   title: "Success",
        //   description: "Message sent",
        // });
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Handle edit
  const handleEdit = useCallback(
    (msgId: string, replyId?: string, currentContent?: string) => {
      setEditingMessageId(msgId);
      setEditingReplyId(replyId);
      setEditContent(currentContent || "");
      setIsEditDialogOpen(true);
    },
    []
  );

  const handleEditSubmit = async () => {
    if (!editContent.trim() || !editingMessageId) return;

    setIsEditing(true);
    try {
      const response = await fetch(`/api/messages/${editingMessageId}/edit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editContent.trim(),
          replyId: editingReplyId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.data);
        setIsEditDialogOpen(false);
        // toast({
        //   title: "Success",
        //   description: "Message updated",
        // });
      } else {
        throw new Error(data.error || "Failed to update message");
      }
    } catch (error) {
      console.error("Error editing message:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update message",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  // Handle delete
  const handleDelete = useCallback((msgId: string, replyId?: string) => {
    setDeletingMessageId(msgId);
    setDeletingReplyId(replyId);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingMessageId) return;

    setIsDeleting(true);
    try {
      const url = deletingReplyId
        ? `/api/messages/${deletingMessageId}/delete?replyId=${deletingReplyId}`
        : `/api/messages/${deletingMessageId}/delete`;

      const response = await fetch(url, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (deletingReplyId) {
          // Reply deleted, update message
          setMessage(data.data);
          // toast({
          //   title: "Success",
          //   description: "Message deleted",
          // });
        } else {
          // Entire thread deleted, close dialog
          // toast({
          //   title: "Success",
          //   description: "Conversation deleted",
          // });
          if (onBack) {
            onBack();
          }
        }
        setIsDeleteDialogOpen(false);
      } else {
        throw new Error(data.error || "Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete message",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((smooth = true) => {
    const container = scrollRef.current;
    if (!container) return;

    if (smooth) {
      // Smooth scroll using scrollIntoView
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    } else {
      // Instant scroll using scrollTop (more reliable)
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Check if user is near bottom of scroll
  const isNearBottom = useCallback(() => {
    if (!scrollRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const threshold = 100; // pixels from bottom
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  // Helper function to group messages by date
  const groupMessagesByDate = useCallback(
    (messages: MessageItem[]) => {
      const groups: { [key: string]: MessageItem[] } = {};

      messages.forEach((msg) => {
        const date = new Date(msg.createdAt);
        const dateKey = format(date, "yyyy-MM-dd");

        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(msg);
      });

      return groups;
    },
    []
  );

  // Helper function to format date labels (WhatsApp style)
  const formatDateLabel = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateKey = format(date, "yyyy-MM-dd");
    const todayKey = format(today, "yyyy-MM-dd");
    const yesterdayKey = format(yesterday, "yyyy-MM-dd");

    if (dateKey === todayKey) {
      return "Today";
    } else if (dateKey === yesterdayKey) {
      return "Yesterday";
    } else {
      return format(date, "MMMM dd, yyyy");
    }
  }, []);

  // Prepare all messages array
  const allMessages = useMemo(() => {
    if (!message) return [];

    return [
      {
        id: message._id,
        content: message.content,
        senderId: message.senderId,
        senderName: message.senderName,
        senderRole: message.senderRole,
        createdAt: message.createdAt,
        attachments: message.attachments,
        isEdited: message.isEdited,
        fullData: message, // Include full message data for status tracking
      },
      ...message.replies.map((reply, index) => ({
        id: reply._id || `${message._id}-reply-temp-${index}`,
        replyId: reply._id,
        content: reply.content,
        senderId: reply.senderId,
        senderName: reply.senderName,
        senderRole: reply.senderRole,
        createdAt: reply.createdAt,
        attachments: reply.attachments,
        isEdited: reply.isEdited,
        fullData: reply, // Include full reply data for status tracking
      })),
    ];
  }, [message]);

  // Group messages by date with memoization for performance
  const groupedMessages = useMemo(
    () => groupMessagesByDate(allMessages),
    [allMessages, groupMessagesByDate]
  );

  // Track user scroll behavior
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      userScrolledUpRef.current = !isNearBottom();
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [isNearBottom]);

  useEffect(() => {
    if (messageId) {
      setIsLoading(true);
      setMessage(null); // Clear previous message
      fetchMessage();
      previousMessageCountRef.current = 0;
      isInitialLoadRef.current = true;
      userScrolledUpRef.current = false;
      shouldScrollToBottomRef.current = true; // Mark that we should scroll when data loads
    }
  }, [messageId, fetchMessage]);

  // Smart scroll: Only scroll to bottom when appropriate
  useEffect(() => {
    if (!message || isLoading) return;

    const currentMessageCount = 1 + (message.replies?.length || 0);
    const previousCount = previousMessageCountRef.current;

    // First load of THIS conversation: always scroll to bottom
    if (isInitialLoadRef.current && currentMessageCount > 0) {
      isInitialLoadRef.current = false;
      previousMessageCountRef.current = currentMessageCount;
      shouldScrollToBottomRef.current = false;

      // Multiple RAF + timeout for maximum reliability
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            scrollToBottom(false);
          }, 100);
        });
      });
      return;
    }

    // Handle case where we flagged to scroll
    if (shouldScrollToBottomRef.current && currentMessageCount > 0) {
      shouldScrollToBottomRef.current = false;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            scrollToBottom(false);
          }, 100);
        });
      });
      return;
    }

    // Message count changed
    if (currentMessageCount !== previousCount) {
      previousMessageCountRef.current = currentMessageCount;

      // New message arrived: only scroll if user hasn't scrolled up
      if (currentMessageCount > previousCount && !userScrolledUpRef.current) {
        setTimeout(() => scrollToBottom(true), 50);
      }
    }
  }, [allMessages.length, scrollToBottom, isLoading, message]);

  // Socket.IO real-time updates (replaces polling)
  useEffect(() => {
    if (!socket || !messageId) return;

    console.log("🔌 Joining thread:", messageId);

    // Join the message thread room
    socket.emit("join:thread", messageId);

    // Listen for new replies
    const handleNewReply = (data: unknown) => {
      console.log("📨 New reply received:", data);
      // Refresh the message to get latest data
      fetchMessage();
    };

    // Listen for message edits
    const handleMessageEdited = (data: unknown) => {
      console.log("✏️ Message edited:", data);
      if (
        typeof data === "object" &&
        data !== null &&
        "messageId" in data &&
        data.messageId === messageId
      ) {
        fetchMessage();
      }
    };

    // Listen for message deletions
    const handleMessageDeleted = (data: unknown) => {
      console.log("🗑️ Message deleted:", data);
      if (
        typeof data === "object" &&
        data !== null &&
        "messageId" in data &&
        data.messageId === messageId
      ) {
        fetchMessage();
      }
    };

    // Listen for status changes
    const handleStatusUpdate = (data: unknown) => {
      console.log("📊 Status updated:", data);
      if (
        typeof data === "object" &&
        data !== null &&
        "messageId" in data &&
        data.messageId === messageId
      ) {
        fetchMessage();
      }
    };

    // Listen for message accepted
    const handleMessageAccepted = (data: unknown) => {
      console.log("✅ Message accepted:", data);
      if (
        typeof data === "object" &&
        data !== null &&
        "messageId" in data &&
        data.messageId === messageId
      ) {
        fetchMessage();
      }
    };

    // Listen for message marked as read
    const handleMessageMarkedRead = (data: unknown) => {
      console.log("👁️ Message marked as read:", data);
      if (
        typeof data === "object" &&
        data !== null &&
        "messageId" in data &&
        data.messageId === messageId
      ) {
        fetchMessage(); // Refresh to get updated readBy status
      }
    };

    // Listen for message marked as delivered
    const handleMessageMarkedDelivered = (data: unknown) => {
      console.log("📫 Message marked as delivered:", data);
      if (
        typeof data === "object" &&
        data !== null &&
        "messageId" in data &&
        data.messageId === messageId
      ) {
        fetchMessage(); // Refresh to get updated deliveredTo status
      }
    };

    // Register event listeners
    socket.on("message:new-reply", handleNewReply);
    socket.on("message:was-edited", handleMessageEdited);
    socket.on("message:was-deleted", handleMessageDeleted);
    socket.on("message:status-updated", handleStatusUpdate);
    socket.on("message:was-accepted", handleMessageAccepted);
    socket.on("message:marked-read", handleMessageMarkedRead);
    socket.on("message:marked-delivered", handleMessageMarkedDelivered);

    // Cleanup on unmount
    return () => {
      console.log("🔌 Leaving thread:", messageId);
      socket.emit("leave:thread", messageId);
      socket.off("message:new-reply", handleNewReply);
      socket.off("message:was-edited", handleMessageEdited);
      socket.off("message:was-deleted", handleMessageDeleted);
      socket.off("message:status-updated", handleStatusUpdate);
      socket.off("message:was-accepted", handleMessageAccepted);
      socket.off("message:marked-read", handleMessageMarkedRead);
      socket.off("message:marked-delivered", handleMessageMarkedDelivered);
    };
  }, [socket, messageId, fetchMessage]);

  // Mark messages as read after viewing for 2 seconds
  useEffect(() => {
    if (!message || !messageId || !session?.user?.id) return;

    // Reset marker when message changes
    hasMarkedAsReadRef.current = false;

    // Wait 2 seconds before marking as read (gives user time to see messages)
    const timer = setTimeout(() => {
      if (hasMarkedAsReadRef.current) return; // Already marked

      // Get the last message ID (either last reply or original message)
      const lastMessageId =
        message.replies.length > 0
          ? message.replies[message.replies.length - 1]._id ||
            `${message._id}-reply-${message.replies.length - 1}`
          : message._id;

      console.log("💾 ChatWindow marking as read:", {
        messageId,
        lastMessageId,
        userId: session.user.id,
        storageKey: `lastSeenMessage_${session.user.id}_${messageId}`,
      });

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `lastSeenMessage_${session.user.id}_${messageId}`,
          lastMessageId
        );

        // Trigger context refresh
        markAsRead(messageId, lastMessageId);
        hasMarkedAsReadRef.current = true;
        console.log("✅ ChatWindow marked as read");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [message, messageId, session, markAsRead]);

  // Only show loading screen on initial page load, not when switching conversations
  if (isInitialPageLoad && isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-sm text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!message && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Message not found</p>
      </div>
    );
  }

  if (!message) return null; // Waiting for data during conversation switch

  const canReply = message.status !== "closed";

  return (
    <>
      <div className="flex flex-1 flex-col relative bg-gray-50 min-h-0">
        {/* Header - Fixed */}
        <div className="flex-shrink-0">
          <ChatHeader
            subject={message.subject}
            assignedToName={message.assignedToName}
            status={message.status}
            onBack={onBack}
            showBackButton={showBackButton}
          />
        </div>

        {/* Messages Area - Scrollable */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-gray-50 p-4 pb-24 lg:p-8 lg:pb-32"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23d1d5db" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')',
          }}
        >
          <div className="max-w-full lg:max-w-3xl xl:max-w-4xl mx-auto">
            {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
              <div key={dateKey}>
                {/* Date Separator - WhatsApp Style */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground font-medium shadow-sm">
                    {formatDateLabel(dateKey)}
                  </div>
                </div>

                {/* Messages for this date */}
                {msgs.map((msg: MessageItem) => {
                  const isOwnMessage = msg.senderId === session?.user?.id;

                  // Determine recipient: the person who should receive/read the message
                  // If this is MY message, show status for the OTHER person
                  let recipientId: string | undefined;
                  if (isOwnMessage) {
                    // I sent this message, so recipient is the other party
                    if (msg.senderRole === 'client') {
                      // Client sent message → recipient is agent/admin
                      recipientId = message.assignedTo?.toString();
                    } else {
                      // Agent/admin sent reply → recipient is client
                      recipientId = message.senderId?.toString();
                    }
                  }

                  return (
                    <MessageBubble
                      key={msg.id}
                      messageId={message._id}
                      replyId={msg.replyId}
                      content={msg.content}
                      timestamp={msg.createdAt}
                      isOwnMessage={isOwnMessage}
                      senderName={msg.senderName}
                      isRead={false}
                      attachments={msg.attachments}
                      isEdited={msg.isEdited}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      messageData={msg.fullData}
                      recipientId={recipientId}
                    />
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Fixed */}
        <div className="flex-shrink-0 absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          {canReply ? (
            <ChatInput
              onSendMessage={handleSendMessage}
              placeholder="Type your message..."
            />
          ) : (
            <div className="border-t border-gray-200 bg-gray-100 p-4 text-center">
              <p className="text-sm text-gray-600">
                This conversation has been closed. No more messages can be sent.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[100px]"
              maxLength={5000}
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {editContent.length}/5000
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isEditing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={!editContent.trim() || isEditing}
              className="bg-green-500 hover:bg-green-600"
            >
              {isEditing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingReplyId
                ? "Are you sure you want to delete this message? This action cannot be undone."
                : "Are you sure you want to delete this entire conversation? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
