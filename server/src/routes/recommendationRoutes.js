const express = require('express');
const { getRecommendations, getSimilar, getHiddenGems, getMoodRecommendations } = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getRecommendations);
router.get('/hidden-gems', getHiddenGems);
router.get('/similar/:mediaType/:tmdbId', getSimilar);
router.post('/mood', getMoodRecommendations);

module.exports = router;
