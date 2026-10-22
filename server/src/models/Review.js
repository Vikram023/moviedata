const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    reviewText: {
      type: String,
      required: [true, 'Review text is required'],
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [5000, 'Review cannot exceed 5000 characters'],
      trim: true,
    },
    containsSpoilers: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    moderationStatus: {
      type: String,
      enum: ['approved', 'pending', 'removed'],
      default: 'approved',
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ tmdbId: 1, mediaType: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ helpfulCount: -1 });

module.exports = mongoose.model('Review', reviewSchema);
