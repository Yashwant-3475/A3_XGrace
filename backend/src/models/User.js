const mongoose = require('mongoose');

// Define what a "User" looks like in our database
// For now we only store basic fields needed for authentication.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // basic required check (no advanced validation)
    },
    email: {
      type: String,
      required: true,
      unique: true, // each user should have a different email
    },
    password: {
      type: String,
      required: true, // this will store the hashed password, not plain text
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user', // every new account starts as a regular user
    },
  },
  {
    timestamps: true, // automatically add createdAt and updatedAt fields
  }
);

// Create the "User" model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;


