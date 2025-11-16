"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Trash2,
  Download,
  FileText,
  Image as ImageIcon,
  Pencil,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MessageStatusIcon } from "@/lib/message-status-utils";
import type { IMessage, IReply } from "@/lib/db/models/Message";

// Generates a consistent color for a given username using hash
const getUserColor = (name: string): string => {
  // Improved hash function with better distribution
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Additional mixing to improve distribution
  hash = Math.abs(hash);
  hash = (hash ^ (hash >>> 16)) * 0x85ebca6b;
  hash = (hash ^ (hash >>> 13)) * 0xc2b2ae35;
  hash = hash ^ (hash >>> 16);

  // Define a palette of visually distinct, readable colors (using actual hex values)
  const colors = [
    "#2563eb", // blue-600
    "#9333ea", // purple-600
    "#db2777", // pink-600
    "#4f46e5", // indigo-600
    "#7c3aed", // violet-600
    "#c026d3", // fuchsia-600
    "#e11d48", // rose-600
    "#0891b2", // cyan-600
    "#0d9488", // teal-600
    "#d97706", // amber-600
    "#ea580c", // orange-600
    "#dc2626", // red-600
  ];

  // Use modulo to select a color from the palette
  const index = Math.abs(hash) % colors.length;
  const color = colors[index];

  // Debug logging
  //console.log('getUserColor:', { name, hash, index, color });

  return color;
};

// Generates a consistent left margin for a given username
const getUserMargin = (name: string): number => {
  // Use similar hash but different seed for margin
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 3) - hash + char; // Different shift value
    hash = hash & hash;
  }

  // Generate margin between 0px and 32px
  const margin = Math.abs(hash) % 33; // 0-32px range
  return margin;
};

interface MessageBubbleProps {
  messageId?: string;
  replyId?: string;
  content: string;
  timestamp: string;
  isOwnMessage: boolean;
  senderName: string;
  isRead?: boolean;
  attachments?: string[];
  isEdited?: boolean;
  onEdit?: (messageId: string, replyId?: string, content?: string) => void;
  onDelete?: (messageId: string, replyId?: string) => void;
  // New props for delivery/read status
  messageData?: Partial<IMessage> | Partial<IReply>;
  recipientId?: string;
  recipientRole?: 'client' | 'agent' | 'admin';
}

export function MessageBubble({
  messageId,
  replyId,
  content,
  timestamp,
  isOwnMessage,
  senderName,
  isRead = false,
  attachments = [],
  isEdited = false,
  onEdit,
  onDelete,
  messageData,
  recipientId,
  recipientRole,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "HH:mm");
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const isPDF = (url: string) => {
    return /\.pdf$/i.test(url);
  };

  const getFileName = (url: string) => {
    try {
      // Extract filename from URL, handling Cloudinary URLs
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      const filename = pathParts[pathParts.length - 1];
      // Decode URI component to handle special characters
      return decodeURIComponent(filename) || "file";
    } catch {
      // Fallback for invalid URLs
      return url.split("/").pop() || "file";
    }
  };

  const handleEdit = () => {
    if (onEdit && messageId) {
      onEdit(messageId, replyId, content);
    }
  };

  const handleDelete = () => {
    if (onDelete && messageId) {
      onDelete(messageId, replyId);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL after a short delay
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to opening in new tab
      window.open(url, "_blank");
    }
  };

  const handlePDFOpen = (url: string) => {
    try {
      // Validate URL before opening
      if (!url || url.trim() === "") {
        console.error("Invalid PDF URL:", url);
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open PDF:", error);
    }
  };

  return (
    <div
      className={cn(
        "flex mb-3 group animate-in fade-in slide-in-from-bottom-2 duration-300",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className="relative max-w-[85%] lg:max-w-[70%]"
        style={
          !isOwnMessage
            ? { marginLeft: `${getUserMargin(senderName)}px` }
            : undefined
        }
      >
        {/* Action Buttons - Shows on hover for own messages */}
        {isOwnMessage && onEdit && onDelete && (
          <div
            className={cn(
              "absolute -top-4 right-2 flex gap-1 z-10 transition-all duration-300 ease-in-out",
              showActions
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 pointer-events-none"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              className="h-7 w-7 rounded-full bg-white shadow-md hover:bg-gray-100 border border-green-500 transition-transform duration-200 hover:scale-110"
              title="Edit"
            >
              <Pencil size={13} strokeWidth={1.5} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-7 w-7 rounded-full bg-white shadow-md hover:bg-red-50 border border-red-500 transition-transform duration-200 hover:scale-110"
              title="Delete"
            >
              <Trash2 size={13} className="text-red-600" />
            </Button>
          </div>
        )}

        <div
          className={cn(
            "relative rounded-2xl px-4 py-2 shadow-md border transition-all duration-200",
            "break-words whitespace-pre-wrap hover:shadow-lg",
            isOwnMessage
              ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-600 rounded-br-none"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 rounded-bl-none"
          )}
        >
          {/* Sender name for received messages */}
          {!isOwnMessage && (
            <div
              className="text-xs font-semibold mb-1"
              style={{ color: getUserColor(senderName) }}
              data-sender={senderName}
            >
              {senderName}
            </div>
          )}

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="mb-2 space-y-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative">
                  {isImage(attachment) ? (
                    <div className="relative rounded-lg overflow-hidden bg-white/10">
                      <Image
                        src={attachment}
                        alt={`Attachment ${index + 1}`}
                        width={250}
                        height={250}
                        className="rounded-lg object-cover max-h-64 w-auto"
                      />
                      <button
                        onClick={() =>
                          handleDownload(attachment, getFileName(attachment))
                        }
                        className={cn(
                          "absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-opacity cursor-pointer",
                          isOwnMessage
                            ? "bg-white/20 hover:bg-white/30"
                            : "bg-black/20 hover:bg-black/30"
                        )}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ) : isPDF(attachment) ? (
                    <button
                      onClick={() => handlePDFOpen(attachment)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border transition-colors cursor-pointer w-full text-left",
                        isOwnMessage
                          ? "bg-white/10 border-white/20 hover:bg-white/20"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      )}
                      title="Open PDF"
                    >
                      <FileText className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm truncate flex-1">
                        {getFileName(attachment)}
                      </span>
                      <Download className="h-4 w-4 flex-shrink-0" />
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleDownload(attachment, getFileName(attachment))
                      }
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border transition-colors cursor-pointer w-full text-left",
                        isOwnMessage
                          ? "bg-white/10 border-white/20 hover:bg-white/20"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      )}
                      title="Download file"
                    >
                      <FileText className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm truncate flex-1">
                        {getFileName(attachment)}
                      </span>
                      <Download className="h-4 w-4 flex-shrink-0" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message content */}
          <div className="text-sm leading-relaxed">{content}</div>

          {/* Edited indicator */}
          {isEdited && (
            <span
              className={cn(
                "text-xs italic mt-1 block",
                isOwnMessage ? "text-white/70" : "text-gray-500"
              )}
            >
              (edited)
            </span>
          )}

          {/* Timestamp and read status */}
          <div
            className={cn(
              "flex items-center justify-end gap-1 mt-1",
              isOwnMessage ? "text-white/80" : "text-gray-500"
            )}
          >
            <span className="text-xs">{formatTime(timestamp)}</span>
            {isOwnMessage && messageData && recipientId && (
              <span className="inline-flex">
                <MessageStatusIcon
                  message={messageData}
                  recipientId={recipientId}
                  recipientRole={recipientRole}
                  size={14}
                />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
