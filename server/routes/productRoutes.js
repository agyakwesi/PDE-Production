const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct, shortenDescription } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/ai/shorten', protect, admin, shortenDescription);

router.route('/')
  .post(protect, admin, createProduct)
  .get(getProducts);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
