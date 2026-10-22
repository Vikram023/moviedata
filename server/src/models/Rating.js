const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tmdbId: {
      type: Number,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['movie', 'tv'],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating cannot exceed 10'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer',
      },
    },
  },
  { timestamps: true }
);

ratingSchema.index({ userId: 1, tmdbId: 1, mediaType: 1 }, { unique: true });
ratingSchema.index({ tmdbId: 1, mediaType: 1 });
ratingSchema.index({ userId: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
