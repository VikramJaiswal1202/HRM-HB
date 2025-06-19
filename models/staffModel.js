import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobileNumber: String,
  department: String,
  designation: String,
  employeeId: { type: String, unique: true },
  resumeUrl: String,        // Uploaded resume file path
  documentsUrl: String,     // Uploaded supporting documents file path
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Staff || mongoose.model('Staff', staffSchema);