
import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  employeeId: { type: String, required: true }, 
  date: { type: Date, required: true },
  notes: { type: String },
  imagePath: { type: String }, 
}, { timestamps: true });

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);