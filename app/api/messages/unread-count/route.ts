import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Message, IReply } from "@/lib/db/models/Message";
import { connectToDatabase } from "@/lib/db/mongoose";

// GET /api/messages/unread-count - Get unread message count for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const userRole = session.user.role as string;
    const userId = session.user.id;
    let unreadCount = 0;

    if (userRole === "client") {
      // For clients: count messages with unread replies from agents/admins
      const messages = await Message.find({
        senderId: userId,
      }).lean();

      messages.forEach((message) => {
        const lastReadAt = message.lastReadByClient || new Date(0); // Default to epoch if never read
        let hasUnread = false;

        // Check if there are unread replies from agents/admins
        if (message.replies && message.replies.length > 0) {
          for (const reply of message.replies) {
            // Check if reply is from agent/admin and is newer than last read time
            if (
              (reply.senderRole === "agent" || reply.senderRole === "admin") &&
              new Date(reply.createdAt) > lastReadAt
            ) {
              hasUnread = true;
              break;
            }
          }
        }

        if (hasUnread) {
          unreadCount++;
        }
      });
    } else if (userRole === "agent") {
      // For agents: count messages assigned to them with unread replies from clients
      const messages = await Message.find({
        assignedTo: userId,
        status: { $in: ["accepted", "resolved"] },
      }).lean();

      messages.forEach((message) => {
        const lastReadAt = message.lastReadByAgent || new Date(0); // Default to epoch if never read
        let hasUnread = false;

        // Check original message if it's newer than last read
        if (new Date(message.createdAt) > lastReadAt && message.senderRole === "client") {
          hasUnread = true;
        }

        // Check if there are unread replies from client
        if (!hasUnread && message.replies && message.replies.length > 0) {
          for (const reply of message.replies) {
            // Check if reply is from client and is newer than last read time
            if (
              reply.senderRole === "client" &&
              new Date(reply.createdAt) > lastReadAt
            ) {
              hasUnread = true;
              break;
            }
          }
        }

        if (hasUnread) {
          unreadCount++;
        }
      });
    } else if (userRole === "admin") {
      // For admins: count all messages with unread client messages/replies
      const messages = await Message.find({
        status: { $in: ["pending", "accepted", "resolved"] },
      }).lean();

      messages.forEach((message) => {
        const lastReadAt = message.lastReadByAgent || new Date(0); // Admins use agent read tracking
        let hasUnread = false;

        // Check original message if it's newer than last read
        if (new Date(message.createdAt) > lastReadAt && message.senderRole === "client") {
          hasUnread = true;
        }

        // Check if there are unread replies from client
        if (!hasUnread && message.replies && message.replies.length > 0) {
          for (const reply of message.replies) {
            // Check if reply is from client and is newer than last read time
            if (
              reply.senderRole === "client" &&
              new Date(reply.createdAt) > lastReadAt
            ) {
              hasUnread = true;
              break;
            }
          }
        }

        if (hasUnread) {
          unreadCount++;
        }
      });
    }

    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Unread count fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
