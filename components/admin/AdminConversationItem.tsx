"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface AdminConversationItemProps {
  id: string;
  subject: string;
  lastMessage: string;
  lastMessageTime: string;
  senderName: string;
  senderEmail: string;
  assignedToName?: string;
  unreadCount?: number;
  isActive?: boolean;
  status: "pending" | "accepted" | "resolved" | "closed";
  onClick: () => void;
}

export function AdminConversationItem({
  subject,
  lastMessage,
  lastMessageTime,
  senderName,
  senderEmail,
  assignedToName,
  unreadCount = 0,
  isActive = false,
  status,
  onClick,
}: AdminConversationItemProps) {
  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "accepted":
        return "bg-blue-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "pending":
        return "Pending";
      case "accepted":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    } catch {
      return "";
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 px-4 py-3 cursor-pointer transition-all border-b",
        "hover:bg-gray-900/10",
        isActive && "bg-gray-900/10 border-l-4 border-l-green-500",
        !isActive &&
          unreadCount > 0 &&
          "bg-blue-50/50 border-l-4 border-l-blue-500"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src="" />
          <AvatarFallback className="font-semibold">
            {getInitials(senderName)}
          </AvatarFallback>
        </Avatar>
        {/* Status indicator */}
        <div
          className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
            getStatusColor()
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <div className="flex-1 min-w-0 flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "text-sm truncate",
                  unreadCount > 0 ? "font-bold" : "font-semibold"
                )}
              >
                {subject}
              </h3>
              <div className="text-xs truncate">
                {senderName} • {senderEmail}
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          <div className="flex flex-col items-end ml-2 flex-shrink-0 gap-1">
            <span
              className={cn(
                "text-xs",
                unreadCount > 0 ? "text-blue-600 font-semibold" : ""
              )}
            >
              {formatTime(lastMessageTime)}
            </span>
            <Badge
              variant={
                status === "pending"
                  ? "destructive"
                  : status === "accepted"
                    ? "default"
                    : "outline"
              }
              className="text-xs px-1.5 py-0"
            >
              {getStatusLabel()}
            </Badge>
          </div>
        </div>

        <div className="flex justify-between items-center gap-2">
          <div
            className={cn(
              "text-sm truncate flex-1",
              unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-600"
            )}
          >
            {assignedToName && (
              <span className="font-medium">{assignedToName}: </span>
            )}
            {lastMessage}
          </div>
          {unreadCount > 0 && (
            <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}
