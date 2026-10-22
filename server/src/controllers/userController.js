const User = require('../models/User');
const Review = require('../models/Review');
const CustomList = require('../models/CustomList');
const Rating = require('../models/Rating');
const Watchlist = require('../models/Watchlist');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// GET /api/users/:userId
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select(
    '-passwordHash -email'
  );
  if (!user) throw new ApiError(404, 'User not found');

  res.json(new ApiResponse(200, { user }, 'User profile retrieved'));
});

// PATCH /api/users/me
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'bio', 'profileImage', 'favoriteGenres', 'favoriteMovies', 'onboardingCompleted'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json(new ApiResponse(200, { user }, 'Profile updated'));
});

// GET /api/users/:userId/reviews
const getUserReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ userId: req.params.userId, moderationStatus: 'approved' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name profileImage'),
    Review.countDocuments({ userId: req.params.userId, moderationStatus: 'approved' }),
  ]);

  res.json(new ApiResponse(200, { reviews, total, page, totalPages: Math.ceil(total / limit) }, 'Reviews retrieved'));
});

// GET /api/users/:userId/lists
const getUserLists = asyncHandler(async (req, res) => {
  const isOwner = req.user && req.user._id.toString() === req.params.userId;
  const filter = { userId: req.params.userId };
  if (!isOwner) filter.visibility = 'public';

  const lists = await CustomList.find(filter).sort({ createdAt: -1 }).select('-items');
  res.json(new ApiResponse(200, { lists }, 'Lists retrieved'));
});

// GET /api/users/me/taste-profile
const getTasteProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [ratings, reviews, watchlist] = await Promise.all([
    Rating.find({ userId }),
    Review.find({ userId }),
    Watchlist.find({ userId }),
  ]);

  if (ratings.length === 0) {
    return res.json(
      new ApiResponse(200, { empty: true, message: 'Rate some movies to build your taste profile!' }, 'Taste profile empty')
    );
  }

  // Rating distribution
  const distribution = {};
  for (let i = 1; i <= 10; i++) distribution[i] = 0;
  ratings.forEach((r) => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });

  const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

  // Recent activity (last 10 ratings)
  const recentRatings = await Rating.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10);

  const watchedCount = watchlist.filter((w) => w.status === 'watched').length;
  const plannedCount = watchlist.filter((w) => w.status === 'planned').length;

  res.json(
    new ApiResponse(200, {
      totalRatings: ratings.length,
      totalReviews: reviews.length,
      totalWatchlist: watchlist.length,
      watchedCount,
      plannedCount,
      averageRating: Math.round(avgRating * 10) / 10,
      ratingDistribution: distribution,
      recentActivity: recentRatings,
      empty: false,
    }, 'Taste profile retrieved')
  );
});

module.exports = { getUserProfile, updateProfile, getUserReviews, getUserLists, getTasteProfile };
