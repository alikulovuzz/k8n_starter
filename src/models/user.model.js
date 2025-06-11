const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ism kiritish majburiy'],
    trim: true,
    minlength: [2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak']
  },
  email: {
    type: String,
    required: [true, 'Email kiritish majburiy'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Noto\'g\'ri email formati']
  },
  password: {
    type: String,
    required: [true, 'Parol kiritish majburiy'],
    minlength: [6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Telefon raqam kiritish majburiy'],
    validate: {
      validator: function(v) {
        return /^\+?\d{10,}$/.test(v.replace(/\s/g, ''));
      },
      message: 'Noto\'g\'ri telefon raqam formati'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: 'default.jpg'
  },
  address: {
    street: String,
    city: String,
    country: String,
    zipCode: String
  },
  birthDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Password changed check method
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Virtual field for full name
userSchema.virtual('fullName').get(function() {
  return `${this.name}`;
});

const User = mongoose.model('User', userSchema);

module.exports = User; 