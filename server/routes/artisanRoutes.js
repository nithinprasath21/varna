const express = require('express');
const router = express.Router();
const controller = require('../controllers/artisanController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.get('/dashboard', verifyToken, verifyRole(['ARTISAN']), controller.getDashboardStats);
router.post('/products', verifyToken, verifyRole(['ARTISAN']), controller.addProduct);
router.get('/products', verifyToken, verifyRole(['ARTISAN']), controller.getProducts);
router.put('/products/:id', verifyToken, verifyRole(['ARTISAN']), controller.updateProduct);
router.delete('/products/:id', verifyToken, verifyRole(['ARTISAN']), controller.deleteProduct);

module.exports = router;
