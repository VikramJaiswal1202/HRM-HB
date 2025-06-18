import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: String,
  department: String,
});

const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
export default Employee;