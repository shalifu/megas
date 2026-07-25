const express = require('express');
const chefChatController = require('../controllers/chefChatController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/chef-conversations', authenticate, authorizeRoles('admin'), chefChatController.getChefConversations);
router.get('/chef-messages/:userId', authenticate, authorizeRoles('admin'), chefChatController.getChefMessages);
router.post('/chef-messages', authenticate, authorizeRoles('admin'), chefChatController.sendChefMessage);

module.exports = router;
