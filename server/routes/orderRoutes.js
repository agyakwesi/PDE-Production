const express = require('express');
const router = express.Router();
const { getAdminOrders, getMyOrders } = require('../controllers/orderController');

router.route('/').get(getAdminOrders);
router.route('/me').get(getMyOrders);

module.exports = router;
