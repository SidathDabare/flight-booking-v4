import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Message } from "@/lib/db/models/Message";
import { connectToDatabase } from "@/lib/db/mongoose";

// PATCH /api/messages/[id]/accept - Accept a message (admin/agent only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as string;

    // Only admin and agent can accept messages
    if (userRole !== "admin" && userRole !== "agent") {
      return NextResponse.json(
        { error: "Forbidden: Only admins and agents can accept messages" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { id } = await params;
    const message = await Message.findById(id);

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Check if message is already accepted
    if (message.status !== "pending") {
      return NextResponse.json(
        { error: `Message is already ${message.status}` },
        { status: 400 }
      );
    }

    // Accept the message
    message.status = "accepted";
    message.assignedTo = session.user.id;
    message.assignedToName = session.user.name;
    message.acceptedAt = new Date();

    await message.save();

    // Emit Socket.IO event for real-time updates
    const io = (global as any).io;
    if (io) {
      io.to(`message:${id}`).emit('message:was-accepted', {
        messageId: id,
        agentId: session.user.id,
        agentName: session.user.name || "Unknown",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Message accepted successfully",
      data: message,
    });
  } catch (error) {
    console.error("Message accept error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
