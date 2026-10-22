const express = require('express');
const { createReview, getReviews, updateReview, deleteReview, markHelpful, removeHelpful, reportReview } = require('../controllers/reviewController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { validate, reviewSchema, reportSchema } = require('../validators/schemas');

const router = express.Router();

router.post('/', protect, validate(reviewSchema), createReview);
router.get('/:mediaType/:tmdbId', optionalAuth, getReviews);
router.patch('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);
router.post('/:reviewId/helpful', protect, markHelpful);
router.delete('/:reviewId/helpful', protect, removeHelpful);
router.post('/:reviewId/report', protect, validate(reportSchema), reportReview);

module.exports = router;
