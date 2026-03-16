const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

// Lazily initialised so we don't crash at startup if GOOGLE_CLIENT_ID is missing
let googleClient = null;
const getGoogleClient = () => {
  if (!googleClient) {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID is not set in .env');
    }
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return googleClient;
};

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
        provider: user.provider,
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

    // Guard: user may have registered via Google and has no password
    if (!user.password) {
      return res.status(400).json({
        message: 'This account was created with Google. Please use "Sign in with Google" instead.',
      });
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
        provider: user.provider,
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

// @route   POST /api/auth/google
// @desc    Sign in / register via Google OAuth (verify ID token server-side)
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body; // Google ID token from the frontend

    if (!credential) {
      return res.status(400).json({ message: 'Google credential token is required.' });
    }

    // Verify the token against Google's servers
    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Could not retrieve email from Google account.' });
    }

    // Find existing user by Google ID first, then fall back to email
    let user = await User.findOne({ providerId: googleId, provider: 'google' });

    if (!user) {
      // Check if a local account already exists with the same email
      const emailUser = await User.findOne({ email });
      if (emailUser && emailUser.provider === 'local') {
        // Link the Google identity to the existing local account
        emailUser.provider = 'google';
        emailUser.providerId = googleId;
        await emailUser.save();
        user = emailUser;
      } else if (!emailUser) {
        // Brand-new user — create an account
        user = await User.create({
          name: name || email.split('@')[0],
          email,
          provider: 'google',
          providerId: googleId,
          password: null,
          role: 'user',
        });
      } else {
        // Edge case: another Google account already linked to this email
        user = emailUser;
      }
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Google login successful.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
        picture: picture || null,
      },
      token,
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    if (error.message.includes('GOOGLE_CLIENT_ID')) {
      return res.status(500).json({ message: 'Google login is not configured on the server.' });
    }
    return res.status(401).json({ message: 'Invalid Google credential. Please try again.' });
  }
};

// @route   PUT /api/auth/profile
// @desc    Update the logged-in user's name and/or password
// @access  Private (requires valid JWT via authMiddleware)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // set by authMiddleware
    const { name, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // --- Name update (allowed for everyone) ---
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Name cannot be empty.' });
      }
      user.name = name.trim();
    }

    // --- Password update (only for local users) ---
    if (newPassword !== undefined) {
      if (user.provider === 'google') {
        return res.status(400).json({
          message: 'Google users cannot change their password here. Please manage your account via Google.',
        });
      }

      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters.' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ message: 'Server error while updating profile.' });
  }
};

module.exports = {
  register,
  login,
  validateToken,
  googleAuth,
  updateProfile,
};


