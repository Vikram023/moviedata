const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.cinescope_token;

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select('-passwordHash');

  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  if (user.accountStatus === 'disabled') {
    throw new ApiError(403, 'Account has been disabled');
  }

  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.cinescope_token;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (user && user.accountStatus !== 'disabled') {
      req.user = user;
    }
  } catch {
    // Ignore invalid token for optional auth
  }

  next();
});

module.exports = { protect, optionalAuth };
