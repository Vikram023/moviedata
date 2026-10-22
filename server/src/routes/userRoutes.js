const express = require('express');
const { getUserProfile, updateProfile, getUserReviews, getUserLists, getTasteProfile } = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me/taste-profile', protect, getTasteProfile);
router.get('/:userId', optionalAuth, getUserProfile);
router.patch('/me', protect, updateProfile);
router.get('/:userId/reviews', optionalAuth, getUserReviews);
router.get('/:userId/lists', optionalAuth, getUserLists);

module.exports = router;
