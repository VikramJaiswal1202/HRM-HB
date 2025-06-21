import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: {
    type: String,
    enum: ['hr', 'manager', 'employee', 'intern'],
    required: true
  },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // for employee/intern
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // created by HR
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
