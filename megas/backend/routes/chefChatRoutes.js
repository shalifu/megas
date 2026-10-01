const express = require('express');
const chefChatController = require('../controllers/chefChatController');
const { authenticate, authorizeChiefAccess } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/chef-conversations', authenticate, authorizeChiefAccess, chefChatController.getChefConversations);
router.get('/chef-messages/:userId', authenticate, authorizeChiefAccess, chefChatController.getChefMessages);
router.post('/chef-messages', authenticate, authorizeChiefAccess, chefChatController.sendChefMessage);

module.exports = router;
