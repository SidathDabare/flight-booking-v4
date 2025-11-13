"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { useUnreadMessages } from "@/lib/unread-messages-context";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { ChatHeader } from "@/components/messages/ChatHeader";
import { MessageBubble } from "@/components/messages/MessageBubble";
import { ChatInput } from "@/components/messages/ChatInput";
import { Loader2, CheckCircle } from "lucide-react";
import { format } from "date-fns";

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
  senderEmail: string;
  assignedToName?: string;
  assignedTo?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  replies: Reply[];
}

interface AdminChatWindowProps {
  messageId: string;
  onBack?: () => void;
  showBackButton?: boolean;
  onMessageUpdate?: () => void;
}

export function AdminChatWindow({
  messageId,
  onBack,
  showBackButton = false,
  onMessageUpdate,
}: AdminChatWindowProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { markAsRead } = useUnreadMessages();
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);
  const userScrolledUpRef = useRef<boolean>(false);
  const shouldScrollToBottomRef = useRef<boolean>(false);

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

  const fetchMessage = useCallback(
    async (silent = false) => {
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
        if (!silent) {
          toast({
            title: "Error",
            description: "Failed to load conversation",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [messageId, toast]
  );

  const handleStatusChange = async (newStatus: string) => {
    if (!message) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/messages/${message._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.data);
        onMessageUpdate?.();
        toast({
          title: "Success",
          description: `Message status updated to ${newStatus}`,
        });
      } else {
        throw new Error(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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
        onMessageUpdate?.();
        userScrolledUpRef.current = false;
        setTimeout(() => scrollToBottom(true), 100);
        // toast({
        //   title: "Success",
        //   description: "Message sent",
        // });
        console.log("Message Sent");
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

  const scrollToBottom = useCallback((smooth = true) => {
    const container = scrollRef.current;
    if (!container) return;

    if (smooth) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  const isNearBottom = useCallback(() => {
    if (!scrollRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const threshold = 100;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  // Helper function to group messages by date
  const groupMessagesByDate = useCallback(
    (
      messages: Array<{
        id: string;
        content: string;
        senderId: string;
        senderName: string;
        senderRole: string;
        createdAt: string;
        attachments?: string[];
        isEdited?: boolean;
      }>
    ) => {
      const groups: { [key: string]: typeof messages } = {};

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
      })),
    ];
  }, [message]);

  // Group messages by date with memoization for performance
  const groupedMessages = useMemo(
    () => groupMessagesByDate(allMessages),
    [allMessages, groupMessagesByDate]
  );

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
      setMessage(null);
      fetchMessage();
      previousMessageCountRef.current = 0;
      isInitialLoadRef.current = true;
      userScrolledUpRef.current = false;
      shouldScrollToBottomRef.current = true;
    }
  }, [messageId, fetchMessage]);

  useEffect(() => {
    if (!message || isLoading) return;

    const currentMessageCount = 1 + (message.replies?.length || 0);
    const previousCount = previousMessageCountRef.current;

    if (isInitialLoadRef.current && currentMessageCount > 0) {
      isInitialLoadRef.current = false;
      previousMessageCountRef.current = currentMessageCount;
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

    if (currentMessageCount !== previousCount) {
      previousMessageCountRef.current = currentMessageCount;

      if (currentMessageCount > previousCount && !userScrolledUpRef.current) {
        setTimeout(() => scrollToBottom(true), 50);
      }
    }
  }, [allMessages.length, scrollToBottom, isLoading, message]);

  // Optimized polling with idle detection
  useEffect(() => {
    if (!messageId) return;

    let interval: NodeJS.Timeout;
    let lastActivityTime = Date.now();
    const IDLE_POLLING_INTERVAL = 45000; // 45 seconds when idle
    const ACTIVE_POLLING_INTERVAL = 20000; // 20 seconds when active
    const IDLE_THRESHOLD = 3 * 60 * 1000; // 3 minutes of inactivity

    const updateActivity = () => {
      lastActivityTime = Date.now();
    };

    const isUserIdle = () => {
      return Date.now() - lastActivityTime > IDLE_THRESHOLD;
    };

    const startPolling = () => {
      const currentInterval = isUserIdle()
        ? IDLE_POLLING_INTERVAL
        : ACTIVE_POLLING_INTERVAL;

      interval = setInterval(() => {
        if (!document.hidden) {
          fetchMessage(true); // Silent polling
        }
      }, currentInterval);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActivity();
        fetchMessage(true); // Silent refresh on tab focus
        clearInterval(interval);
        startPolling();
      } else {
        clearInterval(interval);
      }
    };

    // Track user activity (typing, scrolling in chat)
    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];
    const handleActivity = () => {
      const wasIdle = isUserIdle();
      updateActivity();

      // Switch from idle to active interval
      if (wasIdle) {
        clearInterval(interval);
        startPolling();
      }
    };

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startPolling();

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [messageId, fetchMessage]);

  // Track last seen message in localStorage when admin views the conversation
  useEffect(() => {
    if (!message || !session?.user?.id || isLoading) return;

    // Get the last message ID in the thread
    const lastMessageId =
      message.replies && message.replies.length > 0
        ? message.replies[message.replies.length - 1]._id ||
          `${message._id}-reply-${message.replies.length - 1}`
        : message._id;

    console.log("💾 Saving last seen message for admin:", {
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

      // Trigger markAsRead to update the unread count
      markAsRead(messageId, lastMessageId);
    }
  }, [message, messageId, session, isLoading, markAsRead]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Message not found</p>
      </div>
    );
  }

  const canReply = message.status !== "closed";

  return (
    <>
      <div className="flex flex-col h-full max-h-full relative">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 border-b">
          <ChatHeader
            subject={message.subject}
            assignedToName={message.assignedToName}
            status={message.status}
            onBack={onBack}
            showBackButton={showBackButton}
          />

          {/* Admin Controls */}
          <div className="px-4 py-3 border-t">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Customer:</span>
                <span>{message.senderName}</span>
                <span>({message.senderEmail})</span>
              </div>

              <div className="flex items-center gap-3 md:ml-auto">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Select
                    value={message.status}
                    onValueChange={handleStatusChange}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {message.status === "accepted" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange("resolved")}
                    disabled={isUpdatingStatus}
                    className="h-8"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area - Scrollable */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
              <div key={dateKey}>
                {/* Date Separator - WhatsApp Style */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground font-medium shadow-sm">
                    {formatDateLabel(dateKey)}
                  </div>
                </div>

                {/* Messages for this date */}
                {msgs.map((msg: any) => (
                  <MessageBubble
                    key={msg.id}
                    messageId={message._id}
                    replyId={msg.replyId}
                    content={msg.content}
                    timestamp={msg.createdAt}
                    isOwnMessage={msg.senderId === session?.user?.id}
                    senderName={msg.senderName}
                    isRead={false}
                    attachments={msg.attachments}
                    isEdited={msg.isEdited}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Fixed */}
        <div className="flex-shrink-0 border-t ">
          {canReply ? (
            <ChatInput
              onSendMessage={handleSendMessage}
              placeholder="Type your response..."
            />
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm">
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
