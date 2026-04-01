const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  description: { type: String },
  scentProfile: [{ type: String }],
  supplierCost: { type: Number, required: true },
  moq: { type: Number, default: 2 },
  stockQuantity: { type: Number, default: 0 },
  category: { type: String, default: 'Niche' },
  wardrobeCategory: { type: String, enum: ['Day', 'Night', 'Office', 'Rainy Day', 'None'], default: 'None' },
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
      return ret;
    }
  },
  toObject: { virtuals: true }
});

const { getGlobalPrice } = require('../utils/pricing');

productSchema.virtual('savings').get(function() {
  if (this.localRetailPrice && this.supplierCost) {
    const globalPrice = getGlobalPrice(this.supplierCost);
    return Math.max(0, this.localRetailPrice - globalPrice);
  }
  return 0;
});

productSchema.index({ isArchive: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
