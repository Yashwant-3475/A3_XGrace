const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to create a JWT token for a user
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Please add it to your .env file.');
  }

  // The token will contain the user's id and role.
  // This can be used later for protected routes.
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h', // token will be valid for 1 hour
    }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic check: make sure required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash the password before saving it to the database
    const saltRounds = 10; // safe default for beginners
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user document
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    // Generate a JWT token for the newly registered user
    const token = generateToken(user);

    // Return simple user info (without password) and the token
    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @route   POST /api/auth/login
// @desc    Log in an existing user
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic check: make sure required fields are present
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // If password is correct, generate a JWT token
    const token = generateToken(user);

    res.json({
      message: 'Login successful.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @route   GET /api/auth/validate
// @desc    Validate an existing JWT token
// @access  Private (requires valid token in Authorization header)
const validateToken = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false, message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ valid: false, message: 'JWT_SECRET not configured.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.status(200).json({
      valid: true,
      user: {
        id: decoded.userId,
        role: decoded.role,
      },
    });
  } catch (error) {
    // Token is expired, malformed, or has invalid signature
    return res.status(401).json({ valid: false, message: 'Token is invalid or expired.' });
  }
};

module.exports = {
  register,
  login,
  validateToken,
};


