"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, Camera } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserAvatar } from "@/components/ui/user-avatar";

interface ProfileImageUploadProps {
  currentImage?: string | null;
  onImageUpdate?: (imageUrl: string | null) => void;
  disabled?: boolean;
}

export function ProfileImageUpload({
  currentImage,
  onImageUpdate,
  disabled = false
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { data: session } = useSession();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, PNG, or WebP image",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setPreviewImage(data.imageUrl);
      onImageUpdate?.(data.imageUrl);

      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!previewImage) return;

    setIsDeleting(true);

    try {
      const response = await fetch("/api/upload/profile-image", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      setPreviewImage(null);
      onImageUpdate?.(null);

      toast({
        title: "Success",
        description: "Profile image removed successfully",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <UserAvatar
          src={previewImage}
          name={session?.user?.name}
          email={session?.user?.email}
          size="xl"
          className="w-32 h-32 text-2xl"
        />
        
        {!disabled && (
          <Button
            size="sm"
            className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
            onClick={triggerFileSelect}
            disabled={isUploading}
            aria-label="Change profile picture"
          >
            <Camera className="w-4 h-4" />
            <span className="sr-only">Change profile picture</span>
          </Button>
        )}
      </div>

      <div className="flex space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
          aria-label="Select profile image file"
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={triggerFileSelect}
          disabled={isUploading || disabled}
        >
          {isUploading ? (
            "Uploading..."
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </>
          )}
        </Button>

        {previewImage && !disabled && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              "Removing..."
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                Remove
              </>
            )}
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Upload a profile picture. Max file size: 5MB.
        <br />
        Supported formats: JPEG, PNG, WebP
      </p>
    </div>
  );
}