const express = require('express');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/admin/users', authenticate, authorizeRoles('admin'), adminController.getUsers);
router.patch('/admin/users/:id/approve', authenticate, authorizeRoles('admin'), adminController.approveUser);
router.patch('/admin/users/:id/promote', authenticate, authorizeRoles('admin'), adminController.promoteUser);
router.get('/admin/summary', authenticate, adminController.getSummary);
router.get('/users/me', authenticate, userController.getCurrentUser);
router.get('/client/summary', authenticate, userController.getClientSummary);
router.get('/preadmin/summary', authenticate, userController.getPreAdminSummary);
router.get('/roles', authenticate, userController.getRoles);
router.get('/users/search', authenticate, adminController.searchUsers);

module.exports = router;
