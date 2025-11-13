"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";

interface AgentConversationItemProps {
  id: string;
  subject: string;
  lastMessage: string;
  lastMessageTime: string;
  senderName: string;
  senderEmail: string;
  assignedToName?: string;
  isAssignedToMe?: boolean;
  unreadCount?: number;
  isActive?: boolean;
  status: "pending" | "accepted" | "resolved" | "closed";
  onClick: () => void;
}

export function AgentConversationItem({
  subject,
  lastMessage,
  lastMessageTime,
  senderName,
  senderEmail,
  assignedToName,
  isAssignedToMe = false,
  unreadCount = 0,
  isActive = false,
  status,
  onClick,
}: AgentConversationItemProps) {
  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "accepted":
        return "bg-purple-500";
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
        "flex items-start gap-3 px-4 py-3 cursor-pointer transition-all border-b border-gray-100",
        "hover:bg-gray-50",
        isActive && "bg-purple-50 border-l-4 border-l-purple-500",
        !isActive &&
          unreadCount > 0 &&
          "bg-blue-50/50 border-l-4 border-l-blue-500",
        isAssignedToMe && !isActive && !unreadCount && "bg-purple-50/30"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src="" />
          <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
            {getInitials(senderName)}
          </AvatarFallback>
        </Avatar>
        {/* Status indicator */}
        <div
          className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
            getStatusColor()
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={cn(
                  "text-sm text-gray-900 truncate",
                  unreadCount > 0 ? "font-bold" : "font-semibold"
                )}
              >
                {subject}
              </h3>
              {unreadCount > 0 && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
              {isAssignedToMe && (
                <Badge
                  variant="default"
                  className="text-xs px-1.5 py-0 bg-purple-500"
                >
                  Mine
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {senderName} • {senderEmail}
            </div>
          </div>
          <div className="flex flex-col items-end ml-2 flex-shrink-0 gap-1">
            <span
              className={cn(
                "text-xs",
                unreadCount > 0
                  ? "text-blue-600 font-semibold"
                  : "text-gray-500"
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
            {assignedToName && !isAssignedToMe && (
              <span className="text-purple-600 font-medium flex items-center gap-1">
                <User className="h-3 w-3 inline" />
                {assignedToName}:{" "}
              </span>
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
