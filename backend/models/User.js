const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  balance: { type: Number, default: 100000 }, // Default ₹1,00,000 to start
  
  // 2FA fields
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String }, // TOTP secret key
  twoFactorBackupCodes: [{ 
    code: String, 
    used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  twoFactorSetupComplete: { type: Boolean, default: false },
  
  // Security fields
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  
  // Profile fields
  name: String,
  phone: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to update updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
