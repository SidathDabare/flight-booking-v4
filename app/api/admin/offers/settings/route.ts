import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Settings } from "@/lib/db/models/Settings";

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
        offers: {
          isEnabled: true,
        },
      });
      await settings.save();
    }

    // Ensure offers field exists (for backward compatibility)
    if (!settings.offers) {
      settings.offers = { isEnabled: true };
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        isEnabled: settings.offers.isEnabled,
      },
    });
  } catch (error) {
    console.error("Get offers settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers settings" },
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
    const { isEnabled } = body;

    if (typeof isEnabled !== "boolean") {
      return NextResponse.json(
        { error: "isEnabled must be a boolean" },
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
        offers: {
          isEnabled,
        },
      });
    } else {
      // Ensure offers field exists
      if (!settings.offers) {
        settings.offers = { isEnabled };
      } else {
        settings.offers.isEnabled = isEnabled;
      }
    }

    await settings.save();

    return NextResponse.json({
      success: true,
      data: {
        isEnabled: settings.offers.isEnabled,
      },
    });
  } catch (error) {
    console.error("Update offers settings error:", error);
    return NextResponse.json(
      { error: "Failed to update offers settings" },
      { status: 500 }
    );
  }
}