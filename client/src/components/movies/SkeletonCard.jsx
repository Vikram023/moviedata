import React from 'react'

/**
 * SkeletonCard component
 * Animated skeleton placeholder matching MovieCard / TVShowCard dimensions.
 * Uses CineScope dark theme shimmer gradient.
 *
 * @param {Object} props
 * @param {'sm'|'md'|'lg'|'full'} [props.size='md'] - Card width sizing
 * @param {boolean} [props.hasDetails=true] - Whether to show title & metadata placeholder rows
 * @param {string} [props.className=''] - Additional CSS classes
 */
const SkeletonCard = ({
  size = 'md',
  hasDetails = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-[140px] sm:w-[155px]',
    md: 'w-[165px] sm:w-[190px]',
    lg: 'w-[210px] sm:w-[240px]',
    full: 'w-full',
  }

  const containerWidth = sizeClasses[size] || sizeClasses.md

  return (
    <div
      className={`flex flex-col shrink-0 select-none ${containerWidth} ${className}`}
      aria-hidden="true"
    >
      {/* Poster placeholder */}
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-cs-card border border-cs-border/60 shadow-md">
        {/* Shimmer gradient */}
        <div className="absolute inset-0 skeleton" />

        {/* Top-right badge skeleton placeholder */}
        <div className="absolute top-2.5 right-2.5 w-12 h-5 rounded-md bg-cs-bg-secondary/80 border border-white/5 animate-pulse" />

        {/* Bottom subtle gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-cs-card to-transparent pointer-events-none opacity-50" />
      </div>

      {/* Details skeleton (Title & Year/Rating row) */}
      {hasDetails && (
        <div className="pt-3 px-0.5 space-y-2">
          {/* Title line */}
          <div className="h-4 rounded bg-cs-card skeleton w-5/6" />

          {/* Subtitle / Year & Rating line */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="h-3 rounded bg-cs-card skeleton w-1/3" />
            <div className="h-3 rounded bg-cs-card skeleton w-1/4" />
          </div>
        </div>
      )}
    </div>
  )
}

export default SkeletonCard
