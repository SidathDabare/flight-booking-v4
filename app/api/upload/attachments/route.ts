import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { uploadToCloudinary, UPLOAD_FOLDERS, generateProfileImagePublicId } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      //console.error("❌ Unauthorized upload attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("type") as string;

    if (!file) {
      //console.error("❌ No file provided in request");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    //console.log(`📁 File upload request:`, {
    //  userId: session.user.id,
    //  fileName: file.name,
    //  fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    //  fileType: file.type,
    //});

    if (file.size > 10 * 1024 * 1024) {
      //console.error(`❌ File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 });
    }

    const allowedTypes = [
      "image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml",
      "application/pdf",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain", "text/csv"
    ];

    if (!allowedTypes.includes(file.type)) {
      //console.error(`❌ Invalid file type: ${file.type}`);
      return NextResponse.json({
        error: "Invalid file type. Only images, PDFs, documents, and text files are allowed."
      }, { status: 400 });
    }

    await connectToDatabase();

    let folder: string;
    switch (fileType) {
      case "document":
        folder = UPLOAD_FOLDERS.DOCUMENTS;
        break;
      case "attachment":
      default:
        folder = UPLOAD_FOLDERS.ATTACHMENTS;
        break;
    }

    // Sanitize filename: replace spaces with underscores and remove special characters
    const sanitizedFileName = file.name
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9._-]/g, '') // Remove special characters except dots, underscores, and hyphens
      .replace(/\.[^/.]+$/, ''); // Remove extension (Cloudinary will add it)

    const publicId = `${session.user.id}_${Date.now()}_${sanitizedFileName}`;

    //console.log(`⬆️ Starting Cloudinary upload...`);
    const result = await uploadToCloudinary(file, {
      folder,
      publicId,
    });

    //console.log(`✅ File uploaded successfully:`, {
    //  fileName: file.name,
    //  url: result.secure_url,
    //  publicId: result.public_id,
    //});

    return NextResponse.json({
      message: "File uploaded successfully",
      fileUrl: result.secure_url,
      publicId: result.public_id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      resourceType: result.resource_type,
    });

  } catch (error) {
    //console.error("❌ File upload error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}