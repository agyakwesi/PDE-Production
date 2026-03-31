const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  depositStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  paymentReference: { type: String },
  amountPaid: { type: Number, default: 0 },
  orderStatus: { type: String, enum: ['Confirmed', 'Processing', 'Shipped', 'Ready for Pickup', 'Completed'], default: 'Confirmed' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
