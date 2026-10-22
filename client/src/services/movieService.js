import api from './api'

// ─── Trending & Discovery ────────────────────────────────────────────────────
export const getTrending = (mediaType = 'all', timeWindow = 'week', page = 1) =>
  api.get(`/tmdb/trending?media_type=${mediaType}&time_window=${timeWindow}&page=${page}`)

export const getPopularMovies = (page = 1) =>
  api.get(`/tmdb/movies/popular?page=${page}`)

export const getTopRatedMovies = (page = 1) =>
  api.get(`/tmdb/movies/top-rated?page=${page}`)

export const getUpcomingMovies = (page = 1) =>
  api.get(`/tmdb/movies/upcoming?page=${page}`)

export const getPopularTV = (page = 1) =>
  api.get(`/tmdb/tv/popular?page=${page}`)

export const getTopRatedTV = (page = 1) =>
  api.get(`/tmdb/tv/top-rated?page=${page}`)

// ─── Movie Details ────────────────────────────────────────────────────────────
export const getMovieDetails = (tmdbId) =>
  api.get(`/tmdb/movies/${tmdbId}`)

export const getMovieCredits = (tmdbId) =>
  api.get(`/tmdb/movies/${tmdbId}/credits`)

export const getMovieVideos = (tmdbId) =>
  api.get(`/tmdb/movies/${tmdbId}/videos`)

export const getSimilarMovies = (tmdbId, page = 1) =>
  api.get(`/tmdb/movies/${tmdbId}/similar?page=${page}`)

// ─── TV Details ───────────────────────────────────────────────────────────────
export const getTVDetails = (tmdbId) =>
  api.get(`/tmdb/tv/${tmdbId}`)

export const getSimilarTV = (tmdbId, page = 1) =>
  api.get(`/tmdb/tv/${tmdbId}/similar?page=${page}`)

// ─── Search & Genres ──────────────────────────────────────────────────────────
export const searchMulti = (query, page = 1, type = 'multi') =>
  api.get(`/tmdb/search?query=${encodeURIComponent(query)}&page=${page}&type=${type}`)

export const getGenres = (type = 'movie') =>
  api.get(`/tmdb/genres?type=${type}`)

// ─── Discover ────────────────────────────────────────────────────────────────
export const discoverMovies = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return api.get(`/tmdb/discover/movies?${qs}`)
}

export const discoverTV = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return api.get(`/tmdb/discover/tv?${qs}`)
}

// ─── Person ───────────────────────────────────────────────────────────────────
export const getPersonDetails = (personId) =>
  api.get(`/tmdb/person/${personId}`)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => api.post('/auth/login', data)
export const logoutUser = () => api.post('/auth/logout')
export const getMe = () => api.get('/auth/me')

// ─── User Profile ─────────────────────────────────────────────────────────────
export const getUserProfile = (userId) => api.get(`/users/${userId}`)
export const updateProfile = (data) => api.patch('/users/me', data)
export const getUserReviews = (userId, page = 1) =>
  api.get(`/users/${userId}/reviews?page=${page}`)
export const getUserLists = (userId) => api.get(`/users/${userId}/lists`)
export const getTasteProfile = () => api.get('/users/me/taste-profile')

// ─── Ratings ─────────────────────────────────────────────────────────────────
export const submitRating = (data) => api.post('/ratings', data)
export const getCommunityRating = (mediaType, tmdbId) =>
  api.get(`/ratings/${mediaType}/${tmdbId}`)
export const getMyRating = (mediaType, tmdbId) =>
  api.get(`/ratings/${mediaType}/${tmdbId}/me`)
export const deleteRating = (ratingId) => api.delete(`/ratings/${ratingId}`)

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const createReview = (data) => api.post('/reviews', data)
export const getReviews = (mediaType, tmdbId, params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return api.get(`/reviews/${mediaType}/${tmdbId}?${qs}`)
}
export const updateReview = (reviewId, data) => api.patch(`/reviews/${reviewId}`, data)
export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`)
export const markReviewHelpful = (reviewId) => api.post(`/reviews/${reviewId}/helpful`)
export const removeReviewHelpful = (reviewId) => api.delete(`/reviews/${reviewId}/helpful`)
export const reportReview = (reviewId, data) => api.post(`/reviews/${reviewId}/report`, data)

// ─── Watchlist ────────────────────────────────────────────────────────────────
export const getWatchlist = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return api.get(`/watchlist?${qs}`)
}
export const addToWatchlist = (data) => api.post('/watchlist', data)
export const updateWatchlistEntry = (entryId, data) =>
  api.patch(`/watchlist/${entryId}`, data)
export const removeFromWatchlist = (entryId) => api.delete(`/watchlist/${entryId}`)
export const checkWatchlist = (mediaType, tmdbId) =>
  api.get(`/watchlist/check/${mediaType}/${tmdbId}`)

// ─── Custom Lists ─────────────────────────────────────────────────────────────
export const getList = (listId) => api.get(`/lists/${listId}`)
export const createList = (data) => api.post('/lists', data)
export const updateList = (listId, data) => api.patch(`/lists/${listId}`, data)
export const deleteList = (listId) => api.delete(`/lists/${listId}`)
export const addItemToList = (listId, data) => api.post(`/lists/${listId}/items`, data)
export const removeItemFromList = (listId, itemId) =>
  api.delete(`/lists/${listId}/items/${itemId}`)

// ─── Recommendations ─────────────────────────────────────────────────────────
export const getRecommendations = (page = 1) =>
  api.get(`/recommendations?page=${page}`)
export const getSimilarRecommendations = (mediaType, tmdbId) =>
  api.get(`/recommendations/similar/${mediaType}/${tmdbId}`)
export const getHiddenGems = (page = 1) =>
  api.get(`/recommendations/hidden-gems?page=${page}`)
export const getMoodRecommendations = (data) =>
  api.post('/recommendations/mood', data)

// ─── Admin ────────────────────────────────────────────────────────────────────
export const getAdminDashboard = () => api.get('/admin/dashboard')
export const getAdminUsers = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return api.get(`/admin/users?${qs}`)
}
export const updateUserStatus = (userId, status) =>
  api.patch(`/admin/users/${userId}/status`, { status })
export const getAdminReports = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return api.get(`/admin/reports?${qs}`)
}
export const updateReport = (reportId, data) =>
  api.patch(`/admin/reports/${reportId}`, data)

// ─── Movie Diary & Watch Logs ────────────────────────────────────────────────
export const getDiaryEntries = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return api.get(`/diary?${qs}`)
}
export const getDiaryStats = (year) => {
  const qs = year ? `?year=${year}` : ''
  return api.get(`/diary/stats${qs}`)
}
export const createDiaryEntry = (data) => api.post('/diary', data)
export const updateDiaryEntry = (entryId, data) => api.patch(`/diary/${entryId}`, data)
export const deleteDiaryEntry = (entryId) => api.delete(`/diary/${entryId}`)
export const checkDiaryStatus = (mediaType, tmdbId) =>
  api.get(`/diary/check/${mediaType}/${tmdbId}`)

