const express = require('express');
const { getWatchlist, addToWatchlist, updateWatchlistEntry, removeFromWatchlist, checkWatchlist } = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');
const { validate, watchlistSchema } = require('../validators/schemas');

const router = express.Router();

router.use(protect);
router.get('/', getWatchlist);
router.post('/', validate(watchlistSchema), addToWatchlist);
router.get('/check/:mediaType/:tmdbId', checkWatchlist);
router.patch('/:entryId', updateWatchlistEntry);
router.delete('/:entryId', removeFromWatchlist);

module.exports = router;
