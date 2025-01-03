const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Manager = require('./manager'); // Your Manager model
const Employee = require('./employee'); // Your Employee model
require('dotenv').config();

const router = express.Router();
router.use(bodyParser.json());

// Route to handle updating password using OTP
router.post('/:otp', async (req, res) => {
  try {
    const { otp } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    let user = await Manager.findOne({ resetPasswordOtp: otp });
    if (!user) {
      user = await Employee.findOne({ resetPasswordOtp: otp });
    }

    if (!user) {
      return res.status(404).json({ message: 'Invalid OTP' });
    }

    // Check if the OTP has expired
    if (Date.now() > user.resetPasswordExpires) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Directly update the user's password
    user.password = newPassword;
    user.resetPasswordOtp = undefined; // Clear the OTP
    user.resetPasswordExpires = undefined; // Clear the expiration time

    await user.save();

    res.status(200).json({ message: 'Password has been updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
