const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create({ name, email, passwordHash: password });
  const token = generateToken(user._id);

  res.cookie('cinescope_token', token, COOKIE_OPTIONS);
  res.status(201).json(new ApiResponse(201, { user }, 'Account created successfully'));
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  if (user.accountStatus === 'disabled') {
    throw new ApiError(403, 'Your account has been disabled. Contact support.');
  }

  const token = generateToken(user._id);
  res.cookie('cinescope_token', token, COOKIE_OPTIONS);

  // Strip passwordHash from response
  const userObj = user.toJSON();
  res.json(new ApiResponse(200, { user: userObj }, 'Login successful'));
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('cinescope_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json(new ApiResponse(200, null, 'Logged out successfully'));
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, { user: req.user }, 'User retrieved'));
});

module.exports = { register, login, logout, getMe };
