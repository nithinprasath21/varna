const express = require('express');
const router = express.Router();
const controller = require('../controllers/ngoController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.get('/artisans', verifyToken, verifyRole(['NGO']), controller.getManagedArtisans);
router.post('/release-artisan', verifyToken, verifyRole(['NGO']), controller.releaseArtisan);
router.post('/link-artisan', verifyToken, verifyRole(['NGO']), controller.linkArtisan); // For testing setup

module.exports = router;
