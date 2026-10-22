const User = require('../models/User');
const Rating = require('../models/Rating');
const Review = require('../models/Review');
const CustomList = require('../models/CustomList');
const Report = require('../models/Report');
const Watchlist = require('../models/Watchlist');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalRatings,
    totalReviews,
    totalLists,
    pendingReports,
    recentUsers,
    mostRatedTitles,
    mostReviewedTitles,
  ] = await Promise.all([
    User.countDocuments(),
    Rating.countDocuments(),
    Review.countDocuments({ moderationStatus: 'approved' }),
    CustomList.countDocuments(),
    Report.countDocuments({ status: 'pending' }),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt role'),
    Rating.aggregate([
      { $group: { _id: { tmdbId: '$tmdbId', mediaType: '$mediaType' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Review.aggregate([
      { $match: { moderationStatus: 'approved' } },
      { $group: { _id: { tmdbId: '$tmdbId', mediaType: '$mediaType' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  res.json(new ApiResponse(200, {
    stats: { totalUsers, totalRatings, totalReviews, totalLists, pendingReports },
    recentUsers,
    mostRatedTitles,
    mostReviewedTitles,
  }, 'Admin dashboard data'));
});

// GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select('-passwordHash'),
    User.countDocuments(filter),
  ]);

  res.json(new ApiResponse(200, { users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }, 'Users retrieved'));
});

// PATCH /api/admin/users/:userId/status
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'disabled'].includes(status)) throw new ApiError(400, 'Invalid status');

  const user = await User.findById(req.params.userId);
  if (!user) throw new ApiError(404, 'User not found');
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'Cannot change your own account status');
  }

  user.accountStatus = status;
  await user.save();
  res.json(new ApiResponse(200, { user }, `User ${status}`));
});

// GET /api/admin/reports
const getReports = asyncHandler(async (req, res) => {
  const { status = 'pending', page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status !== 'all') filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reporterId', 'name email')
      .populate('reviewedBy', 'name'),
    Report.countDocuments(filter),
  ]);

  res.json(new ApiResponse(200, { reports, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }, 'Reports retrieved'));
});

// PATCH /api/admin/reports/:reportId
const updateReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.reportId);
  if (!report) throw new ApiError(404, 'Report not found');

  const { status, adminNote, removeContent } = req.body;
  if (status) report.status = status;
  if (adminNote) report.adminNote = adminNote;
  report.reviewedBy = req.user._id;

  // If the report is about a review and admin wants to remove it
  if (removeContent && report.targetType === 'review') {
    await Review.findByIdAndUpdate(report.targetId, { moderationStatus: 'removed' });
  }

  await report.save();
  res.json(new ApiResponse(200, { report }, 'Report updated'));
});

module.exports = { getDashboard, getUsers, updateUserStatus, getReports, updateReport };
