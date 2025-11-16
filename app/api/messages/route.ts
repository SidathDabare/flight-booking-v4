import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Message } from "@/lib/db/models/Message";
import { User } from "@/lib/db/models/User";
import { connectToDatabase } from "@/lib/db/mongoose";
import { sendNewMessageNotification } from "@/lib/email";

// GET /api/messages - List messages (role-based)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userRole = session.user.role as string;

    const query: any = {};

    // Role-based filtering
    if (userRole === "client") {
      // Clients only see their own messages
      query.senderId = session.user.id;
    } else if (userRole === "agent" || userRole === "admin") {
      // Agents/Admins can see all messages
      // If status filter is provided, apply it
      if (status) {
        query.status = status;
      }

      // Support filtering for "my messages" (assigned to current user)
      const myMessages = searchParams.get("myMessages");
      if (myMessages === "true") {
        query.assignedTo = session.user.id;
      }
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/messages - Create new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subject, content, attachments } = body;

    // Validation
    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (subject.trim().length > 200) {
      return NextResponse.json(
        { error: "Subject must be less than 200 characters" },
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

    // Enforce single thread per client
    if (session.user.role === "client") {
      const existingThread = await Message.findOne({ senderId: session.user.id });
      if (existingThread) {
        return NextResponse.json(
          {
            error: "You already have an active conversation. Please use your existing thread.",
            threadId: existingThread._id.toString()
          },
          { status: 409 }
        );
      }
    }

    const message = await Message.create({
      senderId: session.user.id,
      senderName: session.user.name,
      senderEmail: session.user.email,
      senderRole: session.user.role,
      subject: subject.trim(),
      content: content.trim(),
      attachments: attachments || [],
      status: "pending",
      replies: [],
    });

    // Emit Socket.IO event for real-time updates
    const io = (global as any).io;
    if (io) {
      // Notify all agents/admins about new message
      if (session.user.role === 'client') {
        io.to('role:agent').to('role:admin').emit('message:created', {
          messageId: message._id.toString(),
          senderId: session.user.id,
          senderName: session.user.name,
          subject: message.subject,
          timestamp: Date.now(),
        });

        // Trigger unread count refresh for agents/admins
        io.to('role:agent').to('role:admin').emit('unread:should-refresh', {
          reason: 'new-message-created',
          timestamp: Date.now(),
        });
      }

      // Notify the user themselves to refresh their message list
      io.to(`user:${session.user.id}`).emit('message:list-updated', {
        messageId: message._id.toString(),
        action: 'message-created',
        timestamp: Date.now(),
      });
    }

    // Send email notifications to admins (run async without blocking response)
    if (session.user.role === 'client') {
      (async () => {
        try {
          // Get all admins
          const admins = await User.find({ role: 'admin', isApproved: true }).lean();

          // Send email to each admin
          for (const admin of admins) {
            await sendNewMessageNotification(
              admin.email,
              admin.name,
              session.user.name || 'A client',
              message.subject,
              message._id.toString()
            );
          }
        } catch (emailError) {
          console.error("Error sending new message email notifications:", emailError);
          // Don't fail the request if email fails
        }
      })();
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      data: message,
    }, { status: 201 });
  } catch (error) {
    console.error("Message creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
