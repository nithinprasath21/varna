const express = require('express');
const router = express.Router();
const controller = require('../controllers/blockchainController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.post('/mint', verifyToken, verifyRole(['ARTISAN']), controller.mintProduct);
router.get('/verify/:hash', controller.verifyProduct);

module.exports = router;
