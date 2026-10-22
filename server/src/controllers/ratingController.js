const Rating = require('../models/Rating');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getCommunityRating } = require('../services/ratingService');

// POST /api/ratings
const createRating = asyncHandler(async (req, res) => {
  const { tmdbId, mediaType, rating } = req.body;
  const userId = req.user._id;

  const existing = await Rating.findOne({ userId, tmdbId, mediaType });
  if (existing) {
    existing.rating = rating;
    await existing.save();
    const stats = await getCommunityRating(tmdbId, mediaType);
    return res.json(new ApiResponse(200, { rating: existing, communityStats: stats }, 'Rating updated'));
  }

  const newRating = await Rating.create({ userId, tmdbId, mediaType, rating });
  const stats = await getCommunityRating(tmdbId, mediaType);
  res.status(201).json(new ApiResponse(201, { rating: newRating, communityStats: stats }, 'Rating submitted'));
});

// GET /api/ratings/:mediaType/:tmdbId — community stats
const getCommunityStats = asyncHandler(async (req, res) => {
  const { mediaType, tmdbId } = req.params;
  if (!['movie', 'tv'].includes(mediaType)) throw new ApiError(400, 'Invalid media type');
  const stats = await getCommunityRating(Number(tmdbId), mediaType);
  res.json(new ApiResponse(200, stats, 'Community rating stats'));
});

// GET /api/ratings/:mediaType/:tmdbId/me — user's own rating
const getMyRating = asyncHandler(async (req, res) => {
  const { mediaType, tmdbId } = req.params;
  const rating = await Rating.findOne({
    userId: req.user._id,
    tmdbId: Number(tmdbId),
    mediaType,
  });
  res.json(new ApiResponse(200, { rating: rating || null }, 'User rating'));
});

// DELETE /api/ratings/:ratingId
const deleteRating = asyncHandler(async (req, res) => {
  const rating = await Rating.findById(req.params.ratingId);
  if (!rating) throw new ApiError(404, 'Rating not found');
  if (rating.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to delete this rating');
  }
  await rating.deleteOne();
  const stats = await getCommunityRating(rating.tmdbId, rating.mediaType);
  res.json(new ApiResponse(200, { communityStats: stats }, 'Rating deleted'));
});

module.exports = { createRating, getCommunityStats, getMyRating, deleteRating };
