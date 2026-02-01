const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/create', verifyToken, couponController.createCoupon);
router.get('/artisan/all', verifyToken, couponController.getArtisanCoupons);
router.post('/validate', couponController.validateCoupon);

module.exports = router;
