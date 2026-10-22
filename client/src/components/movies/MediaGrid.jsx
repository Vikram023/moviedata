import React from 'react'
import { Film, SearchX, Clapperboard } from 'lucide-react'
import MovieCard from './MovieCard'
import TVShowCard from './TVShowCard'
import SkeletonCard from './SkeletonCard'

/**
 * MediaGrid component
 * Responsive grid displaying a collection of MovieCard and/or TVShowCard items.
 *
 * @param {Object} props
 * @param {Array} props.items - Array of TMDB movie/TV objects
 * @param {'movie'|'tv'|'mixed'} [props.mediaType='movie'] - Media category
 * @param {boolean} [props.loading=false] - Whether items are loading
 * @param {number|string} [props.columns] - Number of columns or custom column class
 * @param {number} [props.skeletonCount=12] - Number of skeleton cards while loading
 * @param {string} [props.emptyTitle='No titles found'] - Empty state headline
 * @param {string} [props.emptyMessage='Try adjusting your search criteria or filters.'] - Empty state description
 * @param {React.ReactNode} [props.emptyAction] - Optional button/action in empty state
 * @param {boolean} [props.showRating=true] - Whether to show rating badges
 * @param {boolean} [props.showType=false] - Whether to show media type badges
 * @param {string} [props.className=''] - Additional CSS classes
 */
const MediaGrid = ({
  items = [],
  mediaType = 'movie',
  loading = false,
  columns,
  skeletonCount = 12,
  emptyTitle = 'No titles found',
  emptyMessage = 'Try adjusting your search criteria or filters to explore more movies & shows.',
  emptyAction,
  showRating = true,
  showType,
  className = '',
}) => {
  // Resolve grid columns layout class
  const getGridColsClass = () => {
    if (typeof columns === 'string') return columns
    switch (columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6'
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6'
      case 4:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'
      case 5:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6'
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6'
      default:
        // Default responsive grid: 2 col on mobile, up to 6 on xl
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6'
    }
  }

  // Helper to determine if an item is a TV show
  const isTVShow = (item) => {
    if (mediaType === 'tv') return true
    if (mediaType === 'movie') return false
    // For 'mixed' media type
    return (
      item.media_type === 'tv' ||
      Boolean(item.first_air_date) ||
      (Boolean(item.name) && !item.title)
    )
  }

  // 1. Loading State
  if (loading) {
    return (
      <div
        className={`grid ${getGridColsClass()} ${className}`}
        aria-busy="true"
        aria-label="Loading media grid"
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} size="full" />
        ))}
      </div>
    )
  }

  // 2. Empty State
  if (!items || items.length === 0) {
    return (
      <div
        className={`w-full py-16 px-4 flex flex-col items-center justify-center text-center bg-cs-card/40 rounded-2xl border border-cs-border/60 ${className}`}
      >
        <div className="w-16 h-16 rounded-2xl bg-cs-bg-secondary flex items-center justify-center mb-4 border border-cs-border text-cs-text-secondary shadow-cs">
          <Clapperboard size={32} className="stroke-[1.5] text-cs-accent/70" />
        </div>
        <h3 className="text-xl font-bold text-cs-text mb-2">{emptyTitle}</h3>
        <p className="text-sm text-cs-text-secondary max-w-md mb-6 leading-relaxed">
          {emptyMessage}
        </p>
        {emptyAction && <div className="mt-2">{emptyAction}</div>}
      </div>
    )
  }

  // 3. Media Grid
  return (
    <div className={`grid ${getGridColsClass()} ${className}`}>
      {items.map((item, index) => {
        const isTV = isTVShow(item)
        const key = item.id || item.tmdbId || item._id || `item-${index}`

        return isTV ? (
          <TVShowCard
            key={`tv-${key}`}
            tv={item}
            showRating={showRating}
            showType={showType ?? (mediaType === 'mixed')}
            size="full"
          />
        ) : (
          <MovieCard
            key={`movie-${key}`}
            movie={item}
            showRating={showRating}
            showType={showType ?? (mediaType === 'mixed')}
            size="full"
          />
        )
      })}
    </div>
  )
}

export default MediaGrid
