const express = require('express');
const chefApplicationController = require('../controllers/chefApplicationController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/chef-applications', authenticate, authorizeRoles('admin'), chefApplicationController.applyForChef);
router.get('/chef-applications/my', authenticate, authorizeRoles('preadmin'), chefApplicationController.getUserChefApplication);
router.get('/chef-applications', authenticate, authorizeRoles('admin'), chefApplicationController.getAllChefApplications);
router.patch('/chef-applications/:id/status', authenticate, authorizeRoles('admin'), chefApplicationController.updateChefApplicationStatus);

module.exports = router;
