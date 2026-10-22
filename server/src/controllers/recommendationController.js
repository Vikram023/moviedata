const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const recService = require('../services/recommendationService');
const tmdbService = require('../services/tmdbService');

// GET /api/recommendations
const getRecommendations = asyncHandler(async (req, res) => {
  const user = req.user;
  const page = parseInt(req.query.page) || 1;

  const [genreBased, hiddenGems, personalized, popular] = await Promise.all([
    recService.getGenreRecommendations(user, page).catch(() => null),
    recService.getHiddenGems(page).catch(() => null),
    recService.getPersonalizedRecommendations(user._id).catch(() => null),
    tmdbService.getPopularMovies(1).catch(() => null),
  ]);

  res.json(new ApiResponse(200, {
    genreBased: genreBased?.results || [],
    hiddenGems: hiddenGems?.results || [],
    personalized: personalized?.results || [],
    popular: popular?.results?.slice(0, 10) || [],
  }, 'Recommendations retrieved'));
});

// GET /api/recommendations/similar/:mediaType/:tmdbId
const getSimilar = asyncHandler(async (req, res) => {
  const { mediaType, tmdbId } = req.params;
  if (!['movie', 'tv'].includes(mediaType)) throw new ApiError(400, 'Invalid media type');

  const data = await recService.getSimilarRecommendations(mediaType, tmdbId);
  res.json(new ApiResponse(200, data, 'Similar titles'));
});

// GET /api/recommendations/hidden-gems
const getHiddenGems = asyncHandler(async (req, res) => {
  const data = await recService.getHiddenGems(parseInt(req.query.page) || 1);
  res.json(new ApiResponse(200, data, 'Hidden gems'));
});

// POST /api/recommendations/mood
const getMoodRecommendations = asyncHandler(async (req, res) => {
  const { moods, minRating, maxRuntime, releasePeriod, page } = req.body;
  if (!moods || !Array.isArray(moods) || moods.length === 0) {
    throw new ApiError(400, 'At least one mood is required');
  }

  const validMoods = Object.keys(recService.MOOD_GENRE_MAP);
  const filteredMoods = moods.filter((m) => validMoods.includes(m));
  if (filteredMoods.length === 0) throw new ApiError(400, 'No valid moods provided');

  const data = await recService.getMoodRecommendations(filteredMoods, { minRating, maxRuntime, releasePeriod, page });
  res.json(new ApiResponse(200, { ...data, moods: filteredMoods }, 'Mood-based recommendations'));
});

module.exports = { getRecommendations, getSimilar, getHiddenGems, getMoodRecommendations };
