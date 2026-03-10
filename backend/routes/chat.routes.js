const express = require('express');
const router = express.Router();
const chatController = require('../controller/chat.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Lấy danh sách các cuộc trò chuyện của người dùng hiện tại
router.get('/conversations', authMiddleware, chatController.getConversations);

// Lấy lịch sử tin nhắn của một cuộc trò chuyện
router.get('/messages/:conversationId', authMiddleware, chatController.getMessages);

// Tạo một cuộc trò chuyện mới
router.post('/conversations', authMiddleware, chatController.createConversation);

module.exports = router;
