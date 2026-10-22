const tmdbClient = require('../config/tmdb');
const NodeCache = require('node-cache');

// Cache with configurable TTL (default 5 minutes)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const CACHE_TTL = {
  trending: 300,       // 5 min
  popular: 600,        // 10 min
  topRated: 3600,      // 1 hour
  genres: 86400,       // 24 hours
  details: 1800,       // 30 min
  search: 120,         // 2 min
};

const withCache = async (key, ttl, fetchFn) => {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  const data = await fetchFn();
  cache.set(key, data, ttl);
  return data;
};

// ─── Trending ────────────────────────────────────────────────────────────────
const getTrending = async (mediaType = 'all', timeWindow = 'week', page = 1) => {
  const key = `trending:${mediaType}:${timeWindow}:${page}`;
  return withCache(key, CACHE_TTL.trending, async () => {
    const { data } = await tmdbClient.get(`/trending/${mediaType}/${timeWindow}`, { params: { page } });
    return data;
  });
};

// ─── Movies ──────────────────────────────────────────────────────────────────
const getPopularMovies = async (page = 1) => {
  const key = `movies:popular:${page}`;
  return withCache(key, CACHE_TTL.popular, async () => {
    const { data } = await tmdbClient.get('/movie/popular', { params: { page } });
    return data;
  });
};

const getTopRatedMovies = async (page = 1) => {
  const key = `movies:top_rated:${page}`;
  return withCache(key, CACHE_TTL.topRated, async () => {
    const { data } = await tmdbClient.get('/movie/top_rated', { params: { page } });
    return data;
  });
};

const getUpcomingMovies = async (page = 1) => {
  const key = `movies:upcoming:${page}`;
  return withCache(key, CACHE_TTL.popular, async () => {
    const { data } = await tmdbClient.get('/movie/upcoming', { params: { page } });
    return data;
  });
};

const getMovieDetails = async (tmdbId) => {
  const key = `movie:${tmdbId}:details`;
  return withCache(key, CACHE_TTL.details, async () => {
    const { data } = await tmdbClient.get(`/movie/${tmdbId}`, {
      params: { append_to_response: 'videos,credits,similar,recommendations,release_dates' },
    });
    return data;
  });
};

const getMovieCredits = async (tmdbId) => {
  const key = `movie:${tmdbId}:credits`;
  return withCache(key, CACHE_TTL.details, async () => {
    const { data } = await tmdbClient.get(`/movie/${tmdbId}/credits`);
    return data;
  });
};

const getMovieVideos = async (tmdbId) => {
  const key = `movie:${tmdbId}:videos`;
  return withCache(key, CACHE_TTL.details, async () => {
    const { data } = await tmdbClient.get(`/movie/${tmdbId}/videos`);
    return data;
  });
};

const getSimilarMovies = async (tmdbId, page = 1) => {
  const key = `movie:${tmdbId}:similar:${page}`;
  return withCache(key, CACHE_TTL.details, async () => {
    const { data } = await tmdbClient.get(`/movie/${tmdbId}/similar`, { params: { page } });
    return data;
  });
};

const getMovieRecommendations = async (tmdbId, page = 1) => {
  const key = `movie:${tmdbId}:recommendations:${page}`;
  return withCache(key, CACHE_TTL.details, async () => {
    const { data } = await tmdbClient.get(`/movie/${tmdbId}/recommendations`, { params: { page } });
    return data;
  });
};

// ─── TV Shows ─────────────────────────────────────────────────────────────────
const getPopularTV = async (page = 1) => {
  const key = `tv:popular:${page}`;
  return withCache(key, CACHE_TTL.popular, async () => {
    const { data } = await tmdbClient.get('/tv/popular', { params: { page } });
    return data;
  });
};

const getTopRatedTV = async (page = 1) => {
  const key = `tv:top_rated:${page}`;
  return withCache(key, CACHE_TTL.topRated, async () => {
    const { data } = await tmdbClient.get('/tv/top_rated', { params: { page } });
    return data;
  });
};

const getTVDetails = async (tmdbId) => {
  const key = `tv:${tmdbId}:details`;
  return withCache(key, CACHE_TTL.details, async () => {
    const { data } = await tmdbClient.get(`/tv/${tmdbId}`, {
      params: { append_to_response: 'videos,credits,similar,recommendations,content_ratings' },
    });
    return data;
  });
};

const getSimilarTV = async (tmdbId, page = 1) => {
  const key = `tv:${tmdbId}:similar:${page}`;
  return withCache(key, CACHE_TTL.details, async () => {
    const { data } = await tmdbClient.get(`/tv/${tmdbId}/similar`, { params: { page } });
    return data;
  });
};

// ─── Search ──────────────────────────────────────────────────────────────────
const searchMulti = async (query, page = 1) => {
  if (!query) return { results: [], total_pages: 0, total_results: 0 };
  const key = `search:multi:${query}:${page}`;
  return withCache(key, CACHE_TTL.search, async () => {
    const { data } = await tmdbClient.get('/search/multi', { params: { query, page, include_adult: false } });
    return data;
  });
};

const searchMovies = async (query, page = 1) => {
  if (!query) return { results: [], total_pages: 0, total_results: 0 };
  const key = `search:movie:${query}:${page}`;
  return withCache(key, CACHE_TTL.search, async () => {
    const { data } = await tmdbClient.get('/search/movie', { params: { query, page, include_adult: false } });
    return data;
  });
};

const searchTV = async (query, page = 1) => {
  if (!query) return { results: [], total_pages: 0, total_results: 0 };
  const key = `search:tv:${query}:${page}`;
  return withCache(key, CACHE_TTL.search, async () => {
    const { data } = await tmdbClient.get('/search/tv', { params: { query, page } });
    return data;
  });
};

const searchPeople = async (query, page = 1) => {
  if (!query) return { results: [], total_pages: 0, total_results: 0 };
  const key = `search:person:${query}:${page}`;
  return withCache(key, CACHE_TTL.search, async () => {
    const { data } = await tmdbClient.get('/search/person', { params: { query, page } });
    return data;
  });
};

// ─── Genres ──────────────────────────────────────────────────────────────────
const getMovieGenres = async () => {
  return withCache('genres:movie', CACHE_TTL.genres, async () => {
    const { data } = await tmdbClient.get('/genre/movie/list');
    return data;
  });
};

const getTVGenres = async () => {
  return withCache('genres:tv', CACHE_TTL.genres, async () => {
    const { data } = await tmdbClient.get('/genre/tv/list');
    return data;
  });
};

// ─── Discover ─────────────────────────────────────────────────────────────────
const discoverMovies = async (params = {}) => {
  const key = `discover:movie:${JSON.stringify(params)}`;
  return withCache(key, CACHE_TTL.search, async () => {
    const { data } = await tmdbClient.get('/discover/movie', { params });
    return data;
  });
};

const discoverTV = async (params = {}) => {
  const key = `discover:tv:${JSON.stringify(params)}`;
  return withCache(key, CACHE_TTL.search, async () => {
    const { data } = await tmdbClient.get('/discover/tv', { params });
    return data;
  });
};

// ─── Person ──────────────────────────────────────────────────────────────────
const getPersonDetails = async (personId) => {
  const key = `person:${personId}`;
  return withCache(key, CACHE_TTL.details, async () => {
    const { data } = await tmdbClient.get(`/person/${personId}`, {
      params: { append_to_response: 'movie_credits,tv_credits' },
    });
    return data;
  });
};

module.exports = {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getSimilarMovies,
  getMovieRecommendations,
  getPopularTV,
  getTopRatedTV,
  getTVDetails,
  getSimilarTV,
  searchMulti,
  searchMovies,
  searchTV,
  searchPeople,
  getMovieGenres,
  getTVGenres,
  discoverMovies,
  discoverTV,
  getPersonDetails,
};
