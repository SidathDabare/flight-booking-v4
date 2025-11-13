import { v2 as cloudinary } from "cloudinary";

// Secure Cloudinary configuration
// Never log or expose these credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate configuration in development only
if (process.env.NODE_ENV === 'development') {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn("⚠️  Cloudinary environment variables not fully configured");
  }
}

export interface UploadOptions {
  folder: string;
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  };
  publicId?: string;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export const UPLOAD_FOLDERS = {
  PROFILES: {
    CLIENT: "flight-booking/profiles/clients",
    AGENT: "flight-booking/profiles/agents",
    ADMIN: "flight-booking/profiles/admins",
  },
  ATTACHMENTS: "flight-booking/attachments",
  DOCUMENTS: "flight-booking/documents",
  CAROUSEL: "flight-booking/carousel",
  TEMP: "flight-booking/temp",
} as const;

export const uploadToCloudinary = async (
  file: File | string,
  options: UploadOptions
): Promise<CloudinaryUploadResult> => {
  try {
    // Determine file type and appropriate resource_type
    let fileType = "";
    let resourceType: "image" | "video" | "raw" | "auto" = "auto";

    if (typeof file !== "string") {
      fileType = file.type;

      // PDFs and documents should use "image" resource type for transformations
      if (fileType === "application/pdf") {
        resourceType = "image";
      } else if (
        fileType.startsWith("application/") &&
        !fileType.includes("image")
      ) {
        // Other documents (Word, Excel, etc.) use raw
        resourceType = "raw";
      } else if (fileType.startsWith("image/")) {
        resourceType = "image";
      } else if (fileType.startsWith("video/")) {
        resourceType = "video";
      }
    }

    const uploadOptions: Record<string, unknown> = {
      folder: options.folder,
      resource_type: resourceType,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg", "pdf", "doc", "docx", "xls", "xlsx", "txt", "csv"],
      flags: resourceType === "image" && fileType === "application/pdf" ? "attachment" : undefined,
    };

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    // Only apply transformations to images (not PDFs or documents)
    if (options.transformation && fileType.startsWith("image/")) {
      uploadOptions.transformation = [
        {
          width: options.transformation.width || 500,
          height: options.transformation.height || 500,
          crop: options.transformation.crop || "fill",
          quality: options.transformation.quality || "auto",
        }
      ];
    }

    let uploadSource: string;

    if (typeof file === "string") {
      uploadSource = file;
    } else {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      uploadSource = `data:${file.type};base64,${buffer.toString('base64')}`;
    }

    const result = await cloudinary.uploader.upload(uploadSource, uploadOptions);

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width || 0,
      height: result.height || 0,
      format: result.format,
      resource_type: result.resource_type,
    };
  } catch (error) {
    // Log error securely without exposing sensitive details
    if (process.env.NODE_ENV === 'development') {
      console.error("Cloudinary upload error:", error instanceof Error ? error.message : "Unknown error");
    }
    throw new Error("Failed to upload file to Cloudinary");
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Log error securely without exposing sensitive details
    if (process.env.NODE_ENV === 'development') {
      console.error("Cloudinary delete error:", error instanceof Error ? error.message : "Unknown error");
    }
    throw new Error("Failed to delete file from Cloudinary");
  }
};

export const generateProfileImagePublicId = (userId: string, role: string): string => {
  return `${role}_${userId}_${Date.now()}`;
};

export const getOptimizedImageUrl = (publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: string;
}): string => {
  return cloudinary.url(publicId, {
    width: options?.width || 200,
    height: options?.height || 200,
    crop: "fill",
    quality: options?.quality || "auto",
    format: "auto",
  });
};

export default cloudinary;