const express = require('express');
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/chat/conversations', authenticate, chatController.getConversations);
router.get('/chat/messages/:userId', authenticate, chatController.getMessages);
router.post('/chat/messages', authenticate, chatController.sendMessage);

module.exports = router;
