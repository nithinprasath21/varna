const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, verifyRole(['CUSTOMER']), controller.placeOrder);
router.get('/', verifyToken, verifyRole(['CUSTOMER']), controller.getOrderHistory);
router.patch('/:id/status', verifyToken, verifyRole(['ARTISAN', 'ADMIN']), controller.updateOrderStatus);
router.post('/:id/fulfillment', verifyToken, verifyRole(['ARTISAN']), controller.updateFulfillment);

module.exports = router;
