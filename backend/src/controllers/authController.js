const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

// Lazily initialised to avoid crashing at startup if GOOGLE_CLIENT_ID is missing
let googleClient = null;
const getGoogleClient = () => {
  if (!googleClient) {
    if (!process.env.GOOGLE_CLIENT_ID) throw new Error('GOOGLE_CLIENT_ID is not set in .env');
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return googleClient;
};

// Signs a JWT containing userId and role, valid for 1 hour
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set in .env');
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// POST /api/auth/register — create a new local user account
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required.' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: role || 'user' });
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, provider: user.provider },
      token,
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// POST /api/auth/login — authenticate an existing local user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password.' });

    // Google-only accounts have no password hash
    if (!user.password)
      return res.status(400).json({ message: 'This account was created with Google. Please use "Sign in with Google" instead.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password.' });

    const token = generateToken(user);
    res.json({
      message: 'Login successful.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, provider: user.provider },
      token,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// GET /api/auth/validate — verify a JWT and return the decoded user info
const validateToken = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ valid: false, message: 'No token provided.' });

    if (!process.env.JWT_SECRET)
      return res.status(500).json({ valid: false, message: 'JWT_SECRET not configured.' });

    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    return res.status(200).json({ valid: true, user: { id: decoded.userId, role: decoded.role } });
  } catch (error) {
    return res.status(401).json({ valid: false, message: 'Token is invalid or expired.' });
  }
};

// POST /api/auth/google — sign in or register via Google OAuth ID token
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential)
      return res.status(400).json({ message: 'Google credential token is required.' });

    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    if (!email)
      return res.status(400).json({ message: 'Could not retrieve email from Google account.' });

    let user = await User.findOne({ providerId: googleId, provider: 'google' });

    if (!user) {
      const emailUser = await User.findOne({ email });
      if (emailUser && emailUser.provider === 'local') {
        // Link existing local account to this Google identity
        emailUser.provider = 'google';
        emailUser.providerId = googleId;
        await emailUser.save();
        user = emailUser;
      } else if (!emailUser) {
        user = await User.create({ name: name || email.split('@')[0], email, provider: 'google', providerId: googleId, password: null, role: 'user' });
      } else {
        user = emailUser;
      }
    }

    const token = generateToken(user);
    return res.status(200).json({
      message: 'Google login successful.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, provider: user.provider, picture: picture || null },
      token,
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    if (error.message.includes('GOOGLE_CLIENT_ID'))
      return res.status(500).json({ message: 'Google login is not configured on the server.' });
    return res.status(401).json({ message: 'Invalid Google credential. Please try again.' });
  }
};

// PUT /api/auth/profile — update logged-in user's name and/or password (Private)
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const { name, currentPassword, newPassword } = req.body;

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: 'Name cannot be empty.' });
      user.name = name.trim();
    }

    if (newPassword !== undefined) {
      if (user.provider === 'google')
        return res.status(400).json({ message: 'Google users cannot change their password here.' });
      if (!currentPassword)
        return res.status(400).json({ message: 'Current password is required to set a new password.' });
      if (newPassword.length < 6)
        return res.status(400).json({ message: 'New password must be at least 6 characters.' });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, provider: user.provider },
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ message: 'Server error while updating profile.' });
  }
};

module.exports = { register, login, validateToken, googleAuth, updateProfile };
