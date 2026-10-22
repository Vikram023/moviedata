const CustomList = require('../models/CustomList');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// GET /api/lists/:listId
const getList = asyncHandler(async (req, res) => {
  const list = await CustomList.findById(req.params.listId).populate('userId', 'name profileImage');
  if (!list) throw new ApiError(404, 'List not found');

  const isOwner = req.user && req.user._id.toString() === list.userId._id.toString();
  if (list.visibility === 'private' && !isOwner) {
    throw new ApiError(403, 'This list is private');
  }

  res.json(new ApiResponse(200, { list }, 'List retrieved'));
});

// POST /api/lists
const createList = asyncHandler(async (req, res) => {
  const { title, description, visibility } = req.body;
  const list = await CustomList.create({ userId: req.user._id, title, description, visibility });
  res.status(201).json(new ApiResponse(201, { list }, 'List created'));
});

// PATCH /api/lists/:listId
const updateList = asyncHandler(async (req, res) => {
  const list = await CustomList.findById(req.params.listId);
  if (!list) throw new ApiError(404, 'List not found');
  if (list.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the list owner can edit this list');
  }

  const { title, description, visibility } = req.body;
  if (title !== undefined) list.title = title;
  if (description !== undefined) list.description = description;
  if (visibility !== undefined) list.visibility = visibility;
  await list.save();
  res.json(new ApiResponse(200, { list }, 'List updated'));
});

// DELETE /api/lists/:listId
const deleteList = asyncHandler(async (req, res) => {
  const list = await CustomList.findById(req.params.listId);
  if (!list) throw new ApiError(404, 'List not found');
  if (list.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the list owner can delete this list');
  }
  await list.deleteOne();
  res.json(new ApiResponse(200, null, 'List deleted'));
});

// POST /api/lists/:listId/items
const addItem = asyncHandler(async (req, res) => {
  const list = await CustomList.findById(req.params.listId);
  if (!list) throw new ApiError(404, 'List not found');
  if (list.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the list owner can add items');
  }

  const { tmdbId, mediaType, title, posterPath, releaseDate } = req.body;
  const exists = list.items.some((i) => i.tmdbId === tmdbId && i.mediaType === mediaType);
  if (exists) throw new ApiError(409, 'This title is already in the list');

  list.items.push({ tmdbId, mediaType, title, posterPath, releaseDate, order: list.items.length });
  await list.save();
  res.status(201).json(new ApiResponse(201, { list }, 'Item added to list'));
});

// DELETE /api/lists/:listId/items/:itemId
const removeItem = asyncHandler(async (req, res) => {
  const list = await CustomList.findById(req.params.listId);
  if (!list) throw new ApiError(404, 'List not found');
  if (list.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the list owner can remove items');
  }

  const itemIndex = list.items.findIndex((i) => i._id.toString() === req.params.itemId);
  if (itemIndex === -1) throw new ApiError(404, 'Item not found in list');

  list.items.splice(itemIndex, 1);
  await list.save();
  res.json(new ApiResponse(200, { list }, 'Item removed from list'));
});

module.exports = { getList, createList, updateList, deleteList, addItem, removeItem };
