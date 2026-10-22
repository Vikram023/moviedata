const mongoose = require('mongoose');
const DiaryEntry = require('../models/DiaryEntry');
const Rating = require('../models/Rating');
const Watchlist = require('../models/Watchlist');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// POST /api/diary — Log a movie or show
const createDiaryEntry = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    tmdbId,
    mediaType = 'movie',
    title,
    posterPath = '',
    backdropPath = '',
    releaseDate = '',
    watchedDate,
    rating,
    isRewatch = false,
    watchMethod = 'streaming',
    notes = '',
    tags = [],
  } = req.body;

  // Auto-detect rewatch if previously logged and user didn't specify
  let rewatchFlag = Boolean(isRewatch);
  if (!rewatchFlag) {
    const previousEntries = await DiaryEntry.countDocuments({
      userId,
      tmdbId: Number(tmdbId),
      mediaType,
    });
    if (previousEntries > 0) {
      rewatchFlag = true;
    }
  }

  const entry = await DiaryEntry.create({
    userId,
    tmdbId: Number(tmdbId),
    mediaType,
    title,
    posterPath,
    backdropPath,
    releaseDate,
    watchedDate: watchedDate ? new Date(watchedDate) : new Date(),
    rating: rating ? Number(rating) : null,
    isRewatch: rewatchFlag,
    watchMethod,
    notes,
    tags,
  });

  // Sync with Rating model if a rating was given
  if (rating && Number.isInteger(Number(rating))) {
    await Rating.findOneAndUpdate(
      { userId, tmdbId: Number(tmdbId), mediaType },
      { rating: Number(rating) },
      { upsert: true, new: true }
    );
  }

  // Sync with Watchlist model (mark as watched)
  await Watchlist.findOneAndUpdate(
    { userId, tmdbId: Number(tmdbId), mediaType },
    {
      status: 'watched',
      watchedAt: new Date(),
      title,
      posterPath,
      releaseDate,
    },
    { upsert: true, new: true }
  );

  res.status(201).json(new ApiResponse(201, { entry }, 'Movie logged to diary successfully'));
});

// GET /api/diary — Get paginated diary timeline with filters
const getDiaryEntries = asyncHandler(async (req, res) => {
  const userId = req.query.userId || req.user?._id;
  if (!userId) throw new ApiError(401, 'User context required');

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const query = { userId: new mongoose.Types.ObjectId(userId.toString()) };

  // Year filter
  if (req.query.year) {
    const year = parseInt(req.query.year);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    query.watchedDate = { $gte: startDate, $lte: endDate };
  }

  // Month filter (1-12)
  if (req.query.month && req.query.year) {
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month) - 1;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    query.watchedDate = { $gte: startDate, $lte: endDate };
  }

  // Watch Method filter
  if (req.query.watchMethod && req.query.watchMethod !== 'all') {
    query.watchMethod = req.query.watchMethod;
  }

  // Rewatch filter
  if (req.query.isRewatch !== undefined && req.query.isRewatch !== '') {
    query.isRewatch = req.query.isRewatch === 'true';
  }

  // Title search
  if (req.query.search) {
    query.title = { $regex: req.query.search.trim(), $options: 'i' };
  }

  const [entries, total] = await Promise.all([
    DiaryEntry.find(query)
      .sort({ watchedDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DiaryEntry.countDocuments(query),
  ]);

  res.json(
    new ApiResponse(
      200,
      {
        entries,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      'Diary entries retrieved'
    )
  );
});

// GET /api/diary/stats — Aggregated yearly and all-time analytics
const getDiaryStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId((req.query.userId || req.user._id).toString());
  const yearFilter = req.query.year ? parseInt(req.query.year) : null;

  const matchStage = { userId };
  if (yearFilter) {
    matchStage.watchedDate = {
      $gte: new Date(yearFilter, 0, 1),
      $lte: new Date(yearFilter, 11, 31, 23, 59, 59, 999),
    };
  }

  const [overviewStats, methodStats, monthlyStats, yearsAvailable] = await Promise.all([
    // 1. Overall counts, rewatches, average rating
    DiaryEntry.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalLogged: { $sum: 1 },
          rewatches: { $sum: { $cond: ['$isRewatch', 1, 0] } },
          firstWatches: { $sum: { $cond: ['$isRewatch', 0, 1] } },
          avgRating: { $avg: '$rating' },
        },
      },
    ]),

    // 2. Breakdown by watch method
    DiaryEntry.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$watchMethod',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    // 3. Breakdown by Month (1-12)
    DiaryEntry.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $month: '$watchedDate' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // 4. Distinct logged years for year pills filter
    DiaryEntry.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $year: '$watchedDate' },
        },
      },
      { $sort: { _id: -1 } },
    ]),
  ]);

  const overview = overviewStats[0] || {
    totalLogged: 0,
    rewatches: 0,
    firstWatches: 0,
    avgRating: null,
  };

  // Build 12-month array (Jan=1 ... Dec=12)
  const monthlyMap = {};
  monthlyStats.forEach((m) => {
    monthlyMap[m._id] = m.count;
  });
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrend = months.map((name, index) => ({
    month: name,
    monthNum: index + 1,
    count: monthlyMap[index + 1] || 0,
  }));

  const years = yearsAvailable.map((y) => y._id).filter(Boolean);
  const currentYear = new Date().getFullYear();
  if (!years.includes(currentYear)) {
    years.unshift(currentYear);
  }

  res.json(
    new ApiResponse(
      200,
      {
        totalLogged: overview.totalLogged,
        rewatches: overview.rewatches,
        firstWatches: overview.firstWatches,
        rewatchPercentage:
          overview.totalLogged > 0
            ? Math.round((overview.rewatches / overview.totalLogged) * 100)
            : 0,
        avgRating: overview.avgRating ? Math.round(overview.avgRating * 10) / 10 : null,
        watchMethods: methodStats.map((m) => ({ method: m._id, count: m.count })),
        monthlyTrend,
        availableYears: years,
        selectedYear: yearFilter || 'all',
      },
      'Diary stats retrieved'
    )
  );
});

// GET /api/diary/check/:mediaType/:tmdbId — Check logging history for title
const checkDiaryStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { mediaType, tmdbId } = req.params;

  const entries = await DiaryEntry.find({
    userId,
    tmdbId: Number(tmdbId),
    mediaType,
  }).sort({ watchedDate: -1 });

  res.json(
    new ApiResponse(
      200,
      {
        logged: entries.length > 0,
        count: entries.length,
        entries,
      },
      'Diary status checked'
    )
  );
});

// GET /api/diary/:id — Single entry
const getDiaryEntryById = asyncHandler(async (req, res) => {
  const entry = await DiaryEntry.findById(req.params.id);
  if (!entry) throw new ApiError(404, 'Diary entry not found');

  if (entry.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to view this entry');
  }

  res.json(new ApiResponse(200, { entry }, 'Diary entry retrieved'));
});

// PATCH /api/diary/:id — Update entry
const updateDiaryEntry = asyncHandler(async (req, res) => {
  const entry = await DiaryEntry.findById(req.params.id);
  if (!entry) throw new ApiError(404, 'Diary entry not found');

  if (entry.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to modify this entry');
  }

  const { watchedDate, rating, isRewatch, watchMethod, notes, tags } = req.body;

  if (watchedDate !== undefined) entry.watchedDate = new Date(watchedDate);
  if (rating !== undefined) entry.rating = rating !== null ? Number(rating) : null;
  if (isRewatch !== undefined) entry.isRewatch = Boolean(isRewatch);
  if (watchMethod !== undefined) entry.watchMethod = watchMethod;
  if (notes !== undefined) entry.notes = notes.trim();
  if (tags !== undefined) entry.tags = tags;

  await entry.save();

  // If rating was changed, update Rating model
  if (rating !== undefined && Number.isInteger(Number(rating))) {
    await Rating.findOneAndUpdate(
      { userId: req.user._id, tmdbId: entry.tmdbId, mediaType: entry.mediaType },
      { rating: Number(rating) },
      { upsert: true }
    );
  }

  res.json(new ApiResponse(200, { entry }, 'Diary entry updated successfully'));
});

// DELETE /api/diary/:id — Delete entry
const deleteDiaryEntry = asyncHandler(async (req, res) => {
  const entry = await DiaryEntry.findById(req.params.id);
  if (!entry) throw new ApiError(404, 'Diary entry not found');

  if (entry.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to delete this entry');
  }

  await entry.deleteOne();
  res.json(new ApiResponse(200, null, 'Diary entry deleted successfully'));
});

module.exports = {
  createDiaryEntry,
  getDiaryEntries,
  getDiaryStats,
  checkDiaryStatus,
  getDiaryEntryById,
  updateDiaryEntry,
  deleteDiaryEntry,
};
