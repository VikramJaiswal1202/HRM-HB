import mongoose from 'mongoose';

const SuperAdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
}, { timestamps: true });

export default mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', SuperAdminSchema);
