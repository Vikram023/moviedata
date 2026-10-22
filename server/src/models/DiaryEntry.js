const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tmdbId: {
      type: Number,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['movie', 'tv'],
      default: 'movie',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    posterPath: {
      type: String,
      default: '',
    },
    backdropPath: {
      type: String,
      default: '',
    },
    releaseDate: {
      type: String,
      default: '',
    },
    watchedDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
    },
    isRewatch: {
      type: Boolean,
      default: false,
    },
    watchMethod: {
      type: String,
      enum: ['theater', 'streaming', 'physical_media', 'tv', 'other'],
      default: 'streaming',
    },
    notes: {
      type: String,
      maxlength: [3000, 'Notes cannot exceed 3000 characters'],
      default: '',
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

// Indexes for fast timeline queries, year filters, and title checks
diaryEntrySchema.index({ userId: 1, watchedDate: -1 });
diaryEntrySchema.index({ userId: 1, tmdbId: 1, mediaType: 1 });
diaryEntrySchema.index({ userId: 1, watchMethod: 1 });
diaryEntrySchema.index({ userId: 1, isRewatch: 1 });

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);
