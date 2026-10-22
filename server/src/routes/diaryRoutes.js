const express = require('express');
const {
  createDiaryEntry,
  getDiaryEntries,
  getDiaryStats,
  checkDiaryStatus,
  getDiaryEntryById,
  updateDiaryEntry,
  deleteDiaryEntry,
} = require('../controllers/diaryController');
const { protect } = require('../middleware/authMiddleware');
const { validate, diarySchema, diaryUpdateSchema } = require('../validators/schemas');

const router = express.Router();

router.use(protect);

router.post('/', validate(diarySchema), createDiaryEntry);
router.get('/', getDiaryEntries);
router.get('/stats', getDiaryStats);
router.get('/check/:mediaType/:tmdbId', checkDiaryStatus);
router.get('/:id', getDiaryEntryById);
router.patch('/:id', validate(diaryUpdateSchema), updateDiaryEntry);
router.delete('/:id', deleteDiaryEntry);

module.exports = router;
