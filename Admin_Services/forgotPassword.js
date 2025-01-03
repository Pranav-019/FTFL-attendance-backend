const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const Manager = require('./manager'); // Your Manager model
const Employee = require('./employee'); // Your Employee model
require('dotenv').config();

const router = express.Router();
router.use(bodyParser.json());

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  host: "mail.lifelinecart.com",
  port: 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Route to handle forgot password
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    let user = await Manager.findOne({ email });
    if (!user) {
      user = await Employee.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the OTP and its expiration time in the user document
    user.resetPasswordToken = otp; // Change this line
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Email details
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `You requested a password reset. Use the following OTP to reset your password: ${otp}`,
    };

    // Send the OTP via email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Error sending OTP for password reset:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
