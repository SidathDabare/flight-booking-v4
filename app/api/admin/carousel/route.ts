import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Settings } from "@/lib/db/models/Settings";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        carousel: {
          items: [],
          isEnabled: true,
        },
      });
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      data: settings.carousel,
    });
  } catch (error) {
    console.error("Get carousel error:", error);
    return NextResponse.json(
      { error: "Failed to fetch carousel data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, subtitle, imageUrl, imagePublicId, responsiveImages } = body;

    if (!title || !subtitle || !imageUrl || !imagePublicId || !responsiveImages) {
      console.error("Missing required fields:", {
        title: !!title,
        subtitle: !!subtitle,
        imageUrl: !!imageUrl,
        imagePublicId: !!imagePublicId,
        responsiveImages: !!responsiveImages,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        carousel: {
          items: [],
          isEnabled: true,
        },
      });
    }

    const newItem = {
      id: Date.now().toString(),
      title,
      subtitle,
      imageUrl,
      imagePublicId,
      responsiveImages,
      isHidden: false,
      order: settings.carousel.items.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    settings.carousel.items.push(newItem);
    await settings.save();

    return NextResponse.json({
      success: true,
      data: newItem,
    });
  } catch (error) {
    console.error("Create carousel item error:", error);
    return NextResponse.json(
      { error: "Failed to create carousel item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemId, title, subtitle, isHidden, order } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const settings = await Settings.findOne();
    if (!settings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    const itemIndex = settings.carousel.items.findIndex(
      (item: any) => item.id === itemId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Carousel item not found" },
        { status: 404 }
      );
    }

    if (title !== undefined) settings.carousel.items[itemIndex].title = title;
    if (subtitle !== undefined) settings.carousel.items[itemIndex].subtitle = subtitle;
    if (isHidden !== undefined) settings.carousel.items[itemIndex].isHidden = isHidden;
    if (order !== undefined) settings.carousel.items[itemIndex].order = order;

    settings.carousel.items[itemIndex].updatedAt = new Date();

    await settings.save();

    return NextResponse.json({
      success: true,
      data: settings.carousel.items[itemIndex],
    });
  } catch (error) {
    console.error("Update carousel item error:", error);
    return NextResponse.json(
      { error: "Failed to update carousel item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const settings = await Settings.findOne();
    if (!settings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    const itemIndex = settings.carousel.items.findIndex(
      (item: any) => item.id === itemId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Carousel item not found" },
        { status: 404 }
      );
    }

    const item = settings.carousel.items[itemIndex];

    try {
      await deleteFromCloudinary(`${item.imagePublicId}_desktop`);
      await deleteFromCloudinary(`${item.imagePublicId}_tablet`);
      await deleteFromCloudinary(`${item.imagePublicId}_mobile`);
    } catch (cloudinaryError) {
      console.error("Error deleting from Cloudinary:", cloudinaryError);
    }

    settings.carousel.items.splice(itemIndex, 1);

    settings.carousel.items.forEach((item: any, index: number) => {
      item.order = index;
    });

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Carousel item deleted successfully",
    });
  } catch (error) {
    console.error("Delete carousel item error:", error);
    return NextResponse.json(
      { error: "Failed to delete carousel item" },
      { status: 500 }
    );
  }
}