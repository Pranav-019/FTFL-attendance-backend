const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // Ensure correct path to .env file

const app = express();
app.use(express.json()); // Built-in middleware for JSON parsing

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Successfully connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

// Import Routes
const adminRoutes = require('./Admin_Services/admin'); // Adjust path to admin.js
const loginRoutes = require('./Login_Services/login'); // Adjust path to login.js
const forgotPasswordRoutes = require('./Admin_Services/forgotPassword'); // Forgot password route
const updatePasswordRoutes = require('./Admin_Services/updatePassword'); // Update password route
const employeeRoutes = require('./Admin_Services/search-employee'); // Import the search employee route
const managerRoutes = require('./Admin_Services/search-manager'); // Import the search employee route

// Use Routes
app.use('/admin', adminRoutes);
app.use('/login', loginRoutes);
app.use('/forgot-password', forgotPasswordRoutes); // Forgot password endpoint
app.use('/update-password', updatePasswordRoutes); // Update password endpoint
app.use('/search-employee', employeeRoutes); // Search employee route
app.use('/search-manager/', managerRoutes); // Search Manager

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
