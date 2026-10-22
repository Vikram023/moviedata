const Watchlist = require('../models/Watchlist');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// GET /api/watchlist
const getWatchlist = asyncHandler(async (req, res) => {
  const { status, mediaType, page = 1, limit = 20, search } = req.query;
  const filter = { userId: req.user._id };
  if (status && ['planned', 'watched'].includes(status)) filter.status = status;
  if (mediaType && ['movie', 'tv'].includes(mediaType)) filter.mediaType = mediaType;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [items, total] = await Promise.all([
    Watchlist.find(filter).sort({ addedAt: -1 }).skip(skip).limit(parseInt(limit)),
    Watchlist.countDocuments(filter),
  ]);

  res.json(new ApiResponse(200, { items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) }, 'Watchlist retrieved'));
});

// POST /api/watchlist
const addToWatchlist = asyncHandler(async (req, res) => {
  const { tmdbId, mediaType, title, posterPath, releaseDate, externalRating } = req.body;
  const userId = req.user._id;

  const existing = await Watchlist.findOne({ userId, tmdbId, mediaType });
  if (existing) throw new ApiError(409, 'Title is already in your watchlist');

  const item = await Watchlist.create({ userId, tmdbId, mediaType, title, posterPath, releaseDate, externalRating });
  res.status(201).json(new ApiResponse(201, { item }, 'Added to watchlist'));
});

// PATCH /api/watchlist/:entryId
const updateWatchlistEntry = asyncHandler(async (req, res) => {
  const entry = await Watchlist.findById(req.params.entryId);
  if (!entry) throw new ApiError(404, 'Watchlist entry not found');
  if (entry.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  const { status } = req.body;
  if (status && ['planned', 'watched'].includes(status)) {
    entry.status = status;
    if (status === 'watched' && !entry.watchedAt) {
      entry.watchedAt = new Date();
    }
  }
  await entry.save();
  res.json(new ApiResponse(200, { item: entry }, 'Watchlist entry updated'));
});

// DELETE /api/watchlist/:entryId
const removeFromWatchlist = asyncHandler(async (req, res) => {
  const entry = await Watchlist.findById(req.params.entryId);
  if (!entry) throw new ApiError(404, 'Watchlist entry not found');
  if (entry.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }
  await entry.deleteOne();
  res.json(new ApiResponse(200, null, 'Removed from watchlist'));
});

// GET /api/watchlist/check/:mediaType/:tmdbId
const checkWatchlist = asyncHandler(async (req, res) => {
  const { mediaType, tmdbId } = req.params;
  const entry = await Watchlist.findOne({ userId: req.user._id, tmdbId: Number(tmdbId), mediaType });
  res.json(new ApiResponse(200, { inWatchlist: !!entry, entry: entry || null }, 'Watchlist status'));
});

module.exports = { getWatchlist, addToWatchlist, updateWatchlistEntry, removeFromWatchlist, checkWatchlist };
