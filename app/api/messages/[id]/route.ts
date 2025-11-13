import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Message } from "@/lib/db/models/Message";
import { connectToDatabase } from "@/lib/db/mongoose";

// GET /api/messages/[id] - Get single message with replies
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    const message = await Message.findById(id).lean();

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    const userRole = session.user.role as string;

    // Authorization: Check if user can view this message
    if (userRole === "client") {
      // Clients can only view their own messages
      if ((message as any).senderId?.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "Forbidden: You don't have access to this message" },
          { status: 403 }
        );
      }
    }
    // Admin and agent can view all messages (no restriction)

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Message fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
