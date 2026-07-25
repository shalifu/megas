const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password-admin', authenticate, authorizeRoles('admin'), authController.resetPasswordAdmin);

module.exports = router;
