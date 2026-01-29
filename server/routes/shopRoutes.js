const express = require('express');
const router = express.Router();
const controller = require('../controllers/shopController');

router.get('/products', controller.getAllProducts);
router.get('/products/:id', controller.getProductById);
router.get('/recommendations', controller.getRecommendations);

module.exports = router;
