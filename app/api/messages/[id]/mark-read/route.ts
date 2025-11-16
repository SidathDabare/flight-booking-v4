import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Message } from "@/lib/db/models/Message";
import { connectToDatabase } from "@/lib/db/mongoose";

// PATCH /api/messages/[id]/mark-read - Mark message and all replies as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

      const userRole = session.user.role as string;
      const userId = session.user.id;

      // Authorization checks
      if (userRole === "client") {
        // Clients can only mark their own message threads as read
        if (message.senderId.toString() !== userId) {
          return NextResponse.json(
            { error: "Forbidden: You can only mark your own message threads as read" },
            { status: 403 }
          );
        }
      }
      // Agents and admins can mark any message as read (including pending/unassigned messages)

      const now = new Date();

      // Check if user has already marked this message as read recently (within last 5 seconds)
      // This prevents duplicate entries when marking as read multiple times rapidly
      const existingReadReceipt = message.readBy?.find(
        (receipt: any) =>
          receipt.userId.toString() === userId &&
          now.getTime() - new Date(receipt.readAt).getTime() < 5000
      );

      if (!existingReadReceipt) {
        // Add read receipt to main message
        if (!message.readBy) {
          message.readBy = [];
        }

        // Remove old read receipt from this user if exists
        message.readBy = message.readBy.filter(
          (receipt: any) => receipt.userId.toString() !== userId
        );

        // Add new read receipt
        message.readBy.push({
          userId: userId,
          readAt: now,
        } as any);

        // Update role-specific timestamp
        if (userRole === "client") {
          message.lastReadByClient = now;
        } else if (userRole === "agent" || userRole === "admin") {
          message.lastReadByAgent = now;
        }

        // Mark all replies as read by this user
        if (message.replies && message.replies.length > 0) {
          message.replies.forEach((reply: any) => {
            // Don't mark own replies as read (already seen them)
            if (reply.senderId.toString() !== userId) {
              if (!reply.readBy) {
                reply.readBy = [];
              }

              // Remove old read receipt from this user if exists
              reply.readBy = reply.readBy.filter(
                (receipt: any) => receipt.userId.toString() !== userId
              );

              // Add new read receipt
              reply.readBy.push({
                userId: userId,
                readAt: now,
              });
            }
          });
        }

        try {
          await message.save();
        } catch (saveError: any) {
          // Check if this is a version error
          if (saveError.name === 'VersionError' && attempt < maxRetries - 1) {
            attempt++;
            console.log(`Version conflict on attempt ${attempt}, retrying...`);
            // Wait a bit before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 50 * attempt));
            continue; // Retry the operation
          }
          throw saveError; // Re-throw if not a version error or max retries reached
        }

        // Emit Socket.IO event for real-time updates
        const io = (global as any).io;
        if (io) {
          // Notify the sender that their message was read
          io.to(`message:${id}`).emit('message:marked-read', {
            messageId: id,
            userId: userId,
            userName: session.user.name || "Unknown",
            userRole: userRole,
            readAt: now.toISOString(),
          });

          // Trigger unread count refresh for this user
          io.to(`user:${userId}`).emit('unread:should-refresh', {
            reason: 'marked-as-read',
            messageId: id,
            timestamp: Date.now(),
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Message marked as read successfully",
        data: {
          messageId: id,
          readAt: now.toISOString(),
        },
      });
    } catch (error: any) {
      // If it's a version error and we haven't exceeded retries, continue loop
      if (error.name === 'VersionError' && attempt < maxRetries - 1) {
        attempt++;
        console.log(`Version conflict on attempt ${attempt}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 50 * attempt));
        continue;
      }

      // Otherwise, return error
      console.error("Mark read error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  // If we exhausted all retries
  return NextResponse.json(
    { error: "Failed to mark as read after multiple attempts" },
    { status: 500 }
  );
}
