"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  subject: string;
  assignedToName?: string;
  status: "pending" | "accepted" | "resolved" | "closed";
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatHeader({
  subject,
  assignedToName,
  status,
  onBack,
  showBackButton = false,
}: ChatHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = () => {
    const statusConfig = {
      pending: { label: "Pending", className: "" },
      accepted: {
        label: "In Progress",
        className: "",
      },
      resolved: { label: "Resolved", className: "" },
      closed: { label: "Closed", className: "" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={cn("text-xs", config.className)}>{config.label}</Badge>
    );
  };

  return (
    <div className="flex items-center gap-3 p-2 border-b">
      {/* Back button for mobile and tablet */}
      {showBackButton && onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="lg:hidden h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      {/* Avatar */}
      <Avatar className="h-10 w-10 hidden lg:inline-flex">
        <AvatarImage src="" />
        <AvatarFallback className="font-semibold text-sm">
          {getInitials(assignedToName || "Support")}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0 flex justify-between items-center">
        <div className="text-sm truncate block">
          <span className="font-semibold">{subject}</span>
          <span>
            {" "}
            {assignedToName && (
              <div className="text-xs truncate">With {assignedToName}</div>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div> {getStatusBadge()}</div>
        </div>
      </div>

      {/* Actions */}
      {/* <Button variant="ghost" size="icon">
        <MoreVertical className="h-5 w-5 " />
      </Button> */}
    </div>
  );
}
