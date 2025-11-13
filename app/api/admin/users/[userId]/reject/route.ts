import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { notifyAgentRejection } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const resolvedParams = await params;
    const user = await User.findById(resolvedParams.userId);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "agent") {
      return NextResponse.json(
        { error: "Only agent applications can be rejected" },
        { status: 400 }
      );
    }

    if (user.isApproved) {
      return NextResponse.json(
        { error: "Cannot reject an already approved agent" },
        { status: 400 }
      );
    }

    // Delete the user record (rejection means removing the application)
    await User.findByIdAndDelete(resolvedParams.userId);

    // Send rejection notification email
    await notifyAgentRejection(user.email, user.name);

    return NextResponse.json({
      message: "Agent application rejected successfully",
      rejectedUser: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error rejecting agent application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}