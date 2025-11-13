import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Message } from "@/lib/db/models/Message";
import { connectToDatabase } from "@/lib/db/mongoose";

// DELETE /api/messages/[id]/delete - Delete a message or reply
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const replyId = searchParams.get("replyId");

    await connectToDatabase();

    const { id } = await params;
    const message = await Message.findById(id);

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // If replyId is provided, delete the reply
    if (replyId) {
      const reply = message.replies.id(replyId);

      if (!reply) {
        return NextResponse.json(
          { error: "Reply not found" },
          { status: 404 }
        );
      }

      // Authorization: Only the sender can delete their reply
      if (reply.senderId.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "Forbidden: You can only delete your own messages" },
          { status: 403 }
        );
      }

      // Remove the reply using pull method
      message.replies.pull(replyId);
      await message.save();

      // Emit Socket.IO event for real-time updates
      const io = (global as any).io;
      if (io) {
        io.to(`message:${id}`).emit('message:was-deleted', {
          messageId: id,
          replyId,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Reply deleted successfully",
        data: message,
      });
    } else {
      // Delete the main message thread (only if client is the sender)
      if (message.senderId.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "Forbidden: You can only delete your own messages" },
          { status: 403 }
        );
      }

      // Only allow clients to delete their entire thread if no agent has replied
      const hasAgentReplies = message.replies.some(
        (reply: any) => reply.senderRole === "agent" || reply.senderRole === "admin"
      );

      if (hasAgentReplies) {
        return NextResponse.json(
          {
            error: "Cannot delete: An agent or admin has replied to this conversation",
            canDelete: false
          },
          { status: 403 }
        );
      }

      await Message.findByIdAndDelete(id);

      // Emit Socket.IO event for real-time updates
      const io = (global as any).io;
      if (io) {
        io.to(`message:${id}`).emit('message:was-deleted', {
          messageId: id,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Message deleted successfully",
      });
    }
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
