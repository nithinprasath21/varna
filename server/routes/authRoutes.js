const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/profile', verifyToken, controller.getProfile);
router.put('/profile', verifyToken, controller.updateProfile);
router.post('/address', verifyToken, controller.addAddress);
router.put('/address/:id', verifyToken, controller.updateAddress);
router.delete('/address/:id', verifyToken, controller.deleteAddress);

module.exports = router;
