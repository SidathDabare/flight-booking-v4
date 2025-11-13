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
    let unreadCount = 0;

    if (userRole === "client") {
      // For clients: count messages with new replies from agents/admins
      const messages = await Message.find({
        senderId: session.user.id,
      }).lean();

      // Count messages that have replies after the last client reply
      messages.forEach((message) => {
        if (message.replies && message.replies.length > 0) {
          // Find the last reply from the client
          let lastClientReplyIndex = -1;
          for (let i = message.replies.length - 1; i >= 0; i--) {
            if (
              message.replies[i].senderRole === "client" &&
              message.replies[i].senderId.toString() === session.user.id
            ) {
              lastClientReplyIndex = i;
              break;
            }
          }

          // Check if there are any replies after the client's last reply
          if (lastClientReplyIndex === -1) {
            // Client hasn't replied yet, check if there are any agent/admin replies
            const hasAgentReply = message.replies.some(
              (reply: IReply) => reply.senderRole === "agent" || reply.senderRole === "admin"
            );
            if (hasAgentReply) {
              unreadCount++;
            }
          } else if (lastClientReplyIndex < message.replies.length - 1) {
            // There are replies after client's last reply
            unreadCount++;
          }
        }
      });
    } else if (userRole === "agent" || userRole === "admin") {
      // For agents/admins: count all messages where the last message is from a client (WhatsApp-style)
      const allMessages = await Message.find({
        status: { $in: ["pending", "accepted", "resolved"] },
      }).lean();

      allMessages.forEach((message) => {
        // Check if this message is unread (last message is from client)
        if (!message.replies || message.replies.length === 0) {
          // No replies yet, check if original message is from client
          if (message.senderRole === "client") {
            unreadCount++;
          }
        } else {
          // Get the last reply
          const lastReply = message.replies[message.replies.length - 1];
          // If last reply is from client, it's unread
          if (lastReply.senderRole === "client") {
            unreadCount++;
          }
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
