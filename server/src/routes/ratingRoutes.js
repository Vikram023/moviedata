const express = require('express');
const { createRating, getCommunityStats, getMyRating, deleteRating } = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');
const { validate, ratingSchema } = require('../validators/schemas');

const router = express.Router();

router.post('/', protect, validate(ratingSchema), createRating);
router.get('/:mediaType/:tmdbId', getCommunityStats);
router.get('/:mediaType/:tmdbId/me', protect, getMyRating);
router.delete('/:ratingId', protect, deleteRating);

module.exports = router;
