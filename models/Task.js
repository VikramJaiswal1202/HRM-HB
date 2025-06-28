import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed"],
    default: "pending",
  },
  completionFile: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Export the model
export default mongoose.models.Task || mongoose.model("Task", TaskSchema);