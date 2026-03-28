const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  house: { type: String, required: true },
  description: { type: String },
  scentProfile: [{ type: String }],
  basePrice: { type: Number, required: true }, // Supplier Cost
  officialMSRP: { type: Number, required: true }, // Official USD Retail Price
  localRetailGHS: { type: Number }, // Ghana Market Retail Price
  landedCost: { type: Number },
  moq: { type: Number, default: 2 },
  stockQuantity: { type: Number, default: 0 },
  category: { type: String, default: 'Niche' },
  gender: { type: String, default: 'Unisex' },
  perfumer: { type: String },
  rating: { type: Number },
  season: { type: String },
  images: [{ type: String }],
  isArchive: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
