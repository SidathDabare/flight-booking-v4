import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Message } from "@/lib/db/models/Message";
import { User } from "@/lib/db/models/User";
import { connectToDatabase } from "@/lib/db/mongoose";
import { sendNewReplyNotification } from "@/lib/email";

// POST /api/messages/[id]/reply - Add reply to a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, attachments } = body;

    // Validation
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Reply content is required" },
        { status: 400 }
      );
    }

    if (content.trim().length > 5000) {
      return NextResponse.json(
        { error: "Reply must be less than 5000 characters" },
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
      // Clients can only reply to their own messages
      if (message.senderId.toString() !== session.user.id) {
        return NextResponse.json(
          { error: "Forbidden: You can only reply to your own messages" },
          { status: 403 }
        );
      }
    }
    // Agents and admins can reply to any message (no restriction)

    // Add reply
    message.replies.push({
      senderId: session.user.id,
      senderName: session.user.name || "Unknown",
      senderRole: userRole as "client" | "agent" | "admin",
      content: content.trim(),
      attachments: attachments || [],
      createdAt: new Date(),
    });

    await message.save();

    // Emit Socket.IO event for real-time updates
    const io = (global as any).io;
    if (io) {
      const newReply = message.replies[message.replies.length - 1];
      io.to(`message:${id}`).emit('message:new-reply', {
        messageId: id,
        reply: {
          _id: newReply._id?.toString(),
          senderId: newReply.senderId.toString(),
          senderName: newReply.senderName,
          senderRole: newReply.senderRole,
          content: newReply.content,
          attachments: newReply.attachments,
          createdAt: newReply.createdAt.toISOString(),
        }
      });

      // Broadcast to message owner that their conversation has new activity
      io.to(`user:${message.senderId.toString()}`).emit('message:list-updated', {
        messageId: id,
        action: 'reply-added',
        timestamp: Date.now(),
      });

      // Notify agents/admins if this is from a client
      if (userRole === 'client') {
        io.to('role:agent').to('role:admin').emit('notification:new-message', {
          messageId: id,
          senderId: session.user.id,
          senderName: session.user.name || "Unknown",
        });

        // Broadcast unread count update to all agents/admins
        io.to('role:agent').to('role:admin').emit('unread:should-refresh', {
          reason: 'new-client-message',
          timestamp: Date.now(),
        });
      } else {
        // Agent/admin replied, notify the client
        io.to(`user:${message.senderId.toString()}`).emit('unread:should-refresh', {
          reason: 'new-reply',
          timestamp: Date.now(),
        });
      }
    }

    // Send email notification to the recipient (run async without blocking response)
    (async () => {
      try {
        if (userRole === 'client') {
          // Client replied - notify the assigned agent/admin
          if (message.assignedTo) {
            const assignedUser: any = await User.findById(message.assignedTo).lean();
            if (assignedUser) {
              await sendNewReplyNotification(
                assignedUser.email,
                assignedUser.name,
                session.user.name || 'Client',
                message.subject,
                content.trim(),
                id,
                assignedUser.role
              );
            }
          }
        } else {
          // Agent/admin replied - notify the client
          const clientUser: any = await User.findById(message.senderId).lean();
          if (clientUser) {
            await sendNewReplyNotification(
              clientUser.email,
              clientUser.name,
              session.user.name || 'Support Team',
              message.subject,
              content.trim(),
              id,
              clientUser.role
            );
          }
        }
      } catch (emailError) {
        console.error("Error sending reply email notification:", emailError);
        // Don't fail the request if email fails
      }
    })();

    return NextResponse.json({
      success: true,
      message: "Reply added successfully",
      data: message,
    });
  } catch (error) {
    console.error("Reply error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
