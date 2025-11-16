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
    const message = await Message.findById(id);

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    const userRole = session.user.role as string;
    const userId = session.user.id;

    // Authorization: Check if user can view this message
    if (userRole === "client") {
      // Clients can only view their own messages
      if (message.senderId?.toString() !== userId) {
        return NextResponse.json(
          { error: "Forbidden: You don't have access to this message" },
          { status: 403 }
        );
      }
    }
    // Admin and agent can view all messages (no restriction)

    // Auto-mark as delivered when message is fetched (async, non-blocking)
    const isRecipient = message.senderId.toString() !== userId;
    if (isRecipient) {
      (async () => {
        try {
          const now = new Date();
          let shouldSave = false;

          // Check if not already delivered
          const alreadyDelivered = message.deliveredTo?.some(
            (receipt: any) => receipt.userId.toString() === userId
          );

          if (!alreadyDelivered) {
            if (!message.deliveredTo) {
              message.deliveredTo = [];
            }

            message.deliveredTo.push({
              userId: userId,
              deliveredAt: now,
            } as any);

            // Update role-specific timestamp
            if (userRole === "client") {
              message.lastDeliveredToClient = now;
            } else if (userRole === "agent" || userRole === "admin") {
              message.lastDeliveredToAgent = now;
            }

            // Mark replies as delivered
            if (message.replies && message.replies.length > 0) {
              message.replies.forEach((reply: any) => {
                if (reply.senderId.toString() !== userId) {
                  if (!reply.deliveredTo) {
                    reply.deliveredTo = [];
                  }
                  const replyAlreadyDelivered = reply.deliveredTo.some(
                    (r: any) => r.userId.toString() === userId
                  );
                  if (!replyAlreadyDelivered) {
                    reply.deliveredTo.push({
                      userId: userId,
                      deliveredAt: now,
                    });
                  }
                }
              });
            }

            shouldSave = true;
          }

          if (shouldSave) {
            await message.save();

            // Emit Socket.IO event
            const io = (global as any).io;
            if (io) {
              io.to(`message:${id}`).emit('message:marked-delivered', {
                messageId: id,
                userId: userId,
                deliveredAt: now.toISOString(),
              });
            }
          }
        } catch (deliveryError) {
          console.error("Auto-delivery marking error:", deliveryError);
          // Don't fail the request if delivery tracking fails
        }
      })();
    }

    return NextResponse.json({
      success: true,
      message: message.toObject(),
    });
  } catch (error) {
    console.error("Message fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
