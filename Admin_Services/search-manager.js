const express = require('express');
const Manager = require('./manager'); // Adjust path to the Employee model
const router = express.Router();

// Endpoint to get Manager details by name
router.get('/:name', async (req, res) => {
  try {
    const managerName = req.params.name;
    
    // Find the manager by name
    const manager = await Manager.findOne({ name: managerName });
    
    if (!manager) {
      return res.status(404).json({ message: 'manager not found' });
    }
    
    // Respond with manager details
    res.status(200).json(manager);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
