const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['planned', 'watched'],
      default: 'planned',
    },
    title: String,
    posterPath: String,
    releaseDate: String,
    externalRating: Number,
    addedAt: {
      type: Date,
      default: Date.now,
    },
    watchedAt: Date,
  },
  { timestamps: true }
);

watchlistSchema.index({ userId: 1, tmdbId: 1, mediaType: 1 }, { unique: true });
watchlistSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Watchlist', watchlistSchema);
