import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Message } from "@/lib/db/models/Message";
import { connectToDatabase } from "@/lib/db/mongoose";

// PATCH /api/messages/[id]/edit - Edit a message or reply
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, replyId } = body;

    // Validation
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.trim().length > 5000) {
      return NextResponse.json(
        { error: "Content must be less than 5000 characters" },
        { status: 400 }
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

    // If replyId is provided, edit the reply
    if (replyId) {
      const reply = message.replies.id(replyId);

      if (!reply) {
        return NextResponse.json(
          { error: "Reply not found" },
          { status: 404 }
        );
      }

      // Authorization: Only the sender can edit their reply
      if (reply.senderId.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "Forbidden: You can only edit your own messages" },
          { status: 403 }
        );
      }

      reply.content = content.trim();
      reply.updatedAt = new Date();
      reply.isEdited = true;
    } else {
      // Edit the main message
      // Authorization: Only the sender can edit their message
      if (message.senderId.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "Forbidden: You can only edit your own messages" },
          { status: 403 }
        );
      }

      message.content = content.trim();
      message.isEdited = true;
    }

    await message.save();

    // Emit Socket.IO event for real-time updates
    const io = (global as any).io;
    if (io) {
      io.to(`message:${id}`).emit('message:was-edited', {
        messageId: id,
        replyId,
        content: content.trim(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Message updated successfully",
      data: message,
    });
  } catch (error) {
    console.error("Edit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
