const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/orders', authenticate, authorizeRoles('client'), orderController.placeOrder);
router.get('/client/orders', authenticate, authorizeRoles('client'), orderController.getClientOrders);
router.get('/admin/orders', authenticate, authorizeRoles('admin'), orderController.getAllOrders);
router.patch('/admin/orders/:id/status', authenticate, authorizeRoles('admin'), orderController.updateOrderStatus);
router.get('/orders/search', authenticate, authorizeRoles('admin'), orderController.searchOrders);

module.exports = router;
