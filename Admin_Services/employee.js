const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true },
  inTime: String,
  employeeID: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  resetPasswordToken: String,  // To store the token
  resetPasswordExpire: Date  // To store token expiration time
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
