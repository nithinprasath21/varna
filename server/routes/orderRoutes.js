const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, verifyRole(['CUSTOMER']), controller.placeOrder);
router.get('/', verifyToken, verifyRole(['CUSTOMER']), controller.getOrderHistory);

module.exports = router;
