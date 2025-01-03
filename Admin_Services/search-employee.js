const express = require('express');
const Employee = require('./employee'); // Adjust path to the Employee model
const router = express.Router();

// Endpoint to get employee details by name
router.get('/:name', async (req, res) => {
  try {
    const employeeName = req.params.name;
    
    // Find the employee by name
    const employee = await Employee.findOne({ name: employeeName });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Respond with employee details
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
