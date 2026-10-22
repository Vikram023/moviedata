const express = require('express');
const { getList, createList, updateList, deleteList, addItem, removeItem } = require('../controllers/listController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { validate, listSchema, listItemSchema } = require('../validators/schemas');

const router = express.Router();

router.get('/:listId', optionalAuth, getList);
router.post('/', protect, validate(listSchema), createList);
router.patch('/:listId', protect, updateList);
router.delete('/:listId', protect, deleteList);
router.post('/:listId/items', protect, validate(listItemSchema), addItem);
router.delete('/:listId/items/:itemId', protect, removeItem);

module.exports = router;
