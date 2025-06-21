import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  status: { type: String, default: 'assigned' },
}, { timestamps: true });

// Export the model
export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
