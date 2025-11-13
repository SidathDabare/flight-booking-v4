import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Offer } from "@/lib/db/models/Offer";
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

    const offers = await Offer.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error("Get offers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
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
    const {
      title,
      departureCity,
      arrivalCity,
      description,
      price,
      discount,
      expireDate,
      imageUrl,
      imagePublicId,
      responsiveImages,
    } = body;

    if (!title || !departureCity || !arrivalCity || !description || !price || !expireDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (price < 0 || (discount && (discount < 0 || discount > 100))) {
      return NextResponse.json(
        { error: "Invalid price or discount values" },
        { status: 400 }
      );
    }

    const expireDateObj = new Date(expireDate);
    if (expireDateObj <= new Date()) {
      return NextResponse.json(
        { error: "Expire date must be in the future" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newOffer = new Offer({
      title,
      departureCity,
      arrivalCity,
      description,
      price,
      discount: discount || 0,
      expireDate: expireDateObj,
      imageUrl: imageUrl || null,
      imagePublicId: imagePublicId || null,
      responsiveImages: responsiveImages || null,
    });

    await newOffer.save();

    return NextResponse.json({
      success: true,
      data: newOffer,
    });
  } catch (error) {
    console.error("Create offer error:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
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
    const { offerId, ...updates } = body;

    if (!offerId) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 }
      );
    }

    if (updates.price !== undefined && updates.price < 0) {
      return NextResponse.json(
        { error: "Price cannot be negative" },
        { status: 400 }
      );
    }

    if (updates.discount !== undefined && (updates.discount < 0 || updates.discount > 100)) {
      return NextResponse.json(
        { error: "Discount must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (updates.expireDate) {
      const expireDateObj = new Date(updates.expireDate);
      if (expireDateObj <= new Date()) {
        return NextResponse.json(
          { error: "Expire date must be in the future" },
          { status: 400 }
        );
      }
      updates.expireDate = expireDateObj;
    }

    await connectToDatabase();

    const updatedOffer = await Offer.findByIdAndUpdate(
      offerId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedOffer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedOffer,
    });
  } catch (error) {
    console.error("Update offer error:", error);
    return NextResponse.json(
      { error: "Failed to update offer" },
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
    const offerId = searchParams.get("offerId");

    if (!offerId) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    if (offer.imagePublicId && offer.responsiveImages) {
      try {
        await deleteFromCloudinary(`${offer.imagePublicId}_desktop`);
        await deleteFromCloudinary(`${offer.imagePublicId}_tablet`);
        await deleteFromCloudinary(`${offer.imagePublicId}_mobile`);
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
      }
    }

    await Offer.findByIdAndDelete(offerId);

    return NextResponse.json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Delete offer error:", error);
    return NextResponse.json(
      { error: "Failed to delete offer" },
      { status: 500 }
    );
  }
}