const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  purchaseCount: { type: Number, default: 0 },
  founderStatus: { type: Boolean, default: false },
  rewards: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
