import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: () => new Date(),
  },
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Leave'],
    required: true,
  },
  checkInTime: String,
  checkOutTime: String,
});

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);