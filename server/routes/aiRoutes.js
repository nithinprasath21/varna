const express = require('express');
const router = express.Router();
const controller = require('../controllers/aiController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// router.post('/generate-description', verifyToken, verifyRole(['ARTISAN']), controller.generateDescription);
router.post('/generate-description', controller.generateDescription);

module.exports = router;
