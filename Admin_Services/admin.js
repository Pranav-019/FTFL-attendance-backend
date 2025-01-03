const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env');
  process.exit(1);
}

const Employee = require('./employee');
const Manager = require('./manager');

const router = express.Router();
router.use(bodyParser.json()); 

// Function to generate a random password
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

// Route to add an employee
router.post('/add-employee', async (req, res) => {
  try {
    const { name, email, role, phone, inTime } = req.body;

    if (!name || !email || !role || !phone || !inTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const employeeID = `EMP${uuidv4().slice(0, 8).toUpperCase()}`;
    const rawPassword = generatePassword(); 

    const newEmployee = new Employee({
      name,
      email,
      role,
      phone,
      inTime,
      employeeID,
      password: rawPassword
    });

    await newEmployee.save();

    res.status(201).json({ message: 'Employee added successfully', employeeID, password: rawPassword });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Route to add a manager
router.post('/add-manager', async (req, res) => {
  try {
    const { name, email, role, phone, inTime } = req.body;

    if (!name || !email || !role || !phone || !inTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const employeeID = `EMP${uuidv4().slice(0, 8).toUpperCase()}`;  // Generate a unique employeeID
    const rawPassword = generatePassword(); 

    const newManager = new Manager({
      name,
      email,
      role,
      phone,
      inTime,
      employeeID,  // Use employeeID for both employees and managers
      password: rawPassword
    });

    await newManager.save();

    res.status(201).json({ message: 'Manager added successfully', employeeID, password: rawPassword });
  } catch (error) {
    console.error('Error adding manager:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
