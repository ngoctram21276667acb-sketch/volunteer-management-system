const { readFile, writeFile, genId } = require("../utils/fileStore");

const CONVERSATIONS_FILE = "conversations.json";
const MESSAGES_FILE = "messages.json";
const USERS_FILE = "users.json";

// Lấy danh sách các cuộc trò chuyện của người dùng
const getConversations = (req, res) => {
    try {
        const conversations = readFile(CONVERSATIONS_FILE) || [];
        const users = readFile(USERS_FILE) || [];
        const userId = req.user.id || req.user._id;

        const userConversations = conversations.filter(c => 
            c.participants.includes(String(userId)) || c.participants.includes(userId)
        );

        // Thêm thông tin người nhận vào mỗi cuộc trò chuyện
        const populatedConversations = userConversations.map(conv => {
            const otherParticipantId = conv.participants.find(pId => String(pId) !== String(userId));
            const otherParticipant = users.find(u => String(u._id || u.id) === String(otherParticipantId));
            return {
                ...conv,
                recipient: {
                    _id: otherParticipant?._id || otherParticipant?.id,
                    fullName: otherParticipant?.fullName,
                    // Thêm các trường khác nếu cần
                }
            };
        });

        res.json({ success: true, data: populatedConversations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy tin nhắn của một cuộc trò chuyện
const getMessages = (req, res) => {
    try {
        const messages = readFile(MESSAGES_FILE) || [];
        const { conversationId } = req.params;
        const conversationMessages = messages.filter(m => m.conversationId === conversationId);
        res.json({ success: true, data: conversationMessages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tạo một cuộc trò chuyện mới
const createConversation = (req, res) => {
    try {
        const conversations = readFile(CONVERSATIONS_FILE) || [];
        const { recipientId } = req.body;
        const senderId = req.user.id || req.user._id;

        // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa
        const existingConversation = conversations.find(c =>
            (c.participants.includes(String(senderId)) || c.participants.includes(senderId)) && 
            (c.participants.includes(String(recipientId)) || c.participants.includes(recipientId))
        );

        if (existingConversation) {
            return res.json({ success: true, data: existingConversation, isNew: false });
        }

        const newConversation = {
            _id: genId(),
            participants: [String(senderId), String(recipientId)],
            lastMessage: "",
            updatedAt: Date.now(),
        };

        writeFile(CONVERSATIONS_FILE, [...conversations, newConversation]);
        res.status(201).json({ success: true, data: newConversation, isNew: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getConversations,
    getMessages,
    createConversation,
};
