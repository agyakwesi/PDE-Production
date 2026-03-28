const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  house: { type: String, required: true },
  description: { type: String },
  scentProfile: [{ type: String }],
  basePrice: { type: Number, required: true }, // Supplier Cost
  moq: { type: Number, default: 2 },
  stockQuantity: { type: Number, default: 0 },
  category: { type: String, default: 'Niche' },
  gender: { type: String, default: 'Unisex' },
  perfumer: { type: String },
  rating: { type: Number },
  season: { type: String },
  images: [{ type: String }],
  isArchive: { type: Boolean, default: false },
  localRetailPrice: { type: Number }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.basePrice;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

const { getGlobalPrice } = require('../utils/pricing');

productSchema.virtual('savings').get(function() {
  if (this.localRetailPrice && this.basePrice) {
    const globalPrice = getGlobalPrice(this.basePrice);
    return Math.max(0, this.localRetailPrice - globalPrice);
  }
  return 0;
});

module.exports = mongoose.model('Product', productSchema);
