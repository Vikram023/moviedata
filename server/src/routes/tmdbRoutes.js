const express = require('express');
const {
  getTrending, getPopularMovies, getTopRatedMovies, getUpcomingMovies,
  getMovieDetails, getMovieCredits, getMovieVideos, getSimilarMovies,
  getPopularTV, getTopRatedTV, getTVDetails, getSimilarTV,
  search, getGenres, discoverMovies, discoverTV, getPersonDetails,
} = require('../controllers/tmdbController');

const router = express.Router();

// Trending
router.get('/trending', getTrending);

// Movies
router.get('/movies/popular', getPopularMovies);
router.get('/movies/top-rated', getTopRatedMovies);
router.get('/movies/upcoming', getUpcomingMovies);
router.get('/movies/:tmdbId', getMovieDetails);
router.get('/movies/:tmdbId/credits', getMovieCredits);
router.get('/movies/:tmdbId/videos', getMovieVideos);
router.get('/movies/:tmdbId/similar', getSimilarMovies);

// TV
router.get('/tv/popular', getPopularTV);
router.get('/tv/top-rated', getTopRatedTV);
router.get('/tv/:tmdbId', getTVDetails);
router.get('/tv/:tmdbId/similar', getSimilarTV);

// Search & Discover
router.get('/search', search);
router.get('/genres', getGenres);
router.get('/discover/movies', discoverMovies);
router.get('/discover/tv', discoverTV);

// People
router.get('/person/:personId', getPersonDetails);

module.exports = router;
