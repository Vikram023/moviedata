const Rating = require('../models/Rating');

/**
 * Calculate community rating stats for a title
 */
const getCommunityRating = async (tmdbId, mediaType) => {
  const result = await Rating.aggregate([
    { $match: { tmdbId: Number(tmdbId), mediaType } },
    {
      $group: {
        _id: null,
        average: { $avg: '$rating' },
        count: { $sum: 1 },
        distribution: {
          $push: '$rating',
        },
      },
    },
  ]);

  if (!result.length) {
    return { average: null, count: 0, distribution: {} };
  }

  const { average, count, distribution } = result[0];

  // Build distribution map 1-10
  const dist = {};
  for (let i = 1; i <= 10; i++) dist[i] = 0;
  distribution.forEach((r) => { dist[r] = (dist[r] || 0) + 1; });

  return {
    average: Math.round(average * 10) / 10,
    count,
    distribution: dist,
  };
};

module.exports = { getCommunityRating };
