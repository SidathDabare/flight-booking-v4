import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Message } from "@/lib/db/models/Message";
import { User } from "@/lib/db/models/User";
import { connectToDatabase } from "@/lib/db/mongoose";
import { sendMessageStatusChangeNotification } from "@/lib/email";

// PATCH /api/messages/[id]/status - Update message status
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
    const { status } = body;

    // Validation
    const validStatuses = ["pending", "accepted", "resolved", "closed"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: pending, accepted, resolved, closed" },
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

    const userRole = session.user.role as string;

    // Authorization checks
    if (userRole === "client") {
      // Clients cannot change message status
      return NextResponse.json(
        { error: "Forbidden: Clients cannot update message status" },
        { status: 403 }
      );
    } else if (userRole === "agent") {
      // Agents can only update status of messages they've accepted
      if (!message.assignedTo || message.assignedTo.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "Forbidden: You can only update status of messages you've accepted" },
          { status: 403 }
        );
      }
    }
    // Admins can update any message status (no restriction)

    // Store old status for email notification
    const oldStatus = message.status;

    // Update status
    message.status = status;
    await message.save();

    // Emit Socket.IO event for real-time updates
    const io = (global as any).io;
    if (io) {
      io.to(`message:${id}`).emit('message:status-updated', {
        messageId: id,
        status,
      });
    }

    // Send email notification to the client (run async without blocking response)
    (async () => {
      try {
        const clientUser: any = await User.findById(message.senderId).lean();
        if (clientUser) {
          await sendMessageStatusChangeNotification(
            clientUser.email,
            clientUser.name,
            message.subject,
            oldStatus,
            status,
            id
          );
        }
      } catch (emailError) {
        console.error("Error sending status change email notification:", emailError);
        // Don't fail the request if email fails
      }
    })();

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      data: message,
    });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
