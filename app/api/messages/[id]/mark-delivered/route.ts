import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Message } from "@/lib/db/models/Message";
import { connectToDatabase } from "@/lib/db/mongoose";

// PATCH /api/messages/[id]/mark-delivered - Mark message as delivered
export async function PATCH(
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

    // Authorization checks
    if (userRole === "client") {
      // Clients can only mark their own message threads as delivered
      if (message.senderId.toString() !== userId) {
        return NextResponse.json(
          { error: "Forbidden: You can only access your own messages" },
          { status: 403 }
        );
      }
    }
    // Agents and admins can mark any message as delivered (including pending/unassigned messages)

    const now = new Date();

    // Check if already delivered recently (within last 5 seconds) to prevent duplicates
    const existingDeliveryReceipt = message.deliveredTo?.find(
      (receipt: any) =>
        receipt.userId.toString() === userId &&
        now.getTime() - new Date(receipt.deliveredAt).getTime() < 5000
    );

    if (!existingDeliveryReceipt) {
      // Add delivery receipt to main message
      if (!message.deliveredTo) {
        message.deliveredTo = [];
      }

      // Remove old delivery receipt from this user if exists
      message.deliveredTo = message.deliveredTo.filter(
        (receipt: any) => receipt.userId.toString() !== userId
      );

      // Add new delivery receipt
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

      // Mark all replies as delivered to this user
      if (message.replies && message.replies.length > 0) {
        message.replies.forEach((reply: any) => {
          // Don't mark own replies as delivered to self
          if (reply.senderId.toString() !== userId) {
            if (!reply.deliveredTo) {
              reply.deliveredTo = [];
            }

            // Remove old delivery receipt from this user if exists
            reply.deliveredTo = reply.deliveredTo.filter(
              (receipt: any) => receipt.userId.toString() !== userId
            );

            // Add new delivery receipt
            reply.deliveredTo.push({
              userId: userId,
              deliveredAt: now,
            });
          }
        });
      }

      await message.save();

      // Emit Socket.IO event for real-time updates
      const io = (global as any).io;
      if (io) {
        // Notify the sender that their message was delivered
        io.to(`message:${id}`).emit('message:marked-delivered', {
          messageId: id,
          userId: userId,
          userName: session.user.name || "Unknown",
          userRole: userRole,
          deliveredAt: now.toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Message marked as delivered successfully",
      data: {
        messageId: id,
        deliveredAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("Mark delivered error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
