"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Send,
  Loader2,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: string[]) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validate total file count
    if (selectedFiles.length + files.length > 5) {
      toast({
        title: "Too many files",
        description: "You can upload a maximum of 5 files at once",
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Each file must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];

    const invalidFiles = files.filter(
      (file) => !allowedTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description:
          "Please upload only images, PDFs, Word documents, Excel files, or text files",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);

    // Clear input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];

    setIsUploading(true);

    try {
      // Upload files one by one to Cloudinary
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "attachment");

        const response = await fetch("/api/upload/attachments", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to upload file");
        }

        return data.fileUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      return uploadedUrls;
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      (!message.trim() && selectedFiles.length === 0) ||
      isSubmitting ||
      disabled
    )
      return;

    setIsSubmitting(true);
    try {
      // Upload files first if any
      let attachmentUrls: string[] = [];
      if (selectedFiles.length > 0) {
        attachmentUrls = await uploadFiles();
      }

      // Send message with attachments
      await onSendMessage(message.trim() || "📎 Attachment", attachmentUrls);

      // Clear state
      setMessage("");
      setSelectedFiles([]);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  const isImage = (file: File) => {
    return file.type.startsWith("image/");
  };

  const getFileIcon = (file: File) => {
    if (isImage(file)) {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="border-t bg-background">
      {/* File previews */}
      {selectedFiles.length > 0 && (
        <div className="p-3 border-b bg-muted/30">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="relative group bg-background border rounded-lg p-2 flex items-center gap-2 max-w-[200px]"
              >
                {isImage(file) ? (
                  <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    {getFileIcon(file)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {file.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Select files to attach"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSubmitting || isUploading}
          className="flex-shrink-0"
          aria-label="Attach files"
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach files</span>
        </Button>

        <div className="flex items-center flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSubmitting || isUploading}
            rows={1}
            maxLength={5000}
            className={cn(
              "w-full resize-none rounded-lg border px-4 py-2.5 pr-12",
              "bg-background text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "text-sm leading-relaxed transition-all"
            )}
            style={{ maxHeight: "120px" }}
            aria-label="Message input"
          />
          <div className="absolute bottom-2 right-2 font-small text-muted-foreground">
            {message.length}/5000
          </div>
        </div>

        <Button
          type="submit"
          disabled={
            (!message.trim() && selectedFiles.length === 0) ||
            isSubmitting ||
            isUploading ||
            disabled
          }
          className={cn(
            "h-10 w-10 rounded-full flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600",
            "flex items-center justify-center transition-all",
            "hover:from-green-600 hover:to-green-700 hover:scale-105 active:scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          )}
          aria-label="Send message"
        >
          {isSubmitting || isUploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="sr-only">Sending message...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </>
          )}
        </Button>
      </form>

      {/* <div className="px-3 pb-2 pt-0">
        <p className="text-xs text-muted-foreground text-center">
          Press Enter to send • Shift+Enter for new line • Max 5 files (10MB each)
        </p>
      </div> */}
    </div>
  );
}
