import React from 'react'
import { Star, Users, BarChart3 } from 'lucide-react'
import { formatNumber, formatRating } from '../../utils/helpers'

/**
 * RatingDistribution component
 * Displays a pure CSS 1-10 rating breakdown with yellow progress bars,
 * count labels, community average, and total ratings count.
 *
 * @param {Object} props
 * @param {Object} [props.distribution={}] - Distribution map { 1: count, 2: count, ..., 10: count }
 * @param {number|null} [props.average=null] - Average community score (0-10)
 * @param {number} [props.count=0] - Total number of community ratings
 * @param {string} [props.className=''] - Additional custom CSS classes
 */
const RatingDistribution = ({
  distribution = {},
  average = null,
  count = 0,
  className = '',
}) => {
  // Normalize distribution into a full 1-10 map
  const distMap = {}
  for (let i = 1; i <= 10; i++) {
    distMap[i] = Number(distribution?.[i] ?? distribution?.[String(i)] ?? 0)
  }

  const totalCount = count || Object.values(distMap).reduce((sum, val) => sum + val, 0)
  const maxCountInBucket = Math.max(...Object.values(distMap), 1)
  const hasRatings = totalCount > 0

  // Formatted average
  const displayAvg = average !== null && average !== undefined && hasRatings
    ? formatRating(average)
    : '—'

  return (
    <div
      className={`bg-cs-card border border-cs-border rounded-2xl p-5 md:p-6 shadow-cs ${className}`}
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cs-accent" />
          <h3 className="text-base md:text-lg font-bold text-cs-text tracking-tight">
            Rating Distribution
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-cs-text-secondary bg-cs-bg-secondary/70 border border-cs-border/60 px-2.5 py-1 rounded-full">
          <Users size={12} className="text-cs-accent" />
          <span>{hasRatings ? `${formatNumber(totalCount)} ratings` : '0 ratings'}</span>
        </div>
      </div>

      {/* Summary Score Card */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center mb-6 p-4 rounded-xl bg-cs-bg-secondary/60 border border-cs-border/60">
        <div className="sm:col-span-4 flex flex-col items-center sm:items-start justify-center border-b sm:border-b-0 sm:border-r border-cs-border/60 pb-4 sm:pb-0 sm:pr-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl sm:text-5xl font-black text-cs-text tracking-tighter">
              {displayAvg}
            </span>
            <span className="text-sm font-semibold text-cs-text-secondary">/ 10</span>
          </div>

          <div className="flex items-center gap-1 mt-1.5 text-cs-accent">
            {[1, 2, 3, 4, 5].map((starIdx) => {
              const starRating = average ? (average / 2) : 0
              const isFilled = starIdx <= Math.round(starRating)
              return (
                <Star
                  key={starIdx}
                  size={16}
                  className={
                    isFilled && hasRatings
                      ? 'fill-cs-accent text-cs-accent'
                      : 'text-cs-border fill-transparent'
                  }
                />
              )
            })}
          </div>

          <p className="text-xs text-cs-text-secondary mt-1.5 font-medium text-center sm:text-left">
            {hasRatings
              ? `Based on ${formatNumber(totalCount)} CineScope votes`
              : 'No community ratings yet'}
          </p>
        </div>

        {/* Quick highlight stat */}
        <div className="sm:col-span-8 flex flex-col justify-center gap-1 text-xs text-cs-text-secondary">
          {hasRatings ? (
            <p className="leading-relaxed">
              Community ratings reflect votes submitted by verified CineScope users. Explore the 1 to 10
              breakdown below to see how viewers feel about this title.
            </p>
          ) : (
            <p className="leading-relaxed text-cs-text-secondary/70 italic">
              Be the first user to share your rating and help calibrate the CineScope community score!
            </p>
          )}
        </div>
      </div>

      {/* CSS Bar Chart (10 down to 1) */}
      <div className="space-y-2">
        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((score) => {
          const bucketCount = distMap[score] || 0
          // Width scaled to max bucket for clear visual contrast
          const barWidthPercent = hasRatings && maxCountInBucket > 0
            ? Math.round((bucketCount / maxCountInBucket) * 100)
            : 0

          // True percentage of total votes
          const sharePercent = totalCount > 0
            ? Math.round((bucketCount / totalCount) * 100)
            : 0

          return (
            <div
              key={score}
              className="group flex items-center gap-2.5 text-xs text-cs-text-secondary hover:text-cs-text transition-colors py-0.5"
            >
              {/* Star / Number label */}
              <div className="w-10 sm:w-12 flex items-center justify-end gap-1 shrink-0 font-medium">
                <span className="tabular-nums font-bold text-cs-text">{score}</span>
                <Star size={11} className="fill-cs-accent text-cs-accent shrink-0" />
              </div>

              {/* Bar track and fill */}
              <div
                className="flex-1 bg-cs-bg-secondary h-3 sm:h-3.5 rounded-full overflow-hidden border border-cs-border/40 relative shadow-inner"
                title={`${score} stars: ${formatNumber(bucketCount)} (${sharePercent}%)`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-amber-400 to-cs-accent transition-all duration-700 ease-out group-hover:brightness-110 shadow-sm"
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>

              {/* Bucket Count & Percent */}
              <div className="w-16 sm:w-20 text-right shrink-0 tabular-nums">
                <span className="font-semibold text-cs-text">{formatNumber(bucketCount)}</span>
                <span className="text-[10px] text-cs-text-secondary ml-1 font-normal opacity-70">
                  ({sharePercent}%)
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RatingDistribution
