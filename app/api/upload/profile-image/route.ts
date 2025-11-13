import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "@/lib/db/models/User";
import { connectToDatabase } from "@/lib/db/mongoose";
import { uploadToCloudinary, deleteFromCloudinary, UPLOAD_FOLDERS, generateProfileImagePublicId } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." 
      }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let folder: string;
    switch (user.role) {
      case "client":
        folder = UPLOAD_FOLDERS.PROFILES.CLIENT;
        break;
      case "agent":
        folder = UPLOAD_FOLDERS.PROFILES.AGENT;
        break;
      case "admin":
        folder = UPLOAD_FOLDERS.PROFILES.ADMIN;
        break;
      default:
        folder = UPLOAD_FOLDERS.PROFILES.CLIENT;
    }

    if (user.profileImage) {
      try {
        const publicId = user.profileImage.split('/').pop()?.split('.')[0];
        if (publicId) {
          await deleteFromCloudinary(`${folder}/${publicId}`);
        }
      } catch (error) {
        console.error("Failed to delete old profile image:", error);
      }
    }

    const publicId = generateProfileImagePublicId(user._id.toString(), user.role);
    
    const result = await uploadToCloudinary(file, {
      folder,
      publicId,
      transformation: {
        width: 400,
        height: 400,
        crop: "fill",
        quality: "auto"
      }
    });

    user.profileImage = result.secure_url;
    await user.save();

    return NextResponse.json({
      message: "Profile image uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error("Profile image upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.profileImage) {
      return NextResponse.json({ error: "No profile image to delete" }, { status: 400 });
    }

    try {
      const publicId = user.profileImage.split('/').pop()?.split('.')[0];
      if (publicId) {
        let folder: string;
        switch (user.role) {
          case "client":
            folder = UPLOAD_FOLDERS.PROFILES.CLIENT;
            break;
          case "agent":
            folder = UPLOAD_FOLDERS.PROFILES.AGENT;
            break;
          case "admin":
            folder = UPLOAD_FOLDERS.PROFILES.ADMIN;
            break;
          default:
            folder = UPLOAD_FOLDERS.PROFILES.CLIENT;
        }
        
        await deleteFromCloudinary(`${folder}/${publicId}`);
      }
    } catch (error) {
      console.error("Failed to delete image from Cloudinary:", error);
    }

    user.profileImage = null;
    await user.save();

    return NextResponse.json({
      message: "Profile image deleted successfully"
    });

  } catch (error) {
    console.error("Profile image delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}