const express = require('express');
const router = express.Router();
const { getAdminOrders, getMyOrders, createOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getAdminOrders).post(protect, createOrder);
router.route('/me').get(protect, getMyOrders);

module.exports = router;
