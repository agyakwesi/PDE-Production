const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true, unique: true },
  status: { type: String, enum: ['Open', 'Filled', 'Shipped', 'Arrived'], default: 'Open' },
  capacityLimit: { type: Number, required: true },
  currentTotal: { type: Number, default: 0 },
  closureDate: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Batch', batchSchema);
