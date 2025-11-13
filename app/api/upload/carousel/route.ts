import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { uploadToCloudinary, UPLOAD_FOLDERS } from "@/lib/cloudinary";
import { authOptions } from "@/lib/auth";

const RESPONSIVE_SIZES = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 1024, height: 576 },
  mobile: { width: 768, height: 432 },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a valid image file." },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const publicId = `carousel_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    const responsiveImages = await Promise.all([
      uploadToCloudinary(file, {
        folder: UPLOAD_FOLDERS.CAROUSEL,
        publicId: `${publicId}_desktop`,
        transformation: {
          width: RESPONSIVE_SIZES.desktop.width,
          height: RESPONSIVE_SIZES.desktop.height,
          crop: "fill",
          quality: "auto:good",
        },
      }),
      uploadToCloudinary(file, {
        folder: UPLOAD_FOLDERS.CAROUSEL,
        publicId: `${publicId}_tablet`,
        transformation: {
          width: RESPONSIVE_SIZES.tablet.width,
          height: RESPONSIVE_SIZES.tablet.height,
          crop: "fill",
          quality: "auto:good",
        },
      }),
      uploadToCloudinary(file, {
        folder: UPLOAD_FOLDERS.CAROUSEL,
        publicId: `${publicId}_mobile`,
        transformation: {
          width: RESPONSIVE_SIZES.mobile.width,
          height: RESPONSIVE_SIZES.mobile.height,
          crop: "fill",
          quality: "auto:good",
        },
      }),
    ]);

    const [desktopResult, tabletResult, mobileResult] = responsiveImages;

    return NextResponse.json({
      success: true,
      data: {
        imagePublicId: publicId,
        imageUrl: desktopResult.secure_url,
        responsiveImages: {
          desktop: {
            url: desktopResult.secure_url,
            width: desktopResult.width,
            height: desktopResult.height,
          },
          tablet: {
            url: tabletResult.secure_url,
            width: tabletResult.width,
            height: tabletResult.height,
          },
          mobile: {
            url: mobileResult.secure_url,
            width: mobileResult.width,
            height: mobileResult.height,
          },
        },
      },
    });
  } catch (error) {
    console.error("Carousel image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}