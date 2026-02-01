const express = require('express');
const router = express.Router();
const controller = require('../controllers/artisanController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.get('/dashboard', verifyToken, verifyRole(['ARTISAN']), controller.getDashboardStats);
router.post('/products', verifyToken, verifyRole(['ARTISAN']), controller.addProduct);
router.get('/products', verifyToken, verifyRole(['ARTISAN']), controller.getProducts);
router.put('/products/:id', verifyToken, verifyRole(['ARTISAN']), controller.updateProduct);
router.delete('/products/:id', verifyToken, verifyRole(['ARTISAN']), controller.deleteProduct);

router.get('/profile', verifyToken, verifyRole(['ARTISAN']), controller.getProfile);
router.put('/profile', verifyToken, verifyRole(['ARTISAN']), controller.updateProfile);

module.exports = router;
