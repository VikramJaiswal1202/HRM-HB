import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (employee or intern)
    required: true,
  },

  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Typically an HR or manager
    required: true,
  },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },

  status: {
    type: String,
    enum: ['pending', 'in progress', 'completed', 'cancelled'],
    default: 'pending',
  },

  dueDate: {
    type: Date,
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  }
}, {
  timestamps: true
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);