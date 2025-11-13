"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, Image } from "lucide-react";

interface OfferImageUploadProps {
  onImageUploaded: (imageData: {
    imageUrl: string;
    imagePublicId: string;
    responsiveImages: {
      desktop: { url: string; width: number; height: number };
      tablet: { url: string; width: number; height: number };
      mobile: { url: string; width: number; height: number };
    };
  }) => void;
  disabled?: boolean;
  existingImageUrl?: string;
}

export function OfferImageUpload({
  onImageUploaded,
  disabled = false,
  existingImageUrl,
}: OfferImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(existingImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/carousel", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onImageUploaded(data.data);

      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
      setPreviewImage(existingImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {previewImage ? "Change Image" : "Upload Image"}
            </>
          )}
        </Button>

        {previewImage && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearImage}
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {previewImage && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImage}
            alt="Preview"
            className="h-32 w-48 rounded-lg border object-cover"
          />
          <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
            Preview
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div className="text-sm text-muted-foreground">
        <p>Supported formats: JPEG, PNG, WebP (Optional)</p>
        <p>Maximum size: 10MB</p>
        <p>Recommended: 600x400 for optimal display</p>
      </div>
    </div>
  );
}