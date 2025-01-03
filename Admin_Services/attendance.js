const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment'); // To calculate work hours easily
const router = express.Router();

// Attendance Schema and Model
const attendanceSchema = new mongoose.Schema({
  employeeID: { type: String, required: true },
  status: { type: String, required: true }, // "check-in" or "check-out"
  timestamp: { type: Date, default: Date.now }, // Auto-stamped when record is created
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

// Employee and Manager Models (Assume these are already defined elsewhere)
const Employee = require('./employee'); // Adjust path to your actual Employee model
const Manager = require('./manager'); // Adjust path to your actual Manager model

// Helper function to calculate work hours between check-in and check-out
function calculateWorkHours(checkInTime, checkOutTime) {
  const duration = moment(checkOutTime).diff(moment(checkInTime), 'hours', true); // Returns a decimal value
  return duration.toFixed(2); // Returns work hours as a string with 2 decimal points
}

// Middleware to check if the user is logged in (authentication)
async function authenticate(req, res, next) {
  try {
    const { employeeID } = req.body; // Assuming employeeID is sent in the body
    let user = await Employee.findOne({ employeeID });

    if (!user) {
      user = await Manager.findOne({ employeeID });
      if (!user) {
        return res.status(401).json({ message: 'User not authenticated or found' });
      }
    }
    req.user = user; // Attach user to the request object
    next(); // Move to the next middleware or route handler
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Route to mark attendance (check-in or check-out)
router.post('/attendance', authenticate, async (req, res) => {
  try {
    const { status, officeLocation } = req.body; // officeLocation contains {lat, lng}

    // Validate inputs
    if (!status || !officeLocation || !officeLocation.lat || !officeLocation.lng) {
      return res.status(400).json({ message: 'Status and office location are required' });
    }

    // Check if the user is at the office location (simplified check for demo purposes)
    const officeCoordinates = { lat: 12.9716, lng: 77.5946 }; // Replace with actual office coordinates
    const distanceThreshold = 0.01; // Acceptable radius in terms of degrees (approximate)

    const distance = Math.sqrt(
      Math.pow(officeLocation.lat - officeCoordinates.lat, 2) + Math.pow(officeLocation.lng - officeCoordinates.lng, 2)
    );

    if (distance > distanceThreshold) {
      return res.status(400).json({ message: 'You must be at the office location to mark attendance' });
    }

    // Find last attendance record for check-in/out logic
    const lastAttendance = await Attendance.findOne({ employeeID: req.user.employeeID }).sort({ timestamp: -1 });

    if (status === 'check-in') {
      // Mark check-in time
      const newAttendance = new Attendance({
        employeeID: req.user.employeeID,
        status: 'check-in',
        timestamp: new Date()
      });
      await newAttendance.save();

      res.status(200).json({ message: 'Attendance marked as check-in', timestamp: newAttendance.timestamp });
    } else if (status === 'check-out') {
      if (!lastAttendance || lastAttendance.status === 'check-out') {
        return res.status(400).json({ message: 'You need to check-in first' });
      }

      // Mark check-out time and calculate work hours
      const checkOutTime = new Date();
      const workHours = calculateWorkHours(lastAttendance.timestamp, checkOutTime);

      // Update last attendance record to mark as 'check-out'
      lastAttendance.status = 'check-out';
      lastAttendance.timestamp = checkOutTime; // Update timestamp to check-out time
      await lastAttendance.save();

      res.status(200).json({
        message: 'Attendance marked as check-out',
        workHours: workHours
      });
    } else {
      return res.status(400).json({ message: 'Invalid status. Use "check-in" or "check-out"' });
    }
  } catch (error) {
    console.error('Error during attendance marking:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Export the model and router
module.exports = { Attendance, router };
