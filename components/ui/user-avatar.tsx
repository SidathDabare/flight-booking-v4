"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircleUserRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showFallbackIcon?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8", 
  lg: "h-10 w-10",
  xl: "h-12 w-12",
};

const iconSizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5", 
  xl: "h-6 w-6",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

export function UserAvatar({
  src,
  name,
  email,
  size = "md",
  className,
  showFallbackIcon = true,
}: UserAvatarProps) {
  const getInitials = () => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials();

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {src && <AvatarImage src={src} alt={name || "User"} />}
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-sky-400 text-white">
        {initials ? (
          <span className={textSizeClasses[size]}>{initials}</span>
        ) : showFallbackIcon ? (
          <CircleUserRound className={iconSizeClasses[size]} />
        ) : (
          <span className={textSizeClasses[size]}>U</span>
        )}
      </AvatarFallback>
    </Avatar>
  );
}