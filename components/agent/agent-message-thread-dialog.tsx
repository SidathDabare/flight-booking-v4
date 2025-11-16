"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, User, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

interface Reply {
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

interface Message {
  _id: string;
  subject: string;
  content: string;
  status: string;
  senderName: string;
  senderEmail: string;
  senderRole: string;
  assignedToName?: string;
  assignedTo?: string;
  createdAt: string;
  replies: Reply[];
}

interface AgentMessageThreadDialogProps {
  message: Message;
  open: boolean;
  onClose: () => void;
}

export function AgentMessageThreadDialog({ message: initialMessage, open, onClose }: AgentMessageThreadDialogProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [message, setMessage] = useState<Message>(initialMessage);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && initialMessage._id) {
      fetchMessage();
    }
  }, [open, initialMessage._id]);

  const fetchMessage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/messages/${initialMessage._id}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Error fetching message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptMessage = async () => {
    setIsAccepting(true);

    try {
      const response = await fetch(`/api/messages/${message._id}/accept`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.data);
        toast({
          title: "Success",
          description: "Message accepted successfully",
        });
      } else {
        throw new Error(data.error || "Failed to accept message");
      }
    } catch (error) {
      console.error("Error accepting message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept message",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Reply content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/messages/${message._id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyContent.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setReplyContent("");
        setMessage(data.data);
        toast({
          title: "Success",
          description: "Your reply has been sent",
        });
      } else {
        throw new Error(data.error || "Failed to send reply");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
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
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      accepted: { label: "In Progress", variant: "default" as const },
      resolved: { label: "Resolved", variant: "outline" as const },
      closed: { label: "Closed", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      client: { label: "Client", className: "bg-blue-100 text-blue-800" },
      agent: { label: "Agent", className: "bg-green-100 text-green-800" },
      admin: { label: "Admin", className: "bg-purple-100 text-purple-800" },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.client;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const isMyMessage = message.assignedTo === session?.user?.id;
  const canReply = message.status !== "closed" && message.status !== "pending";
  const canUpdateStatus = message.status !== "closed" && message.status !== "pending";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{message.subject}</DialogTitle>
              <DialogDescription className="mt-1">
                From: {message.senderName} ({message.senderEmail})
              </DialogDescription>
              <DialogDescription>
                Created {format(new Date(message.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(message.status)}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {message.status === "pending" && (
                <Button onClick={handleAcceptMessage} disabled={isAccepting} size="sm">
                  {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isAccepting ? "Accepting..." : "Accept Message"}
                </Button>
              )}

              {canUpdateStatus && (
                <div className="flex items-center gap-2">
                  <Select
                    value={message.status}
                    onValueChange={handleUpdateStatus}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accepted">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            <ScrollArea className="flex-1 pr-4" style={{ maxHeight: "500px" }}>
              <div className="space-y-4">
                {/* Original Message */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-semibold">{message.senderName}</span>
                    {getRoleBadge(message.senderRole)}
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(message.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>

                {message.assignedToName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <User className="h-4 w-4" />
                    <span>Handled by: <strong>{message.assignedToName}</strong></span>
                  </div>
                )}

                {/* Replies */}
                {message.replies && message.replies.length > 0 && (
                  <>
                    <Separator />
                    {message.replies.map((reply, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-semibold">{reply.senderName}</span>
                          {getRoleBadge(reply.senderRole)}
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(reply.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Reply Section */}
            {message.status === "pending" && (
              <div className="text-center py-3 text-muted-foreground text-sm bg-muted rounded-lg">
                Please accept this message first before you can reply
              </div>
            )}

            {canReply && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    maxLength={5000}
                    rows={4}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {replyContent.length}/5000 characters
                    </p>
                    <Button onClick={handleSendReply} disabled={isSubmitting || !replyContent.trim()}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {message.status === "closed" && (
              <div className="text-center py-3 text-muted-foreground text-sm">
                This conversation has been closed. No more replies can be added.
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
