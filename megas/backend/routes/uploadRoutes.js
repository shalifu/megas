const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const uploadController = require('../controllers/uploadController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/jobs/apply-with-cv', authenticate, authorizeRoles('client'), upload.single('cv'), uploadController.applyWithCv);

module.exports = router;
