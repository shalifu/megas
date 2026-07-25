const express = require('express');
const jobController = require('../controllers/jobController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/jobs/apply', authenticate, authorizeRoles('client'), jobController.applyForJob);
router.get('/client/jobs', authenticate, authorizeRoles('client'), jobController.getClientApplications);
router.get('/admin/jobs', authenticate, authorizeRoles('admin'), jobController.getAllApplications);
router.patch('/admin/jobs/:id/status', authenticate, authorizeRoles('admin'), jobController.updateApplicationStatus);
router.get('/jobs/search', authenticate, authorizeRoles('admin'), jobController.searchApplications);

module.exports = router;
