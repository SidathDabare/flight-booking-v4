"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, File, FileText, Image, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FileUploadResult {
  fileUrl: string;
  publicId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

interface FileAttachmentUploadProps {
  onFileUploaded?: (result: FileUploadResult) => void;
  onFileRemoved?: (publicId: string) => void;
  uploadedFiles?: FileUploadResult[];
  maxFiles?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
  disabled?: boolean;
  fileType?: "attachment" | "document";
}

export function FileAttachmentUpload({
  onFileUploaded,
  onFileRemoved,
  uploadedFiles = [],
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = [
    "image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml",
    "application/pdf",
    "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain", "text/csv"
  ],
  disabled = false,
  fileType = "attachment"
}: FileAttachmentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    if (uploadedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} files`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      for (const file of files) {
        if (file.size > maxFileSize) {
          toast({
            title: "File too large",
            description: `${file.name} is too large. Maximum size: ${Math.round(maxFileSize / 1024 / 1024)}MB`,
            variant: "destructive",
          });
          continue;
        }

        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a supported file type`,
            variant: "destructive",
          });
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", fileType);

        const response = await fetch("/api/upload/attachments", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        onFileUploaded?.(data);

        toast({
          title: "Success",
          description: `${file.name} uploaded successfully`,
        });
      }
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

  const handleRemoveFile = (file: FileUploadResult) => {
    onFileRemoved?.(file.publicId);
    toast({
      title: "Success",
      description: `${file.fileName} removed`,
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="w-5 h-5" aria-label="Image file" />;
    if (fileType === "application/pdf") return <FileText className="w-5 h-5" aria-label="PDF file" />;
    return <File className="w-5 h-5" aria-label="File" />;
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
        
        <Button
          variant="outline"
          onClick={triggerFileSelect}
          disabled={isUploading || disabled || uploadedFiles.length >= maxFiles}
        >
          {isUploading ? (
            "Uploading..."
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </>
          )}
        </Button>

        <p className="text-sm text-muted-foreground">
          {uploadedFiles.length}/{maxFiles} files uploaded
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <Card key={index}>
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.fileType)}
                  <div>
                    <p className="text-sm font-medium">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.fileSize)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                  {!disabled && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFile(file)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Max file size: {Math.round(maxFileSize / 1024 / 1024)}MB. 
        Supported formats: Images, PDFs, Documents, Text files
      </p>
    </div>
  );
}