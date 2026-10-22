const mongoose = require('mongoose');

const listItemSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true },
  mediaType: { type: String, enum: ['movie', 'tv'], required: true },
  title: String,
  posterPath: String,
  releaseDate: String,
  addedAt: { type: Date, default: Date.now },
  order: { type: Number, default: 0 },
});

const customListSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'List title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    items: {
      type: [listItemSchema],
      validate: {
        validator: (v) => v.length <= 500,
        message: 'A list cannot exceed 500 items',
      },
    },
  },
  { timestamps: true }
);

customListSchema.index({ userId: 1 });
customListSchema.index({ visibility: 1 });

module.exports = mongoose.model('CustomList', customListSchema);
