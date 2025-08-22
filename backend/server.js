const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { initializeUploadDirectories } = require('./utils/initDirectories');
require('dotenv').config();

const app = express();

// Initialize upload directories
console.log('Initializing upload directories...');
initializeUploadDirectories();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds
  connectTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 30000, // 30 seconds
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('Database:', mongoose.connection.name);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('Please check:');
  console.error('1. Your IP address is whitelisted in MongoDB Atlas');
  console.error('2. Your username and password are correct');
  console.error('3. Your cluster is running and accessible');
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/migrate', require('./routes/migrate'));
app.use('/api/test', require('./routes/test'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});