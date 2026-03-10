const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { readFile, writeFile, genId } = require("./utils/fileStore");

const JWT_SECRET = "secret";

const CONVERSATIONS_FILE = "conversations.json";
const MESSAGES_FILE = "messages.json";

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Cho phép tất cả các origin, bạn có thể thay đổi để bảo mật hơn
    },
  });

  // Middleware xác thực token
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return next(new Error("Authentication error: Invalid token"));
      }
      socket.user = user;
      next();
    });
  });

  io.on("connection", (socket) => {
    // Đảm bảo lấy được ID của user từ token payload
    const userId = socket.user.id || socket.user._id || socket.user.userId;
    console.log(`User connected: ${socket.id} - ID: ${userId} - Role: ${socket.user.role}`);

    if (!userId) {
      console.error("User connected but ID is undefined. Payload:", socket.user);
      return;
    }

    // Tham gia vào phòng riêng của mình để nhận tin nhắn cá nhân
    socket.join(userId);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    // Xử lý gửi và nhận tin nhắn
    socket.on('message:send', async (data) => {
      try {
        const { conversationId, text } = data;
        const senderId = socket.user.id || socket.user._id || socket.user.userId;

        if (!senderId) {
          throw new Error("Sender ID not found in token");
        }

        // 1. Lưu tin nhắn vào file
        const messages = readFile(MESSAGES_FILE) || [];
        const newMessage = {
          _id: genId(),
          conversationId,
          senderId,
          text,
          createdAt: new Date(),
        };
        writeFile(MESSAGES_FILE, [...messages, newMessage]);

        // 2. Cập nhật cuộc trò chuyện
        const conversations = readFile(CONVERSATIONS_FILE) || [];
        const conversation = conversations.find(c => c._id === conversationId);

        if (conversation) {
          conversation.lastMessage = text;
          conversation.updatedAt = newMessage.createdAt;
          writeFile(CONVERSATIONS_FILE, conversations);

          // 3. Gửi tin nhắn đến những người tham gia
          // Không gửi lại cho người gửi vì họ đã có "optimistic update" ở client
          conversation.participants.forEach(participantId => {
            if (String(participantId) !== String(senderId)) {
              io.to(participantId).emit('message:receive', newMessage);
            }
          });
        }
      } catch (error) {
        console.error("Error handling message:send event:", error);
        // Có thể emit một sự kiện lỗi về cho client
        socket.emit("message:error", { message: "Could not send message" });
      }
    });
  });

  return io;
}

module.exports = { initSocket };
