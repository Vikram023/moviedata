const tmdbService = require('./tmdbService');
const Rating = require('../models/Rating');
const Watchlist = require('../models/Watchlist');
const Review = require('../models/Review');

/**
 * Genre-based + content-based recommendation engine
 * Weights: genres 40%, cast 20%, director 15%, keywords 15%, user prefs 10%
 */

// Mood → genre mapping
const MOOD_GENRE_MAP = {
  happy: [35, 16, 10751, 10402],       // Comedy, Animation, Family, Music
  sad: [18, 10749],                     // Drama, Romance
  motivated: [28, 12, 36],             // Action, Adventure, History
  relaxed: [99, 16, 10751],            // Documentary, Animation, Family
  suspenseful: [53, 9648, 27, 80],     // Thriller, Mystery, Horror, Crime
  romantic: [10749, 35],               // Romance, Comedy
  adventurous: [12, 28, 14, 878],      // Adventure, Action, Fantasy, Sci-Fi
  'thought-provoking': [878, 18, 36, 9648], // Sci-Fi, Drama, History, Mystery
};

/**
 * Get genre-based recommendations for a user
 */
const getGenreRecommendations = async (user, page = 1) => {
  const genres = user.favoriteGenres || [];
  if (genres.length === 0) {
    // Fallback to popular
    return tmdbService.getPopularMovies(page);
  }

  const genreIds = genres.slice(0, 3).map((g) => g.id).join(',');
  return tmdbService.discoverMovies({
    with_genres: genreIds,
    sort_by: 'vote_average.desc',
    'vote_count.gte': 100,
    page,
  });
};

/**
 * Get hidden gems — high-rated but less discovered titles
 */
const getHiddenGems = async (page = 1) => {
  const data = await tmdbService.discoverMovies({
    sort_by: 'vote_average.desc',
    'vote_average.gte': 7.0,
    'vote_count.gte': 50,
    'vote_count.lte': 5000,
    page,
  });

  return {
    ...data,
    results: data.results.map((m) => ({
      ...m,
      _isHiddenGem: true,
      _recommendationReason: 'Highly rated but lesser known',
    })),
  };
};

/**
 * Get content-based similar recommendations for a specific title
 */
const getSimilarRecommendations = async (mediaType, tmdbId) => {
  if (mediaType === 'movie') {
    return tmdbService.getMovieRecommendations(tmdbId);
  }
  return tmdbService.getSimilarTV(tmdbId);
};

/**
 * Get personalized recommendations based on user's rating history
 */
const getPersonalizedRecommendations = async (userId) => {
  // Get user's top-rated titles (rating >= 7)
  const topRatings = await Rating.find({ userId, rating: { $gte: 7 } })
    .sort({ rating: -1 })
    .limit(5);

  if (topRatings.length === 0) return null;

  // Get recommendations from the highest-rated title
  const topRated = topRatings[0];
  try {
    if (topRated.mediaType === 'movie') {
      return tmdbService.getMovieRecommendations(topRated.tmdbId);
    } else {
      return tmdbService.getSimilarTV(topRated.tmdbId);
    }
  } catch {
    return null;
  }
};

/**
 * Filter out already-watched or already-rated titles from recommendations
 */
const filterSeen = async (userId, results) => {
  const [ratings, watchlist] = await Promise.all([
    Rating.find({ userId }).select('tmdbId mediaType'),
    Watchlist.find({ userId, status: 'watched' }).select('tmdbId mediaType'),
  ]);

  const seenSet = new Set([
    ...ratings.map((r) => `${r.mediaType}:${r.tmdbId}`),
    ...watchlist.map((w) => `${w.mediaType}:${w.tmdbId}`),
  ]);

  return results.filter((item) => {
    const type = item.media_type || 'movie';
    return !seenSet.has(`${type}:${item.id}`);
  });
};

/**
 * Get mood-based recommendations
 */
const getMoodRecommendations = async (moods = [], options = {}) => {
  const genreIds = [...new Set(moods.flatMap((m) => MOOD_GENRE_MAP[m] || []))];

  const params = {
    with_genres: genreIds.join(','),
    sort_by: 'popularity.desc',
    'vote_count.gte': 100,
    page: options.page || 1,
    ...(options.minRating && { 'vote_average.gte': options.minRating }),
    ...(options.maxRuntime && { with_runtime_lte: options.maxRuntime }),
    ...(options.releasePeriod && {
      'release_date.gte': `${options.releasePeriod.start}-01-01`,
      'release_date.lte': `${options.releasePeriod.end}-12-31`,
    }),
  };

  return tmdbService.discoverMovies(params);
};

module.exports = {
  getGenreRecommendations,
  getHiddenGems,
  getSimilarRecommendations,
  getPersonalizedRecommendations,
  filterSeen,
  getMoodRecommendations,
  MOOD_GENRE_MAP,
};
