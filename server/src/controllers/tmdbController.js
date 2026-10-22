const tmdbService = require('../services/tmdbService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// Allowed sort_by values for discover endpoints
const ALLOWED_SORT = [
  'popularity.desc', 'popularity.asc',
  'vote_average.desc', 'vote_average.asc',
  'release_date.desc', 'release_date.asc',
  'revenue.desc', 'original_title.asc',
  'first_air_date.desc', 'first_air_date.asc',
];

// GET /api/tmdb/trending
const getTrending = asyncHandler(async (req, res) => {
  const { media_type = 'all', time_window = 'week', page = 1 } = req.query;
  const data = await tmdbService.getTrending(media_type, time_window, parseInt(page));
  res.json(new ApiResponse(200, data, 'Trending titles'));
});

// GET /api/tmdb/movies/popular
const getPopularMovies = asyncHandler(async (req, res) => {
  const data = await tmdbService.getPopularMovies(parseInt(req.query.page) || 1);
  res.json(new ApiResponse(200, data, 'Popular movies'));
});

// GET /api/tmdb/movies/top-rated
const getTopRatedMovies = asyncHandler(async (req, res) => {
  const data = await tmdbService.getTopRatedMovies(parseInt(req.query.page) || 1);
  res.json(new ApiResponse(200, data, 'Top rated movies'));
});

// GET /api/tmdb/movies/upcoming
const getUpcomingMovies = asyncHandler(async (req, res) => {
  const data = await tmdbService.getUpcomingMovies(parseInt(req.query.page) || 1);
  res.json(new ApiResponse(200, data, 'Upcoming movies'));
});

// GET /api/tmdb/movies/:tmdbId
const getMovieDetails = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;
  if (isNaN(tmdbId)) throw new ApiError(400, 'Invalid movie ID');
  const data = await tmdbService.getMovieDetails(tmdbId);
  res.json(new ApiResponse(200, data, 'Movie details'));
});

// GET /api/tmdb/movies/:tmdbId/credits
const getMovieCredits = asyncHandler(async (req, res) => {
  const data = await tmdbService.getMovieCredits(req.params.tmdbId);
  res.json(new ApiResponse(200, data, 'Movie credits'));
});

// GET /api/tmdb/movies/:tmdbId/videos
const getMovieVideos = asyncHandler(async (req, res) => {
  const data = await tmdbService.getMovieVideos(req.params.tmdbId);
  res.json(new ApiResponse(200, data, 'Movie videos'));
});

// GET /api/tmdb/movies/:tmdbId/similar
const getSimilarMovies = asyncHandler(async (req, res) => {
  const data = await tmdbService.getSimilarMovies(req.params.tmdbId, parseInt(req.query.page) || 1);
  res.json(new ApiResponse(200, data, 'Similar movies'));
});

// GET /api/tmdb/tv/popular
const getPopularTV = asyncHandler(async (req, res) => {
  const data = await tmdbService.getPopularTV(parseInt(req.query.page) || 1);
  res.json(new ApiResponse(200, data, 'Popular TV shows'));
});

// GET /api/tmdb/tv/top-rated
const getTopRatedTV = asyncHandler(async (req, res) => {
  const data = await tmdbService.getTopRatedTV(parseInt(req.query.page) || 1);
  res.json(new ApiResponse(200, data, 'Top rated TV shows'));
});

// GET /api/tmdb/tv/:tmdbId
const getTVDetails = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;
  if (isNaN(tmdbId)) throw new ApiError(400, 'Invalid TV show ID');
  const data = await tmdbService.getTVDetails(tmdbId);
  res.json(new ApiResponse(200, data, 'TV show details'));
});

// GET /api/tmdb/tv/:tmdbId/similar
const getSimilarTV = asyncHandler(async (req, res) => {
  const data = await tmdbService.getSimilarTV(req.params.tmdbId, parseInt(req.query.page) || 1);
  res.json(new ApiResponse(200, data, 'Similar TV shows'));
});

// GET /api/tmdb/search
const search = asyncHandler(async (req, res) => {
  const { query, type = 'multi', page = 1 } = req.query;
  if (!query || query.trim().length === 0) {
    throw new ApiError(400, 'Search query is required');
  }

  let data;
  switch (type) {
    case 'movie': data = await tmdbService.searchMovies(query, parseInt(page)); break;
    case 'tv': data = await tmdbService.searchTV(query, parseInt(page)); break;
    case 'person': data = await tmdbService.searchPeople(query, parseInt(page)); break;
    default: data = await tmdbService.searchMulti(query, parseInt(page));
  }

  res.json(new ApiResponse(200, data, 'Search results'));
});

// GET /api/tmdb/genres
const getGenres = asyncHandler(async (req, res) => {
  const { type = 'movie' } = req.query;
  const data = type === 'tv'
    ? await tmdbService.getTVGenres()
    : await tmdbService.getMovieGenres();
  res.json(new ApiResponse(200, data, 'Genres'));
});

// GET /api/tmdb/discover/movies
const discoverMovies = asyncHandler(async (req, res) => {
  const {
    with_genres, sort_by = 'popularity.desc', page = 1,
    'vote_average.gte': minRating, 'vote_count.gte': minVotes,
    with_original_language, 'primary_release_date.gte': relGte,
    'primary_release_date.lte': relLte, with_runtime_lte, with_runtime_gte,
  } = req.query;

  const params = {
    sort_by: ALLOWED_SORT.includes(sort_by) ? sort_by : 'popularity.desc',
    page: parseInt(page),
    ...(with_genres && { with_genres }),
    ...(minRating && { 'vote_average.gte': parseFloat(minRating) }),
    ...(minVotes && { 'vote_count.gte': parseInt(minVotes) }),
    ...(with_original_language && { with_original_language }),
    ...(relGte && { 'primary_release_date.gte': relGte }),
    ...(relLte && { 'primary_release_date.lte': relLte }),
    ...(with_runtime_lte && { with_runtime_lte: parseInt(with_runtime_lte) }),
    ...(with_runtime_gte && { with_runtime_gte: parseInt(with_runtime_gte) }),
  };

  const data = await tmdbService.discoverMovies(params);
  res.json(new ApiResponse(200, data, 'Discovered movies'));
});

// GET /api/tmdb/discover/tv
const discoverTV = asyncHandler(async (req, res) => {
  const {
    with_genres, sort_by = 'popularity.desc', page = 1,
    'vote_average.gte': minRating, with_original_language,
    'first_air_date.gte': airGte, 'first_air_date.lte': airLte,
  } = req.query;

  const params = {
    sort_by: ALLOWED_SORT.includes(sort_by) ? sort_by : 'popularity.desc',
    page: parseInt(page),
    ...(with_genres && { with_genres }),
    ...(minRating && { 'vote_average.gte': parseFloat(minRating) }),
    ...(with_original_language && { with_original_language }),
    ...(airGte && { 'first_air_date.gte': airGte }),
    ...(airLte && { 'first_air_date.lte': airLte }),
  };

  const data = await tmdbService.discoverTV(params);
  res.json(new ApiResponse(200, data, 'Discovered TV shows'));
});

// GET /api/tmdb/person/:personId
const getPersonDetails = asyncHandler(async (req, res) => {
  const data = await tmdbService.getPersonDetails(req.params.personId);
  res.json(new ApiResponse(200, data, 'Person details'));
});

module.exports = {
  getTrending, getPopularMovies, getTopRatedMovies, getUpcomingMovies,
  getMovieDetails, getMovieCredits, getMovieVideos, getSimilarMovies,
  getPopularTV, getTopRatedTV, getTVDetails, getSimilarTV,
  search, getGenres, discoverMovies, discoverTV, getPersonDetails,
};
