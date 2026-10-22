const mongoose = require('mongoose');

const movieCacheSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['movie', 'tv'],
      required: true,
    },
    title: String,
    overview: String,
    posterPath: String,
    backdropPath: String,
    releaseDate: String,
    genres: [{ id: Number, name: String }],
    externalRating: Number,
    externalVoteCount: Number,
    popularity: Number,
    originalLanguage: String,
    metadataUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

movieCacheSchema.index({ tmdbId: 1, mediaType: 1 }, { unique: true });
movieCacheSchema.index({ popularity: -1 });
movieCacheSchema.index({ externalRating: -1 });

module.exports = mongoose.model('MovieCache', movieCacheSchema);
