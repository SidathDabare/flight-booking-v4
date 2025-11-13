import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handler(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  // Create Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      credentials: true,
    },
    path: "/socket.io/",
    transports: ["websocket", "polling"],
  });

  //console.log('✅ Socket.IO server created')

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.auth.userId;
      const userName = socket.handshake.auth.userName;
      const userRole = socket.handshake.auth.userRole;

      if (userId) {
        socket.data.user = {
          id: userId,
          name: userName,
          role: userRole,
        };
        next();
      } else {
        next(new Error("Unauthorized - No user ID provided"));
      }
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  // Track online users
  const onlineUsers = new Map();

  // Socket.IO connection handler
  io.on("connection", (socket) => {
    const userId = socket.data.user?.id;
    const userName = socket.data.user?.name;
    const userRole = socket.data.user?.role;

    if (!userId) {
      socket.disconnect();
      return;
    }

    //console.log(`✅ User connected: ${userName} (${userId}) [${userRole}]`)

    // Track user connection
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Join role-specific room
    if (userRole) {
      socket.join(`role:${userRole}`);
    }

    // Emit user online status
    socket.broadcast.emit("user:online", {
      userId,
      userName,
      userRole,
    });

    // Join message thread room
    socket.on("join:thread", (messageId) => {
      if (messageId) {
        socket.join(`message:${messageId}`);
        //console.log(`📥 User ${userName} joined thread: ${messageId}`)
      }
    });

    // Leave thread room
    socket.on("leave:thread", (messageId) => {
      if (messageId) {
        socket.leave(`message:${messageId}`);
        //console.log(`📤 User ${userName} left thread: ${messageId}`)
      }
    });

    // New reply event
    socket.on("message:reply", async (data) => {
      //console.log(`💬 New reply in thread ${data.messageId} from ${userName}`)

      socket.to(`message:${data.messageId}`).emit("message:new-reply", {
        ...data,
        senderId: userId,
        senderName: userName,
        senderRole: userRole,
      });

      // Notify agents if client sent message
      if (userRole === "client") {
        io.to("role:agent").emit("notification:new-message", {
          messageId: data.messageId,
          senderId: userId,
          senderName: userName,
        });
      }
    });

    // Typing indicator
    socket.on("typing:start", (messageId) => {
      socket.to(`message:${messageId}`).emit("user:typing", {
        userId,
        userName,
        messageId,
      });
    });

    socket.on("typing:stop", (messageId) => {
      socket.to(`message:${messageId}`).emit("user:stopped-typing", {
        userId,
        messageId,
      });
    });

    // Mark message as read
    socket.on("message:read", (messageId) => {
      socket.to(`message:${messageId}`).emit("message:marked-read", {
        messageId,
        userId,
        userName,
      });
    });

    // Message deleted
    socket.on("message:deleted", (data) => {
      socket.to(`message:${data.messageId}`).emit("message:was-deleted", data);
    });

    // Message edited
    socket.on("message:edited", (data) => {
      socket.to(`message:${data.messageId}`).emit("message:was-edited", data);
    });

    // Message status changed
    socket.on("message:status-changed", (data) => {
      io.to(`message:${data.messageId}`).emit("message:status-updated", data);
    });

    // Message accepted by agent
    socket.on("message:accepted", (data) => {
      io.to(`message:${data.messageId}`).emit("message:was-accepted", data);
    });

    // Request unread count refresh (client asks for their unread count)
    socket.on("unread:request-update", async (data) => {
      //console.log(`📊 Unread count requested by ${userName}`)
      // Client will receive this and can refresh their local count
      socket.emit("unread:should-refresh", {
        userId,
        timestamp: Date.now(),
      });
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      //console.log(`❌ User disconnected: ${userName} (${userId})`)

      // Remove socket from online users
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);

        // If user has no more connections, mark as offline
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);

          // Broadcast user offline status
          socket.broadcast.emit("user:offline", {
            userId,
            userName,
            userRole,
          });
        }
      }
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`❌ Socket error for user ${userName}:`, error);
    });
  });

  // Make io instance available globally for API routes
  (global as any).io = io;

  // Start server
  httpServer
    .once("error", (err) => {
      console.error("❌ Server error:", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🚀 Server ready!                                     ║
║                                                        ║
║   ➜ Local:    http://${hostname}:${port}${" ".repeat(Math.max(0, 19 - hostname.length - port.toString().length))}║
║                                                        ║
║   🔌 Socket.IO enabled                                 ║
║   📡 Real-time messaging active                        ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
      `);
    });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("⚠️  SIGTERM received, closing server gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("⚠️  SIGINT received, closing server gracefully...");
  process.exit(0);
});
