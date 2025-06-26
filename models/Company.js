import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin' },
}, { timestamps: true });

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);