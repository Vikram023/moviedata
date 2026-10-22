const express = require('express');
const { getDashboard, getUsers, updateUserStatus, getReports, updateReport } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.patch('/users/:userId/status', updateUserStatus);
router.get('/reports', getReports);
router.patch('/reports/:reportId', updateReport);

module.exports = router;
