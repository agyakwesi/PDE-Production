const express = require('express');
const router = express.Router();
const { 
  getAdminOrders, 
  getMyOrders, 
  createOrder, 
  updateOrderStatus, 
  verifyPayment, 
  downloadReceipt,
  chargeCard,
  chargeMoMo,
  chargeSubmitOtp
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getAdminOrders).post(protect, createOrder);
router.route('/me').get(protect, getMyOrders);
router.route('/verify/:reference').get(protect, verifyPayment);
router.route('/receipt/:reference').get(protect, downloadReceipt);
router.route('/update-status').put(protect, admin, updateOrderStatus);

// Custom Paystack Charge API routes
router.route('/charge/card').post(protect, chargeCard);
router.route('/charge/momo').post(protect, chargeMoMo);
router.route('/charge/submit-otp').post(protect, chargeSubmitOtp);

module.exports = router;

