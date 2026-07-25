const express = require('express');
const taskController = require('../controllers/taskController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/tasks', authenticate, authorizeRoles('admin'), taskController.createTask);
router.get('/tasks/assigned', authenticate, authorizeRoles('preadmin'), taskController.getAssignedTasks);
router.get('/admin/tasks', authenticate, authorizeRoles('admin'), taskController.getAllTasks);
router.patch('/tasks/:id/status', authenticate, taskController.updateTaskStatus);

module.exports = router;
