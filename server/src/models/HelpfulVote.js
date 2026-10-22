const mongoose = require('mongoose');

const helpfulVoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    },
  },
  { timestamps: true }
);

helpfulVoteSchema.index({ userId: 1, reviewId: 1 }, { unique: true });
helpfulVoteSchema.index({ reviewId: 1 });

module.exports = mongoose.model('HelpfulVote', helpfulVoteSchema);
