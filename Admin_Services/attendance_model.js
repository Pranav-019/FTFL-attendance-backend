const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeID: { type: String, required: true },
  status: { type: String, required: true }, // "check-in" or "check-out"
  timestamp: { type: Date, default: Date.now }, // Auto-stamped when record is created
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance; // Correct export
