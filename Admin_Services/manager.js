const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true },
  inTime: String,
  employeeID: { type: String, unique: true, required: true }, // Use employeeID for both employees and managers
  password: { type: String, required: true },
  resetPasswordToken: String,  // To store the token
  resetPasswordExpire: Date 
});

const Manager = mongoose.model('Manager', managerSchema);

module.exports = Manager;
