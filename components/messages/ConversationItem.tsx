"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ConversationItemProps {
  id: string;
  subject: string;
  lastMessage: string;
  lastMessageTime: string;
  senderName: string;
  assignedToName?: string;
  unreadCount?: number;
  isActive?: boolean;
  status: "pending" | "accepted" | "resolved" | "closed";
  onClick: () => void;
}

export function ConversationItem({
  subject,
  lastMessage,
  lastMessageTime,
  senderName,
  assignedToName,
  unreadCount = 0,
  isActive = false,
  status,
  onClick,
}: ConversationItemProps) {
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
        "flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b border-gray-100",
        "hover:bg-gray-50",
        isActive && "bg-gray-100 border-l-4 border-l-green-500",
        !isActive &&
          unreadCount > 0 &&
          "bg-blue-50/50 border-l-4 border-l-blue-500"
      )}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src="" />
          <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
            {getInitials(assignedToName || "Support")}
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
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
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
          </div>
          <span
            className={cn(
              "text-xs ml-2 flex-shrink-0",
              unreadCount > 0 ? "text-blue-600 font-semibold" : "text-gray-500"
            )}
          >
            {formatTime(lastMessageTime)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div
            className={cn(
              "text-sm truncate",
              unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-600"
            )}
          >
            {assignedToName && (
              <span className="text-green-600 font-medium">
                {assignedToName}:{" "}
              </span>
            )}
            {lastMessage}
          </div>
          {unreadCount > 0 && (
            <div className="w-3 h-3 bg-blue-500 rounded-full ml-2 flex-shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}
