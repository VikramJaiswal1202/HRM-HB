import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  // ✅ Now required and unique
  username: {
    type: String,
    required: true,
    unique: true // sparse no longer needed
  },

  passwordHash: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['hr', 'manager', 'employee', 'intern'],
    required: true
  },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },

  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
