import mongoose from 'mongoose';

const internSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobileNumber: String,
  roll: String,
  department: String,
  employeeId: { type: String, unique: true },
  resumeUrl: String,        // Stores URL or path of uploaded resume
  moreFileUrl: String,      // Stores URL or path of uploaded "more" file
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Intern || mongoose.model('Intern', internSchema);