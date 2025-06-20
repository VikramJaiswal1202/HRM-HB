import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: String,
  mobileNumber: String,
  department: String,
  designation: String,
  resumeUrl: String,      // ✅ stores uploaded resume file path
  documentsUrl: String,   // ✅ stores uploaded additional file path
  createdAt: { type: Date, default: Date.now },
});

const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
export default Employee;
