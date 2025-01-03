const express = require('express');
const moment = require('moment'); // For date and time calculations
const Employee = require('../Admin_Services/employee'); // Employee model
const Manager = require('../Admin_Services/manager'); // Manager model
const Attendance = require('../Admin_Services/attendance_model'); // Attendance model

const router = express.Router();

// Helper function to calculate geodetic distance (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Helper function to calculate work hours between check-in and check-out
function calculateWorkHours(checkInTime, checkOutTime) {
  const duration = moment(checkOutTime).diff(moment(checkInTime), 'hours', true); // Decimal value
  return duration.toFixed(2); // String with 2 decimal points
}

// Middleware to check if the user is authenticated
async function authenticate(req, res, next) {
  try {
    const { employeeID } = req.body;

    let user = await Employee.findOne({ employeeID });
    if (!user) {
      user = await Manager.findOne({ employeeID });
      if (!user) {
        return res.status(401).json({ message: 'User not authenticated or found' });
      }
    }

    req.user = user; // Attach the user to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Login endpoint
router.post('/', async (req, res) => {
  try {
    const { employeeID, password } = req.body;

    if (!employeeID || !password) {
      return res.status(400).json({ message: 'Employee ID and password are required' });
    }

    let user = await Employee.findOne({ employeeID });
    if (!user) {
      user = await Manager.findOne({ employeeID });
      if (!user) {
        console.log('User not found:', employeeID);
        return res.status(404).json({ message: 'User not found' });
      }
    }

    // Compare the provided password with the stored password
    if (user.password !== password) {
      console.log('Invalid credentials for user ID:', employeeID);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} login successful`,
      employeeID: user.employeeID,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Attendance endpoint
router.post('/attendance', authenticate, async (req, res) => {
  try {
    const { status, officeLocation } = req.body;

    if (!status || !officeLocation || !officeLocation.lat || !officeLocation.lng) {
      return res.status(400).json({ message: 'Status and office location are required' });
    }

    const officeCoordinates = { lat: 12.9716, lng: 77.5946 }; // Office latitude and longitude
    const distanceThreshold = 0.5; // Distance threshold in kilometers

    const distance = calculateDistance(
      officeLocation.lat,
      officeLocation.lng,
      officeCoordinates.lat,
      officeCoordinates.lng
    );

    if (distance > distanceThreshold) {
      return res.status(400).json({ message: 'You must be at the office location to mark attendance' });
    }

    const lastAttendance = await Attendance.findOne({ employeeID: req.user.employeeID }).sort({ timestamp: -1 });

    if (status === 'check-in') {
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

      const checkOutTime = new Date();
      const workHours = calculateWorkHours(lastAttendance.timestamp, checkOutTime);

      lastAttendance.status = 'check-out';
      lastAttendance.workHours = workHours;
      await lastAttendance.save();

      res.status(200).json({
        message: 'Attendance marked as check-out',
        workHours
      });
    } else {
      return res.status(400).json({ message: 'Invalid status. Use "check-in" or "check-out"' });
    }
  } catch (error) {
    console.error('Error during attendance marking:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
