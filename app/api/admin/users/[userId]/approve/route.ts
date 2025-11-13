import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { notifyAgentApproval } from "@/lib/email";

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
        { error: "Only agents can be approved" },
        { status: 400 }
      );
    }

    user.isApproved = true;
    await user.save();

    // Send approval notification email
    await notifyAgentApproval(user.email, user.name);

    return NextResponse.json({
      message: "Agent approved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error("Error approving agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}