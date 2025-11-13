import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Offer } from "@/lib/db/models/Offer";
import { Settings } from "@/lib/db/models/Settings";

export async function GET() {
  try {
    await connectToDatabase();

    // Check if offers are enabled
    const settings = await Settings.findOne();
    if (!settings?.offers?.isEnabled) {
      return NextResponse.json({
        success: true,
        data: [],
        isEnabled: false,
      });
    }

    const currentDate = new Date();
    const offers = await Offer.find({
      isHidden: false,
      expireDate: { $gt: currentDate },
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: offers,
      isEnabled: true,
    });
  } catch (error) {
    console.error("Get public offers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}