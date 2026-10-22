const Review = require('../models/Review');
const HelpfulVote = require('../models/HelpfulVote');
const Report = require('../models/Report');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const SORT_OPTIONS = {
  recent: { createdAt: -1 },
  helpful: { helpfulCount: -1 },
  highest: { rating: -1 },
  lowest: { rating: 1 },
};

// POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { tmdbId, mediaType, reviewText, containsSpoilers, rating } = req.body;
  const userId = req.user._id;

  const existing = await Review.findOne({ userId, tmdbId, mediaType });
  if (existing) throw new ApiError(409, 'You have already reviewed this title. Edit your existing review.');

  const review = await Review.create({ userId, tmdbId, mediaType, reviewText, containsSpoilers, rating });
  await review.populate('userId', 'name profileImage');

  res.status(201).json(new ApiResponse(201, { review }, 'Review submitted'));
});

// GET /api/reviews/:mediaType/:tmdbId
const getReviews = asyncHandler(async (req, res) => {
  const { mediaType, tmdbId } = req.params;
  const { sort = 'recent', page = 1, limit = 10 } = req.query;
  const sortObj = SORT_OPTIONS[sort] || SORT_OPTIONS.recent;
  const skip = (parseInt(page) - 1) * Math.min(parseInt(limit), 20);

  const filter = { tmdbId: Number(tmdbId), mediaType, moderationStatus: 'approved' };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Math.min(parseInt(limit), 20))
      .populate('userId', 'name profileImage'),
    Review.countDocuments(filter),
  ]);

  // If user is logged in, include their helpful votes
  let userVotes = [];
  if (req.user) {
    const reviewIds = reviews.map((r) => r._id);
    const votes = await HelpfulVote.find({ userId: req.user._id, reviewId: { $in: reviewIds } });
    userVotes = votes.map((v) => v.reviewId.toString());
  }

  res.json(
    new ApiResponse(200, {
      reviews: reviews.map((r) => ({
        ...r.toJSON(),
        isHelpfulByUser: userVotes.includes(r._id.toString()),
      })),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / Math.min(parseInt(limit), 20)),
    }, 'Reviews retrieved')
  );
});

// PATCH /api/reviews/:reviewId
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, 'Review not found');
  if (review.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own reviews');
  }

  const { reviewText, containsSpoilers, rating } = req.body;
  if (reviewText !== undefined) review.reviewText = reviewText;
  if (containsSpoilers !== undefined) review.containsSpoilers = containsSpoilers;
  if (rating !== undefined) review.rating = rating;

  await review.save();
  await review.populate('userId', 'name profileImage');
  res.json(new ApiResponse(200, { review }, 'Review updated'));
});

// DELETE /api/reviews/:reviewId
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, 'Review not found');

  const isOwner = review.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Not authorized to delete this review');

  await HelpfulVote.deleteMany({ reviewId: review._id });
  await review.deleteOne();
  res.json(new ApiResponse(200, null, 'Review deleted'));
});

// POST /api/reviews/:reviewId/helpful
const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, 'Review not found');
  if (review.userId.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot mark your own review as helpful');
  }

  const existing = await HelpfulVote.findOne({ userId: req.user._id, reviewId: review._id });
  if (existing) throw new ApiError(409, 'You have already marked this review as helpful');

  await HelpfulVote.create({ userId: req.user._id, reviewId: review._id });
  review.helpfulCount += 1;
  await review.save();

  res.json(new ApiResponse(200, { helpfulCount: review.helpfulCount }, 'Marked as helpful'));
});

// DELETE /api/reviews/:reviewId/helpful
const removeHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, 'Review not found');

  const vote = await HelpfulVote.findOneAndDelete({ userId: req.user._id, reviewId: review._id });
  if (!vote) throw new ApiError(404, 'Helpful vote not found');

  review.helpfulCount = Math.max(0, review.helpfulCount - 1);
  await review.save();
  res.json(new ApiResponse(200, { helpfulCount: review.helpfulCount }, 'Helpful vote removed'));
});

// POST /api/reviews/:reviewId/report
const reportReview = asyncHandler(async (req, res) => {
  const { reason, description } = req.body;
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, 'Review not found');

  await Report.create({
    reporterId: req.user._id,
    targetType: 'review',
    targetId: review._id,
    reason,
    description,
  });

  res.status(201).json(new ApiResponse(201, null, 'Review reported. Thank you for your feedback.'));
});

module.exports = { createReview, getReviews, updateReview, deleteReview, markHelpful, removeHelpful, reportReview };
