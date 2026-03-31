const express = require('express');
const router = express.Router();
const { 
  getAdminOrders, 
  getMyOrders, 
  createOrder, 
  updateOrderStatus, 
  verifyPayment, 
  downloadReceipt 
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getAdminOrders).post(protect, createOrder);
router.route('/me').get(protect, getMyOrders);
router.route('/verify/:reference').get(protect, verifyPayment);
router.route('/receipt/:reference').get(protect, downloadReceipt);
router.route('/update-status').put(protect, admin, updateOrderStatus);

module.exports = router;
